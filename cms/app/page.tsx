"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Globe2,
  Loader2,
  LogOut,
  Mail,
  Rocket,
  Save,
  Upload,
} from "lucide-react";

import { getBrowserSupabase } from "@/lib/supabase-browser";
import type { ContentPayload, PortfolioRecord } from "@/lib/content-types";

type EditorKey =
  | "profile"
  | "sections"
  | "settings"
  | "metrics"
  | "skills"
  | "experience"
  | "projects"
  | "achievements"
  | "education"
  | "deploy"
  | "advanced";

type JsonRecord = Record<string, any>;

const editorKeys: Array<{ key: EditorKey; label: string }> = [
  { key: "profile", label: "Profile" },
  { key: "sections", label: "Sections" },
  { key: "settings", label: "Settings" },
  { key: "metrics", label: "Metrics" },
  { key: "skills", label: "Skills" },
  { key: "experience", label: "Experience" },
  { key: "projects", label: "Projects" },
  { key: "achievements", label: "Achievements" },
  { key: "education", label: "Education" },
  { key: "deploy", label: "Deploy" },
  { key: "advanced", label: "Advanced JSON" },
];

const collectionKeys = [
  "metrics",
  "skills",
  "experience",
  "projects",
  "achievements",
  "education",
] as const;

const emptyContent: ContentPayload = {
  profile: {},
  sections: [],
  settings: [],
  metrics: [],
  skills: [],
  experience: [],
  projects: [],
  achievements: [],
  education: [],
};

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function asArray(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? (value as JsonRecord[]) : [];
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function normalizeContent(payload: Partial<ContentPayload>): ContentPayload {
  return {
    portfolio: payload.portfolio,
    profile: asRecord(payload.profile),
    sections: asArray(payload.sections),
    settings: asArray(payload.settings),
    metrics: asArray(payload.metrics),
    skills: asArray(payload.skills),
    experience: asArray(payload.experience),
    projects: asArray(payload.projects),
    achievements: asArray(payload.achievements),
    education: asArray(payload.education),
  };
}

function textValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function boolValue(value: unknown) {
  return typeof value === "boolean" ? value : Boolean(value);
}

function splitLines(value: unknown) {
  if (Array.isArray(value)) {
    return value.join("\n");
  }

  return textValue(value);
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function settingValue(settings: JsonRecord[], key: string) {
  return settings.find((item) => item.key === key)?.value;
}

function setSettingValue(
  settings: JsonRecord[],
  key: string,
  value: unknown
) {
  const index = settings.findIndex((item) => item.key === key);
  const row = { key, value, published: true };

  if (index === -1) {
    return [...settings, row];
  }

  return settings.map((item, itemIndex) =>
    itemIndex === index ? { ...item, value } : item
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  const className =
    "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40";

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
          className={className}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={className}
        />
      )}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-cyan-200"
      />
      {label}
    </label>
  );
}

export default function CmsPage() {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<ContentPayload>(emptyContent);
  const [activeKey, setActiveKey] = useState<EditorKey>("profile");
  const [status, setStatus] = useState("Loading current portfolio...");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [domain, setDomain] = useState("");
  const [advancedJson, setAdvancedJson] = useState(formatJson(emptyContent));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    async function loadPublicTemplate() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/content?slug=praveen-gupta");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load content.");
        }

        const nextContent = normalizeContent(payload);
        setContent(nextContent);
        setAdvancedJson(formatJson(nextContent));
        setPortfolioUrl(
          nextContent.portfolio?.slug ? `/p/${nextContent.portfolio.slug}` : ""
        );
        setStatus("Current portfolio loaded. Sign in to save changes.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Load failed.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPublicTemplate();
  }, []);

  useEffect(() => {
    const accessToken = session?.access_token;

    if (!accessToken) {
      return;
    }

    async function loadWorkspace() {
      setIsLoading(true);
      setStatus("Loading your portfolio workspace...");

      try {
        const response = await fetch("/api/portfolio/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load workspace.");
        }

        const nextContent = normalizeContent(payload.content);
        setContent(nextContent);
        setAdvancedJson(formatJson(nextContent));
        setPortfolioUrl(payload.url ?? "");
        setDomain(nextContent.portfolio?.custom_domain ?? "");
        setStatus("Workspace loaded.");
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "Workspace load failed."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkspace();
  }, [session]);

  function updateProfile(key: string, value: unknown) {
    setContent((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [key]: value,
      },
    }));
  }

  function updateRow(
    key: Exclude<EditorKey, "profile" | "deploy" | "advanced">,
    index: number,
    field: string,
    value: unknown
  ) {
    setContent((current) => ({
      ...current,
      [key]: asArray(current[key]).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addRow(key: (typeof collectionKeys)[number], row: JsonRecord) {
    setContent((current) => ({
      ...current,
      [key]: [...asArray(current[key]), row],
    }));
  }

  function removeRow(key: (typeof collectionKeys)[number], index: number) {
    setContent((current) => ({
      ...current,
      [key]: asArray(current[key]).filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function signInWithGoogle() {
    if (!supabase) {
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  async function submitEmailPassword() {
    if (!supabase || !email || !password) {
      return;
    }

    setIsLoading(true);
    const auth =
      authMode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });

    setIsLoading(false);
    setStatus(
      auth.error
        ? auth.error.message
        : authMode === "signup"
        ? "Account created. Check email if confirmation is required."
        : "Signed in."
    );
  }

  async function sendMagicLink() {
    if (!supabase || !email) {
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setIsLoading(false);
    setStatus(error ? error.message : "Check your email for the sign-in link.");
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setSession(null);
    setStatus("Signed out. Current published portfolio remains visible.");
  }

  async function saveContent() {
    if (!session?.access_token || !content.portfolio?.id) {
      setStatus("Sign in before saving.");
      return;
    }

    setIsSaving(true);
    setStatus("Saving content...");

    try {
      const response = await fetch(
        `/api/content?portfolioId=${content.portfolio.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(content),
        }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Save failed.");
      }

      setAdvancedJson(formatJson(content));
      setStatus("Content saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function publishPortfolio() {
    if (!session?.access_token) {
      setStatus("Sign in before publishing.");
      return;
    }

    await saveContent();
    setIsSaving(true);
    setStatus("Publishing portfolio...");

    try {
      const title =
        textValue(content.profile.full_name) || content.portfolio?.title;
      const response = await fetch("/api/portfolio/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          publish: true,
          title: title ? `${title} Portfolio` : undefined,
          slug: title,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Publish failed.");
      }

      const nextContent = normalizeContent(payload.content);
      setContent(nextContent);
      setPortfolioUrl(payload.url ?? "");
      setAdvancedJson(formatJson(nextContent));
      setStatus("Portfolio published.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Publish failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function parseResume(file: File | null) {
    if (!file || !session?.access_token) {
      setStatus("Sign in before importing a resume.");
      return;
    }

    setIsParsingResume(true);
    setStatus("Parsing resume...");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      const response = await fetch("/api/resume/parse", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Resume parse failed.");
      }

      const extracted = payload.extracted ?? {};
      setContent((current) => ({
        ...current,
        profile: {
          ...current.profile,
          ...asRecord(extracted.profile),
        },
        metrics: asArray(extracted.metrics).length
          ? asArray(extracted.metrics)
          : current.metrics,
        skills: asArray(extracted.skills).length
          ? asArray(extracted.skills)
          : current.skills,
        experience: asArray(extracted.experience).length
          ? asArray(extracted.experience)
          : current.experience,
        projects: asArray(extracted.projects).length
          ? asArray(extracted.projects)
          : current.projects,
        achievements: asArray(extracted.achievements).length
          ? asArray(extracted.achievements)
          : current.achievements,
        education: asArray(extracted.education).length
          ? asArray(extracted.education)
          : current.education,
      }));
      setStatus(
        payload.warning
          ? String(payload.warning)
          : payload.parser === "built-in"
          ? "Resume imported with the free built-in parser. Review before saving."
          : "Resume imported with AI. Review before saving."
      );
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Resume import failed."
      );
    } finally {
      setIsParsingResume(false);
    }
  }

  async function addDomain() {
    if (!session?.access_token || !content.portfolio?.id) {
      setStatus("Sign in before adding a domain.");
      return;
    }

    setIsSaving(true);
    setStatus("Adding domain...");

    try {
      const response = await fetch("/api/domain/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          portfolioId: content.portfolio.id,
          domain,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Domain setup failed.");
      }

      setContent((current) => ({
        ...current,
        portfolio: payload.portfolio as PortfolioRecord,
      }));
      setStatus(`Domain ${payload.status}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Domain setup failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function checkDomainStatus() {
    if (!session?.access_token || !content.portfolio?.id) {
      setStatus("Sign in before checking a domain.");
      return;
    }

    setIsSaving(true);
    setStatus("Checking domain...");

    try {
      const response = await fetch(
        `/api/domain/status?portfolioId=${content.portfolio.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Domain check failed.");
      }

      setContent((current) => ({
        ...current,
        portfolio: payload.portfolio as PortfolioRecord,
      }));
      setStatus(`Domain ${payload.status}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Domain check failed.");
    } finally {
      setIsSaving(false);
    }
  }

  function applyAdvancedJson() {
    try {
      const parsed = normalizeContent(JSON.parse(advancedJson));
      setContent(parsed);
      setStatus("Advanced JSON applied.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid JSON.");
    }
  }

  if (!supabase) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <section className="max-w-xl rounded-lg border border-amber-300/25 bg-amber-300/10 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">
            CMS configuration needed
          </p>
          <h1 className="mt-4 text-3xl font-bold">Supabase env vars missing.</h1>
          <p className="mt-4 leading-7 text-slate-300">
            Add `NEXT_PUBLIC_SUPABASE_URL` and
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` to run the CMS.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
                Portfolio CMS
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                {textValue(content.profile.full_name) ||
                  "Portfolio Content Workspace"}
              </h1>
              <p className="mt-2 min-h-5 text-sm text-slate-300">{status}</p>
            </div>

            <div className="flex flex-col gap-3">
              {session ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={saveContent}
                    disabled={isSaving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-200 px-4 text-sm font-semibold text-ink disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={publishPortfolio}
                    disabled={isSaving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 text-sm font-semibold text-ink disabled:opacity-60"
                  >
                    <Rocket className="h-4 w-4" />
                    Make Portfolio
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-semibold text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-[8rem_1fr_1fr] lg:min-w-[38rem]">
                  <select
                    value={authMode}
                    onChange={(event) =>
                      setAuthMode(event.target.value as "signin" | "signup")
                    }
                    className="h-11 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
                  >
                    <option value="signin">Sign in</option>
                    <option value="signup">Sign up</option>
                  </select>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="email"
                    className="h-11 rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    placeholder="password"
                    className="h-11 rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-semibold text-white"
                  >
                    <Globe2 className="h-4 w-4" />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={submitEmailPassword}
                    disabled={isLoading || !email || !password}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-200 px-4 text-sm font-semibold text-ink disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {authMode === "signin" ? "Continue" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={sendMagicLink}
                    disabled={isLoading || !email}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Magic link
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[16rem_1fr]">
          <nav className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            {editorKeys.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  if (item.key === "advanced") {
                    setAdvancedJson(formatJson(content));
                  }
                  setActiveKey(item.key);
                }}
                className={`mb-2 block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                  activeKey === item.key
                    ? "bg-cyan-200 text-ink"
                    : "text-slate-200 hover:bg-white/[0.06]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <section className="min-h-[38rem] rounded-lg border border-white/10 bg-[#05071a] p-4 md:p-5">
            {isLoading ? (
              <div className="flex min-h-[32rem] items-center justify-center text-slate-300">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading content
              </div>
            ) : (
              <>
                {activeKey === "profile" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      "full_name",
                      "role",
                      "location",
                      "email",
                      "phone",
                      "portfolio_url",
                      "github_url",
                      "linkedin_url",
                      "leetcode_url",
                      "gfg_url",
                    ].map((field) => (
                      <Field
                        key={field}
                        label={field.replace(/_/g, " ")}
                        value={textValue(content.profile[field])}
                        onChange={(value) => updateProfile(field, value)}
                      />
                    ))}
                    <div className="md:col-span-2">
                      <Field
                        label="summary"
                        value={textValue(content.profile.summary)}
                        onChange={(value) => updateProfile("summary", value)}
                        textarea
                      />
                    </div>
                  </div>
                )}

                {activeKey === "sections" && (
                  <div className="grid gap-4">
                    {content.sections.map((section, index) => (
                      <article
                        key={String(section.key ?? index)}
                        className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="grid gap-4 md:grid-cols-3">
                          <Field
                            label="key"
                            value={textValue(section.key)}
                            onChange={(value) =>
                              updateRow("sections", index, "key", value)
                            }
                          />
                          <Field
                            label="eyebrow"
                            value={textValue(section.eyebrow)}
                            onChange={(value) =>
                              updateRow("sections", index, "eyebrow", value)
                            }
                          />
                          <Field
                            label="title"
                            value={textValue(section.title)}
                            onChange={(value) =>
                              updateRow("sections", index, "title", value)
                            }
                          />
                        </div>
                        <div className="mt-4">
                          <Field
                            label="description"
                            value={textValue(section.description)}
                            onChange={(value) =>
                              updateRow("sections", index, "description", value)
                            }
                            textarea
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {activeKey === "settings" && (
                  <div className="grid gap-4">
                    <Field
                      label="resume url"
                      value={textValue(settingValue(content.settings, "resume_url"))}
                      onChange={(value) =>
                        setContent((current) => ({
                          ...current,
                          settings: setSettingValue(
                            current.settings,
                            "resume_url",
                            value
                          ),
                        }))
                      }
                    />
                    <Field
                      label="whatsapp phone"
                      value={textValue(
                        settingValue(content.settings, "whatsapp_phone")
                      )}
                      onChange={(value) =>
                        setContent((current) => ({
                          ...current,
                          settings: setSettingValue(
                            current.settings,
                            "whatsapp_phone",
                            value
                          ),
                        }))
                      }
                    />
                    <Field
                      label="whatsapp message"
                      value={textValue(
                        settingValue(content.settings, "whatsapp_message")
                      )}
                      onChange={(value) =>
                        setContent((current) => ({
                          ...current,
                          settings: setSettingValue(
                            current.settings,
                            "whatsapp_message",
                            value
                          ),
                        }))
                      }
                      textarea
                    />
                  </div>
                )}

                {activeKey === "metrics" && (
                  <CollectionEditor
                    rows={content.metrics}
                    fields={["value", "label", "href"]}
                    onUpdate={(index, field, value) =>
                      updateRow("metrics", index, field, value)
                    }
                    onAdd={() =>
                      addRow("metrics", {
                        value: "10+",
                        label: "Metric label",
                        href: "",
                        sort_order: content.metrics.length + 1,
                        published: true,
                      })
                    }
                    onRemove={(index) => removeRow("metrics", index)}
                  />
                )}

                {activeKey === "skills" && (
                  <CollectionEditor
                    rows={content.skills}
                    fields={["category", "name"]}
                    toggles={["featured", "published"]}
                    onUpdate={(index, field, value) =>
                      updateRow("skills", index, field, value)
                    }
                    onAdd={() =>
                      addRow("skills", {
                        category: "Frontend",
                        name: "React",
                        featured: true,
                        sort_order: content.skills.length + 1,
                        published: true,
                      })
                    }
                    onRemove={(index) => removeRow("skills", index)}
                  />
                )}

                {activeKey === "experience" && (
                  <CollectionEditor
                    rows={content.experience}
                    fields={["role", "company", "location", "period"]}
                    textareas={["summary", "bullets", "tech"]}
                    toggles={["published"]}
                    onUpdate={(index, field, value) =>
                      updateRow(
                        "experience",
                        index,
                        field,
                        field === "bullets" || field === "tech"
                          ? parseLines(String(value))
                          : value
                      )
                    }
                    onAdd={() =>
                      addRow("experience", {
                        role: "Role",
                        company: "Company",
                        location: "",
                        period: "",
                        summary: "",
                        bullets: [],
                        tech: [],
                        sort_order: content.experience.length + 1,
                        published: true,
                      })
                    }
                    onRemove={(index) => removeRow("experience", index)}
                  />
                )}

                {activeKey === "projects" && (
                  <CollectionEditor
                    rows={content.projects}
                    fields={[
                      "title",
                      "subtitle",
                      "image",
                      "live_url",
                      "code_url",
                      "case_study_url",
                    ]}
                    textareas={["description", "tech", "icon_list"]}
                    toggles={["featured", "published"]}
                    onUpdate={(index, field, value) =>
                      updateRow(
                        "projects",
                        index,
                        field,
                        field === "tech" || field === "icon_list"
                          ? parseLines(String(value))
                          : value
                      )
                    }
                    onAdd={() =>
                      addRow("projects", {
                        title: "Project",
                        subtitle: "",
                        description: "",
                        image: "/p1.svg",
                        icon_list: [],
                        tech: [],
                        live_url: "",
                        code_url: "",
                        case_study_url: "",
                        featured: false,
                        sort_order: content.projects.length + 1,
                        published: true,
                      })
                    }
                    onRemove={(index) => removeRow("projects", index)}
                  />
                )}

                {activeKey === "achievements" && (
                  <CollectionEditor
                    rows={content.achievements}
                    fields={["title", "href"]}
                    textareas={["description"]}
                    toggles={["published"]}
                    onUpdate={(index, field, value) =>
                      updateRow("achievements", index, field, value)
                    }
                    onAdd={() =>
                      addRow("achievements", {
                        title: "Achievement",
                        description: "",
                        href: "",
                        sort_order: content.achievements.length + 1,
                        published: true,
                      })
                    }
                    onRemove={(index) => removeRow("achievements", index)}
                  />
                )}

                {activeKey === "education" && (
                  <CollectionEditor
                    rows={content.education}
                    fields={["institution", "degree", "location", "period"]}
                    toggles={["published"]}
                    onUpdate={(index, field, value) =>
                      updateRow("education", index, field, value)
                    }
                    onAdd={() =>
                      addRow("education", {
                        institution: "Institution",
                        degree: "Degree",
                        location: "",
                        period: "",
                        sort_order: content.education.length + 1,
                        published: true,
                      })
                    }
                    onRemove={(index) => removeRow("education", index)}
                  />
                )}

                {activeKey === "deploy" && (
                  <div className="grid gap-5">
                    <article className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                      <h2 className="text-xl font-semibold text-white">
                        Portfolio
                      </h2>
                      <p className="mt-2 text-sm text-slate-300">
                        {content.portfolio?.status ?? "template"} |{" "}
                        {portfolioUrl || "Not published yet"}
                      </p>
                      <button
                        type="button"
                        onClick={publishPortfolio}
                        disabled={isSaving}
                        className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 text-sm font-semibold text-ink disabled:opacity-60"
                      >
                        <Rocket className="h-4 w-4" />
                        Make Portfolio
                      </button>
                    </article>

                    <article className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                      <h2 className="text-xl font-semibold text-white">
                        Custom domain
                      </h2>
                      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                        <input
                          value={domain}
                          onChange={(event) => setDomain(event.target.value)}
                          placeholder="example.com"
                          className="h-11 rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-slate-500"
                        />
                        <button
                          type="button"
                          onClick={addDomain}
                          disabled={isSaving || !domain}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-200 px-4 text-sm font-semibold text-ink disabled:opacity-60"
                        >
                          <Globe2 className="h-4 w-4" />
                          Add domain
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={checkDomainStatus}
                        disabled={isSaving || !content.portfolio?.custom_domain}
                        className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 disabled:opacity-50"
                      >
                        Check status
                      </button>
                      <p className="mt-3 text-sm text-slate-300">
                        {content.portfolio?.domain_status ?? "unconfigured"}
                      </p>
                    </article>

                    <article className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                      <h2 className="text-xl font-semibold text-white">
                        Resume import
                      </h2>
                      <label className="mt-4 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-semibold text-white">
                        {isParsingResume ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Upload resume
                        <input
                          type="file"
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          onChange={(event) =>
                            parseResume(event.target.files?.[0] ?? null)
                          }
                        />
                      </label>
                    </article>
                  </div>
                )}

                {activeKey === "advanced" && (
                  <div>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setAdvancedJson(formatJson(content))}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200"
                      >
                        Refresh JSON
                      </button>
                      <button
                        type="button"
                        onClick={applyAdvancedJson}
                        className="rounded-lg bg-cyan-200 px-3 py-2 text-xs font-semibold text-ink"
                      >
                        Apply JSON
                      </button>
                    </div>
                    <textarea
                      value={advancedJson}
                      onChange={(event) => setAdvancedJson(event.target.value)}
                      spellCheck={false}
                      className="min-h-[34rem] w-full resize-y rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-sm leading-6 text-slate-100 outline-none focus:border-cyan-300/40"
                    />
                  </div>
                )}
              </>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function CollectionEditor({
  rows,
  fields,
  textareas = [],
  toggles = ["published"],
  onUpdate,
  onAdd,
  onRemove,
}: {
  rows: JsonRecord[];
  fields: string[];
  textareas?: string[];
  toggles?: string[];
  onUpdate: (index: number, field: string, value: unknown) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-cyan-200 px-3 py-2 text-xs font-semibold text-ink"
        >
          Add row
        </button>
      </div>
      <div className="grid gap-4">
        {rows.map((row, index) => (
          <article
            key={String(row.id ?? index)}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <Field
                  key={field}
                  label={field.replace(/_/g, " ")}
                  value={textValue(row[field])}
                  onChange={(value) => onUpdate(index, field, value)}
                />
              ))}
            </div>
            {textareas.length > 0 && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {textareas.map((field) => (
                  <Field
                    key={field}
                    label={field.replace(/_/g, " ")}
                    value={splitLines(row[field])}
                    onChange={(value) => onUpdate(index, field, value)}
                    textarea
                  />
                ))}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {toggles.map((field) => (
                <Toggle
                  key={field}
                  label={field.replace(/_/g, " ")}
                  checked={boolValue(row[field])}
                  onChange={(checked) => onUpdate(index, field, checked)}
                />
              ))}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="rounded-lg border border-red-300/20 px-3 py-2 text-sm font-semibold text-red-100"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
