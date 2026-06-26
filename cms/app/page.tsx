"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader2, LogOut, Save, Send } from "lucide-react";

import { getBrowserSupabase } from "@/lib/supabase-browser";

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

type EditorState = Record<EditorKey, string>;

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

const emptyEditors = editorKeys.reduce<EditorState>((state, item) => {
  state[item.key] = item.key === "profile" ? "{}" : "[]";
  return state;
}, {} as EditorState);

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function parseEditors(editors: EditorState) {
  return editorKeys.reduce<Record<string, unknown>>((payload, item) => {
    payload[item.key] = JSON.parse(editors[item.key]);
    return payload;
  }, {});
}

export default function CmsPage() {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [editors, setEditors] = useState<EditorState>(emptyEditors);
  const [activeKey, setActiveKey] = useState<EditorKey>("profile");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    const accessToken = session?.access_token;

    if (!accessToken) {
      return;
    }

    async function loadContent() {
      setIsLoading(true);
      setStatus("Loading CMS content...");

      try {
        const response = await fetch("/api/content", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load content.");
        }

        setEditors({
          profile: formatJson(payload.profile),
          sections: formatJson(payload.sections),
          settings: formatJson(payload.settings),
          metrics: formatJson(payload.metrics),
          skills: formatJson(payload.skills),
          experience: formatJson(payload.experience),
          projects: formatJson(payload.projects),
          achievements: formatJson(payload.achievements),
          education: formatJson(payload.education),
        });
        setStatus("Content loaded.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Load failed.");
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, [session]);

  async function sendMagicLink() {
    if (!supabase || !email) {
      return;
    }

    setIsLoading(true);
    setStatus("Sending sign-in link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setIsLoading(false);
    setStatus(
      error
        ? error.message
        : "Check your email for the Supabase sign-in link."
    );
  }

  async function saveContent() {
    if (!session?.access_token) {
      setStatus("Sign in before saving.");
      return;
    }

    setIsSaving(true);
    setStatus("Saving content...");

    try {
      const payload = parseEditors(editors);
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Save failed.");
      }

      setStatus("Content saved. Refresh the portfolio to see updates.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setSession(null);
    setEditors(emptyEditors);
    setStatus("Signed out.");
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
        <header className="flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
              Portfolio CMS
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              Praveen Gupta Portfolio Content
            </h1>
            {status && <p className="mt-2 text-sm text-slate-300">{status}</p>}
          </div>

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
                Save content
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
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="admin email"
                className="h-11 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={sendMagicLink}
                disabled={isLoading || !email}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-200 px-4 text-sm font-semibold text-ink disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send link
              </button>
            </div>
          )}
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

          <section className="rounded-lg border border-white/10 bg-[#05071a] p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">
                {editorKeys.find((item) => item.key === activeKey)?.label}
              </h2>
              <button
                type="button"
                onClick={() => {
                  try {
                    setEditors((current) => ({
                      ...current,
                      [activeKey]: formatJson(JSON.parse(current[activeKey])),
                    }));
                    setStatus("JSON formatted.");
                  } catch (error) {
                    setStatus(
                      error instanceof Error ? error.message : "Invalid JSON."
                    );
                  }
                }}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200"
              >
                Format JSON
              </button>
            </div>
            <textarea
              value={editors[activeKey]}
              onChange={(event) =>
                setEditors((current) => ({
                  ...current,
                  [activeKey]: event.target.value,
                }))
              }
              spellCheck={false}
              className="min-h-[34rem] w-full resize-y rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-sm leading-6 text-slate-100 outline-none focus:border-cyan-300/40"
            />
          </section>
        </section>
      </div>
    </main>
  );
}
