export type CmsStatus = "ready" | "missing-env" | "fetch-error" | "empty";

export type NavItem = {
  name: string;
  link: string;
};

export type Profile = {
  full_name: string;
  role: string;
  location: string | null;
  email: string | null;
  phone: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  leetcode_url: string | null;
  summary: string | null;
};

export type SectionContent = {
  key: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
};

export type Metric = {
  id: string;
  value: string;
  label: string;
  href: string | null;
};

export type Skill = {
  id: string;
  category: string;
  name: string;
  featured: boolean;
};

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  location: string | null;
  employment_type: string | null;
  period: string | null;
  summary: string | null;
  bullets: string[];
  tech: string[];
  thumbnail: string | null;
};

export type Project = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  icon_list: string[];
  tech: string[];
  live_url: string | null;
  code_url: string | null;
  case_study_url: string | null;
  featured: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string | null;
  href: string | null;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  location: string | null;
  period: string | null;
};

export type BuildStep = {
  title: string;
  description: string;
};

export type SettingsMap = {
  nav_items?: NavItem[];
  resume_url?: string;
  whatsapp_phone?: string;
  whatsapp_message?: string;
  build_steps?: BuildStep[];
};

export type PortfolioContent = {
  profile: Profile;
  sections: Record<string, SectionContent>;
  settings: SettingsMap;
  metrics: Metric[];
  skills: Skill[];
  experience: ExperienceItem[];
  projects: Project[];
  achievements: Achievement[];
  education: Education[];
  navItems: NavItem[];
};

export type CmsResult =
  | { status: "ready"; content: PortfolioContent }
  | { status: Exclude<CmsStatus, "ready">; message: string };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function normalizeUrl(url: string) {
  return url.replace(/\/$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNavItems(value: unknown): value is NavItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.name === "string" &&
        typeof item.link === "string"
    )
  );
}

function isBuildSteps(value: unknown): value is BuildStep[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.title === "string" &&
        typeof item.description === "string"
    )
  );
}

async function readTable<T>(table: string, query: string): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase env vars");
  }

  const response = await fetch(
    `${normalizeUrl(SUPABASE_URL)}/rest/v1/${table}?${query}`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    throw new Error(`${table} read failed with ${response.status}`);
  }

  return response.json();
}

function mapSettings(
  rows: Array<{ key: string; value: unknown }>
): SettingsMap {
  return rows.reduce<SettingsMap>((settings, row) => {
    if (row.key === "nav_items" && isNavItems(row.value)) {
      settings.nav_items = row.value;
    }

    if (row.key === "resume_url" && typeof row.value === "string") {
      settings.resume_url = row.value;
    }

    if (row.key === "whatsapp_phone" && typeof row.value === "string") {
      settings.whatsapp_phone = row.value;
    }

    if (row.key === "whatsapp_message" && typeof row.value === "string") {
      settings.whatsapp_message = row.value;
    }

    if (row.key === "build_steps" && isBuildSteps(row.value)) {
      settings.build_steps = row.value;
    }

    return settings;
  }, {});
}

function mapSections(rows: SectionContent[]) {
  return rows.reduce<Record<string, SectionContent>>((sections, section) => {
    sections[section.key] = section;
    return sections;
  }, {});
}

export async function getPortfolioContent(): Promise<CmsResult> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {
      status: "missing-env",
      message:
        "CMS is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to load portfolio content.",
    };
  }

  try {
    const [
      profileRows,
      sectionRows,
      settingRows,
      metrics,
      skills,
      experience,
      projects,
      achievements,
      education,
    ] = await Promise.all([
      readTable<Profile>(
        "profile",
        "select=full_name,role,location,email,phone,portfolio_url,github_url,linkedin_url,leetcode_url,summary&slug=eq.main&published=eq.true&limit=1"
      ),
      readTable<SectionContent>(
        "sections",
        "select=key,eyebrow,title,description&published=eq.true&order=key.asc"
      ),
      readTable<{ key: string; value: unknown }>(
        "settings",
        "select=key,value&published=eq.true&order=key.asc"
      ),
      readTable<Metric>(
        "metrics",
        "select=id,value,label,href&published=eq.true&order=sort_order.asc,label.asc"
      ),
      readTable<Skill>(
        "skills",
        "select=id,category,name,featured&published=eq.true&order=category.asc,sort_order.asc,name.asc"
      ),
      readTable<ExperienceItem>(
        "experience",
        "select=id,role,company,location,employment_type,period,summary,bullets,tech,thumbnail&published=eq.true&order=sort_order.asc,company.asc"
      ),
      readTable<Project>(
        "projects",
        "select=id,title,subtitle,description,image,icon_list,tech,live_url,code_url,case_study_url,featured&published=eq.true&order=sort_order.asc,title.asc"
      ),
      readTable<Achievement>(
        "achievements",
        "select=id,title,description,href&published=eq.true&order=sort_order.asc,title.asc"
      ),
      readTable<Education>(
        "education",
        "select=id,institution,degree,location,period&published=eq.true&order=sort_order.asc,institution.asc"
      ),
    ]);

    const profile = profileRows[0];

    if (!profile) {
      return {
        status: "empty",
        message: "CMS is connected, but no published profile was found.",
      };
    }

    const settings = mapSettings(settingRows);
    const sections = mapSections(sectionRows);

    return {
      status: "ready",
      content: {
        profile,
        sections,
        settings,
        metrics,
        skills,
        experience,
        projects,
        achievements,
        education,
        navItems: settings.nav_items ?? [],
      },
    };
  } catch (error) {
    return {
      status: "fetch-error",
      message:
        error instanceof Error
          ? error.message
          : "Portfolio CMS content could not be loaded.",
    };
  }
}
