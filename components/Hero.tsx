import {
  ArrowDownRight,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { Spotlight } from "./ui/Spotlight";
import { Reveal, Stagger, StaggerItem } from "./ui/Motion";
import type {
  Metric,
  Profile,
  SectionContent,
  SettingsMap,
  Skill,
} from "@/lib/cms";

const featuredSkillLimit = 8;
const heroMetricLimit = 4;

const Hero = ({
  profile,
  section,
  settings,
  skills,
  metrics,
}: {
  profile: Profile;
  section?: SectionContent;
  settings: SettingsMap;
  skills: Skill[];
  metrics: Metric[];
}) => {
  const featuredSkills = skills
    .filter((skill) => skill.featured)
    .slice(0, featuredSkillLimit);
  const proofMetrics = metrics.slice(0, heroMetricLimit);
  const resumeUrl = settings.resume_url;

  return (
    <section className="relative flex min-h-[88vh] w-full items-center overflow-hidden pb-12 pt-28 md:min-h-[90vh] md:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-10 hidden md:block">
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
          fill="white"
        />
        <Spotlight
          className="h-[80vh] w-[50vw] top-10 left-full"
          fill="purple"
        />
        <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="blue" />
      </div>

      <div className="absolute inset-x-1/2 top-0 -z-20 h-full w-screen -translate-x-1/2 bg-grid-white/[0.035]">
        <div className="absolute inset-0 bg-black-100 [mask-image:radial-gradient(ellipse_at_center,transparent_18%,black_76%)]" />
      </div>
      <div className="pointer-events-none absolute inset-x-1/2 top-0 -z-10 h-full w-screen -translate-x-1/2 bg-[linear-gradient(118deg,rgba(34,211,238,0.10),transparent_34%,rgba(139,92,246,0.08)_66%,transparent)]" />

      <div className="relative z-10 mx-auto grid w-full min-w-0 max-w-[calc(100vw-2rem)] items-center gap-10 lg:max-w-6xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="min-w-0 text-left">
          <Reveal immediate>
            <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100 sm:px-4 sm:text-xs sm:tracking-[0.2em] md:text-sm">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 truncate">
                {section?.eyebrow ?? profile.role}
              </span>
            </p>
          </Reveal>

          <Reveal immediate delay={0.06}>
            <h1 className="mt-7 w-full max-w-4xl text-4xl font-bold leading-tight text-white [text-wrap:balance] md:text-6xl lg:text-7xl">
              {profile.full_name}
            </h1>
          </Reveal>

          <Reveal immediate delay={0.12}>
            <p className="mt-4 w-full max-w-3xl text-2xl font-semibold leading-tight text-white [text-wrap:balance] md:text-4xl">
              {section?.title ?? profile.role}
            </p>
          </Reveal>

          <Reveal immediate delay={0.18}>
            <p className="mt-6 w-full max-w-2xl text-base leading-7 text-white-200 md:text-lg">
              {section?.description ?? profile.summary}
            </p>
          </Reveal>

          <Reveal immediate delay={0.24}>
            <div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <a
                href="#projects"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black-100 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-cyan-100"
              >
                View projects
                <ArrowDownRight className="h-4 w-4" />
              </a>

              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-white/[0.08]"
                >
                  Download resume
                  <Download className="h-4 w-4" />
                </a>
              )}

              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-6 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/15"
                >
                  Contact
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          </Reveal>

          <Stagger
            immediate
            className="mt-10 flex w-full flex-wrap justify-start gap-2 text-xs text-white-200 md:text-sm"
          >
            {featuredSkills.map((skill) => (
              <StaggerItem key={skill.id}>
                <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur transition hover:border-cyan-300/30 hover:text-cyan-100">
                  {skill.name}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <Reveal immediate delay={0.18} className="min-w-0">
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#05071a]/80 p-5 shadow-2xl shadow-black/30 backdrop-blur md:p-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  Available for
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-tight text-white md:text-3xl">
                  Frontend, full-stack and AI product roles
                </h2>
              </div>
              {profile.location && (
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white-200">
                  <MapPin className="h-3.5 w-3.5 text-cyan-100" />
                  {profile.location}
                </span>
              )}
            </div>

            {proofMetrics.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {proofMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] p-4"
                  >
                    <p className="break-words text-2xl font-bold text-white">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-white-200">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 text-sm text-white-200">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-black-100/50 px-3 py-3 transition hover:border-cyan-300/30 hover:text-cyan-100"
                >
                  <Mail className="h-4 w-4 shrink-0 text-cyan-100" />
                  <span className="min-w-0 truncate">{profile.email}</span>
                </a>
              )}
              <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-3 text-emerald-100">
                Building reliable web apps with React, Next.js, Node.js and
                AI-assisted workflows.
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Hero;
