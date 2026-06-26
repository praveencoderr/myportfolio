export type PortfolioStatus = "draft" | "published";
export type DomainStatus = "unconfigured" | "pending" | "verified" | "error";

export type PortfolioRecord = {
  id: string;
  owner_id: string | null;
  slug: string;
  title: string;
  status: PortfolioStatus;
  custom_domain: string | null;
  domain_status: DomainStatus;
  domain_instructions: Record<string, unknown>;
  published_at: string | null;
};

export type ContentPayload = {
  portfolio?: PortfolioRecord;
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

export type ContentCollection =
  | "metrics"
  | "skills"
  | "experience"
  | "projects"
  | "achievements"
  | "education";

export const collectionTables: ContentCollection[] = [
  "metrics",
  "skills",
  "experience",
  "projects",
  "achievements",
  "education",
];

export const contentTables = [
  "profile",
  "sections",
  "settings",
  ...collectionTables,
] as const;

export const defaultPortfolioId = "00000000-0000-0000-0000-000000000001";
export const defaultPortfolioSlug = "praveen-gupta";
