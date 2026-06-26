import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ContentPayload = {
  profile: Record<string, unknown>;
  sections: Record<string, unknown>[];
  settings: Record<string, unknown>[];
  metrics: Record<string, unknown>[];
  skills: Record<string, unknown>[];
  experience: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  achievements: Record<string, unknown>[];
  education: Record<string, unknown>[];
};

const collectionTables = [
  "metrics",
  "skills",
  "experience",
  "projects",
  "achievements",
  "education",
] as const;

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmails = (process.env.CMS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!url || !anonKey || !serviceRoleKey || adminEmails.length === 0) {
    return null;
  }

  return { url, anonKey, serviceRoleKey, adminEmails };
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function authenticate(request: NextRequest) {
  const config = getConfig();

  if (!config) {
    return { error: jsonError("CMS environment is incomplete.", 500) };
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return { error: jsonError("Missing Supabase access token.", 401) };
  }

  const authClient = createClient(config.url, config.anonKey);
  const { data, error } = await authClient.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();

  if (error || !email) {
    return { error: jsonError("Invalid Supabase session.", 401) };
  }

  if (!config.adminEmails.includes(email)) {
    return { error: jsonError("This user is not a CMS admin.", 403) };
  }

  return {
    config,
    supabase: createClient(config.url, config.serviceRoleKey),
  };
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);

  if ("error" in auth) {
    return auth.error;
  }

  try {
    const { supabase } = auth;
    const readTable = async (table: string, orderColumn: string) => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderColumn, { ascending: true });

      if (error) {
        throw error;
      }

      return data ?? [];
    };

    const { data: profileRows, error: profileError } = await supabase
      .from("profile")
      .select("*")
      .eq("slug", "main")
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

    return NextResponse.json({
      profile: profileRows?.[0] ?? {},
      sections,
      settings,
      metrics,
      skills,
      experience,
      projects,
      achievements,
      education,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to load CMS content.",
      500
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await authenticate(request);

  if ("error" in auth) {
    return auth.error;
  }

  try {
    const content = (await request.json()) as ContentPayload;
    const { supabase } = auth;
    const replaceCollection = async (
      table: (typeof collectionTables)[number],
      rows: Record<string, unknown>[]
    ) => {
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) {
        throw deleteError;
      }

      if (rows.length === 0) {
        return;
      }

      const { error: insertError } = await supabase.from(table).insert(rows);

      if (insertError) {
        throw insertError;
      }
    };

    const { error: profileError } = await supabase
      .from("profile")
      .upsert(
        {
          ...content.profile,
          slug: "main",
        },
        { onConflict: "slug" }
      );

    if (profileError) {
      throw profileError;
    }

    const { error: sectionsError } = await supabase
      .from("sections")
      .upsert(content.sections);

    if (sectionsError) {
      throw sectionsError;
    }

    const { error: settingsError } = await supabase
      .from("settings")
      .upsert(content.settings);

    if (settingsError) {
      throw settingsError;
    }

    for (const table of collectionTables) {
      await replaceCollection(table, content[table]);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to save CMS content.",
      500
    );
  }
}
