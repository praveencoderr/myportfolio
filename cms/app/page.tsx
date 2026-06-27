"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import type { ContentPayload } from "@/lib/content-types";

type EditorKey =
  | "profile"
  | "sections"
  | "settings"
  | "metrics"
  | "skills"
  | "experience"
  | "projects"
  | "achievements"
  | "education";

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
  const [content, setContent] = useState<ContentPayload>(emptyContent);
  const [activeKey, setActiveKey] = useState<EditorKey>("profile");
  const [status, setStatus] = useState("Loading current portfolio...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        setStatus("Praveen portfolio loaded. Changes save only to this profile.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Load failed.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPublicTemplate();
  }, []);

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
    key: Exclude<EditorKey, "profile">,
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

  async function saveContent() {
    setIsSaving(true);
    setStatus("Saving Praveen portfolio...");

    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Save failed.");
      }

      setStatus("Praveen portfolio saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
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

            <button
              type="button"
              onClick={saveContent}
              disabled={isSaving || isLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-200 px-4 text-sm font-semibold text-ink disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Praveen Profile
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[16rem_1fr]">
          <nav className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            {editorKeys.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveKey(item.key)}
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
                      "role",
                      "image",
                      "live_url",
                      "code_url",
                      "case_study_url",
                    ]}
                    textareas={[
                      "description",
                      "tech",
                      "features",
                      "highlights",
                      "icon_list",
                    ]}
                    toggles={["featured", "published"]}
                    onUpdate={(index, field, value) =>
                      updateRow(
                        "projects",
                        index,
                        field,
                        field === "tech" ||
                          field === "features" ||
                          field === "highlights" ||
                          field === "icon_list"
                          ? parseLines(String(value))
                          : value
                      )
                    }
                    onAdd={() =>
                      addRow("projects", {
                        title: "Project",
                        subtitle: "",
                        role: "",
                        description: "",
                        image: "/projects/project-kisan.svg",
                        icon_list: [],
                        tech: [],
                        features: [],
                        highlights: [],
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
