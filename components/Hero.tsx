import { ArrowDownRight, Download, MessageCircle } from "lucide-react";

import { Spotlight } from "./ui/Spotlight";
import type { Profile, SectionContent, SettingsMap, Skill } from "@/lib/cms";

const featuredSkillLimit = 8;

const Hero = ({
  profile,
  section,
  settings,
  skills,
}: {
  profile: Profile;
  section?: SectionContent;
  settings: SettingsMap;
  skills: Skill[];
}) => {
  const featuredSkills = skills
    .filter((skill) => skill.featured)
    .slice(0, featuredSkillLimit);
  const resumeUrl = settings.resume_url;

  return (
    <section className="relative flex min-h-[86vh] w-full items-center overflow-hidden pb-12 pt-28 md:min-h-[88vh] md:pt-36">
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

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[calc(100vw-2rem)] flex-col items-start text-left sm:max-w-5xl sm:items-center sm:text-center">
        <p className="max-w-full rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100 sm:px-4 sm:text-xs sm:tracking-[0.24em] md:text-sm">
          {section?.eyebrow ?? profile.role}
        </p>

        <h1 className="mt-7 w-full max-w-[19rem] text-4xl font-bold leading-tight text-white [text-wrap:balance] sm:max-w-4xl md:text-6xl lg:text-7xl">
          {profile.full_name}
        </h1>

        <p className="mt-4 w-full max-w-[19rem] text-2xl font-semibold leading-tight text-white [text-wrap:balance] sm:max-w-3xl md:text-4xl">
          {section?.title ?? profile.role}
        </p>

        <p className="mt-6 w-full max-w-[19rem] text-base leading-7 text-white-200 sm:max-w-2xl md:text-lg">
          {section?.description ?? profile.summary}
        </p>

        <div className="mt-9 flex w-full max-w-[19rem] flex-col items-stretch justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
          <a
            href="#projects"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black-100 transition hover:-translate-y-0.5 hover:bg-cyan-100"
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

        <div className="mt-10 flex w-full max-w-[19rem] flex-wrap justify-start gap-2 text-xs text-white-200 sm:max-w-none sm:justify-center md:text-sm">
          {featuredSkills.map((skill) => (
            <span
              key={skill.id}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
