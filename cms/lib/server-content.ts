import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import {
  collectionTables,
  defaultPortfolioId,
  defaultPortfolioSlug,
  type ContentCollection,
  type ContentPayload,
  type PortfolioRecord,
} from "@/lib/content-types";

type CmsConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  adminEmails: string[];
};

export type AuthContext = {
  config: CmsConfig;
  supabase: SupabaseClient;
  user: User;
  isAdmin: boolean;
};

export type OptionalAuthContext = {
  config: CmsConfig;
  supabase: SupabaseClient;
  user: User | null;
  isAdmin: boolean;
};

export function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmails = (process.env.CMS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!url || !anonKey || !serviceRoleKey) {
    return null;
  }

  return { url, anonKey, serviceRoleKey, adminEmails };
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function createServiceClient(config: CmsConfig) {
  return createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function getBearerToken(request: NextRequest) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
}

export async function getOptionalAuth(
  request: NextRequest
): Promise<OptionalAuthContext | { error: NextResponse }> {
  const config = getConfig();

  if (!config) {
    return { error: jsonError("CMS environment is incomplete.", 500) };
  }

  const token = getBearerToken(request);
  const supabase = createServiceClient(config);

  if (!token) {
    return { config, supabase, user: null, isAdmin: false };
  }

  const authClient = createClient(config.url, config.anonKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();

  if (error || !data.user || !email) {
    return { error: jsonError("Invalid Supabase session.", 401) };
  }

  return {
    config,
    supabase,
    user: data.user,
    isAdmin: config.adminEmails.includes(email),
  };
}

export async function requireAuth(
  request: NextRequest
): Promise<AuthContext | { error: NextResponse }> {
  const auth = await getOptionalAuth(request);

  if ("error" in auth) {
    return auth;
  }

  if (!auth.user) {
    return { error: jsonError("Sign in before continuing.", 401) };
  }

  return auth as AuthContext;
}

export function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);

  return slug || "portfolio";
}

export function publicPortfolioUrl(slug: string) {
  const baseUrl =
    process.env.PORTFOLIO_BASE_URL ?? process.env.NEXT_PUBLIC_PORTFOLIO_BASE_URL;

  if (!baseUrl) {
    return `/p/${slug}`;
  }

  return `${baseUrl.replace(/\/$/, "")}/p/${slug}`;
}

async function uniqueSlug(
  supabase: SupabaseClient,
  preferredSlug: string,
  portfolioId?: string
) {
  const base = slugify(preferredSlug);

  for (let index = 0; index < 50; index += 1) {
    const slug = index === 0 ? base : `${base}-${index + 1}`;
    const { data, error } = await supabase
      .from("portfolios")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data || data.id === portfolioId) {
      return slug;
    }
  }

  return `${base}-${Date.now().toString(36)}`;
}

function cleanRecord(
  record: Record<string, unknown>,
  portfolioId: string,
  options: { preserveId?: boolean } = {}
) {
  const next: Record<string, unknown> = { ...record, portfolio_id: portfolioId };

  delete next.created_at;
  delete next.updated_at;

  if (!options.preserveId || next.id === "") {
    delete next.id;
  }

  return next;
}

export async function userCanManagePortfolio(
  supabase: SupabaseClient,
  portfolioId: string,
  user: User,
  isAdmin: boolean
) {
  if (isAdmin) {
    return true;
  }

  const { data, error } = await supabase
    .from("portfolios")
    .select("id")
    .eq("id", portfolioId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function findPortfolio(
  supabase: SupabaseClient,
  options: {
    portfolioId?: string | null;
    slug?: string | null;
    user?: User | null;
    isAdmin?: boolean;
  }
) {
  let query = supabase.from("portfolios").select("*");

  if (options.portfolioId) {
    query = query.eq("id", options.portfolioId);
  } else if (options.slug) {
    query = query.eq("slug", options.slug);
  } else if (options.user) {
    query = query.eq("owner_id", options.user.id).order("created_at", {
      ascending: true,
    });
  } else {
    query = query.eq("slug", defaultPortfolioSlug);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    throw error;
  }

  const portfolio = data?.[0] as PortfolioRecord | undefined;

  if (!portfolio) {
    return null;
  }

  if (
    portfolio.status !== "published" &&
    (!options.user ||
      (!options.isAdmin && portfolio.owner_id !== options.user.id))
  ) {
    return null;
  }

  return portfolio;
}

export async function readContent(
  supabase: SupabaseClient,
  options: {
    portfolioId?: string | null;
    slug?: string | null;
    user?: User | null;
    isAdmin?: boolean;
  } = {}
): Promise<ContentPayload> {
  const portfolio =
    (await findPortfolio(supabase, options)) ??
    (await findPortfolio(supabase, { slug: defaultPortfolioSlug }));

  if (!portfolio) {
    throw new Error("No portfolio content was found.");
  }

  const canManage =
    options.user &&
    (options.isAdmin || portfolio.owner_id === options.user.id);
  const readTable = async (table: string, orderColumn: string) => {
    let query = supabase
      .from(table)
      .select("*")
      .eq("portfolio_id", portfolio.id)
      .order(orderColumn, { ascending: true });

    if (!canManage) {
      query = query.eq("published", true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data ?? [];
  };

  const { data: profileRows, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("portfolio_id", portfolio.id)
    .limit(1);

  if (profileError) {
    throw profileError;
  }

  const [
    sections,
    settings,
    metrics,
    skills,
    experience,
    projects,
    achievements,
    education,
  ] = await Promise.all([
    readTable("sections", "key"),
    readTable("settings", "key"),
    readTable("metrics", "sort_order"),
    readTable("skills", "sort_order"),
    readTable("experience", "sort_order"),
    readTable("projects", "sort_order"),
    readTable("achievements", "sort_order"),
    readTable("education", "sort_order"),
  ]);

  return {
    portfolio,
    profile: profileRows?.[0] ?? {},
    sections,
    settings,
    metrics,
    skills,
    experience,
    projects,
    achievements,
    education,
  };
}

export async function saveContent(
  supabase: SupabaseClient,
  portfolioId: string,
  content: ContentPayload
) {
  const replaceCollection = async (
    table: ContentCollection,
    rows: Record<string, unknown>[]
  ) => {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq("portfolio_id", portfolioId);

    if (deleteError) {
      throw deleteError;
    }

    if (rows.length === 0) {
      return;
    }

    const { error: insertError } = await supabase
      .from(table)
      .insert(rows.map((row) => cleanRecord(row, portfolioId)));

    if (insertError) {
      throw insertError;
    }
  };

  const { error: profileError } = await supabase.from("profile").upsert(
    {
      ...cleanRecord(content.profile, portfolioId, { preserveId: true }),
      slug: "main",
    },
    { onConflict: "portfolio_id" }
  );

  if (profileError) {
    throw profileError;
  }

  const { error: sectionsError } = await supabase
    .from("sections")
    .upsert(
      content.sections.map((row) => cleanRecord(row, portfolioId)),
      { onConflict: "portfolio_id,key" }
    );

  if (sectionsError) {
    throw sectionsError;
  }

  const { error: settingsError } = await supabase
    .from("settings")
    .upsert(
      content.settings.map((row) => cleanRecord(row, portfolioId)),
      { onConflict: "portfolio_id,key" }
    );

  if (settingsError) {
    throw settingsError;
  }

  for (const table of collectionTables) {
    await replaceCollection(table, content[table]);
  }
}

export async function ensureUserPortfolio(
  supabase: SupabaseClient,
  user: User,
  options: { publish?: boolean; title?: string; slug?: string } = {}
) {
  const { data: existing, error: existingError } = await supabase
    .from("portfolios")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (existingError) {
    throw existingError;
  }

  let portfolio = existing?.[0] as PortfolioRecord | undefined;

  if (!portfolio) {
    const template = await readContent(supabase, { slug: defaultPortfolioSlug });
    const fallbackName = user.email?.split("@")[0] ?? "portfolio";
    const title = options.title ?? `${fallbackName}'s Portfolio`;
    const slug = await uniqueSlug(supabase, options.slug ?? title);
    const { data, error } = await supabase
      .from("portfolios")
      .insert({
        owner_id: user.id,
        slug,
        title,
        status: "draft",
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    portfolio = data as PortfolioRecord;
    await saveContent(supabase, portfolio.id, {
      ...template,
      profile: {
        ...template.profile,
        email: user.email ?? template.profile.email,
        full_name:
          typeof template.profile.full_name === "string"
            ? template.profile.full_name
            : fallbackName,
      },
    });
  }

  if (options.publish) {
    const preferredSlug =
      options.slug ??
      (typeof options.title === "string" ? options.title : portfolio.slug);
    const slug = await uniqueSlug(supabase, preferredSlug, portfolio.id);
    const { data, error } = await supabase
      .from("portfolios")
      .update({
        slug,
        title: options.title ?? portfolio.title,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", portfolio.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    portfolio = data as PortfolioRecord;
  }

  return {
    portfolio,
    url: publicPortfolioUrl(portfolio.slug),
  };
}
