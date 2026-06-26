import Image from "next/image";
import {
  ArrowUpRight,
  Code2,
  Github,
  Layers3,
  MessageCircle,
  PhoneCall,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";

import type { Project, SectionContent } from "@/lib/cms";
import { MotionCard, Reveal, Stagger, StaggerItem } from "./ui/Motion";

type ProjectLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

function getProjectLinks(item: Project) {
  return [
    {
      label: "Live",
      href: item.live_url,
      icon: ArrowUpRight,
    },
    {
      label: "Code",
      href: item.code_url,
      icon: Github,
    },
    {
      label: "Demo",
      href: item.case_study_url,
      icon: PlayCircle,
    },
  ].filter((link): link is ProjectLink => Boolean(link.href));
}

function getProjectBadges(item: Project) {
  const tech = item.tech.map((value) => value.toLowerCase());
  const badges = [
    item.featured ? "Featured build" : "Selected work",
    item.live_url ? "Live product" : null,
    item.code_url ? "Source available" : null,
    tech.some((value) => value.includes("socket") || value.includes("webrtc"))
      ? "Realtime systems"
      : null,
    tech.some((value) => value.includes("rag") || value.includes("gemini"))
      ? "AI workflow"
      : null,
  ].filter(Boolean);

  return badges.slice(0, item.featured ? 5 : 3) as string[];
}

const VentlyPreview = () => (
  <div className="relative h-full min-h-64 overflow-hidden bg-[linear-gradient(135deg,#05071a_0%,#071426_50%,#0a102f_100%)] p-4">
    <div className="absolute inset-0 bg-grid-white/[0.035]" />
    <div className="relative z-10 flex h-full min-h-56 flex-col rounded-lg border border-white/10 bg-black-100/45 p-4 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
            Vently
          </p>
          <p className="mt-1 text-sm text-white-200">AI realtime chat room</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-medium text-emerald-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          Live
        </span>
      </div>

      <div className="grid flex-1 gap-3 py-4 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-200" />
              Safe match
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-full w-4/5 rounded-full bg-cyan-300" />
            </div>
            <p className="mt-2 text-[11px] text-white-200">
              Mood, reports, blocks, and moderation.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white">
              <MessageCircle className="h-4 w-4 text-cyan-100" />
              AI fallback
            </div>
            <div className="space-y-2">
              <div className="ml-auto h-7 w-3/4 rounded-lg rounded-br-sm bg-cyan-300/20" />
              <div className="h-7 w-4/5 rounded-lg rounded-bl-sm bg-violet-300/20" />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] p-3">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Voice + video</p>
              <div className="flex gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-300 text-black-100">
                  <PhoneCall className="h-4 w-4" />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-300 text-black-100">
                  <Video className="h-4 w-4" />
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-white-200">
              Socket.IO presence, typing, read states, WebRTC calls, voice
              notes, and call history.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-white-200">
            {["RAG", "Redis", "WebRTC"].map((item) => (
              <span
                key={item}
                className="rounded-lg border border-white/10 bg-black-100/45 px-2 py-2"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-[11px] text-white-200">
        <span>Matchmaking</span>
        <span>Translation</span>
        <span>Push alerts</span>
      </div>
    </div>
  </div>
);

const ProjectMedia = ({
  item,
  featured,
}: {
  item: Project;
  featured: boolean;
}) => {
  const usesVentlyPreview = item.title.toLowerCase().includes("vently");

  return (
    <div
      className={
        featured
          ? "relative min-h-64 overflow-hidden bg-[#090d2a] md:min-h-full"
          : "relative aspect-[16/10] overflow-hidden bg-[#090d2a]"
      }
    >
      {usesVentlyPreview ? (
        <VentlyPreview />
      ) : item.image ? (
        <Image
          src={item.image}
          alt={`${item.title} project preview`}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes={
            featured
              ? "(min-width: 1280px) 38vw, (min-width: 768px) 50vw, 100vw"
              : "(min-width: 1280px) 22vw, (min-width: 768px) 50vw, 100vw"
          }
        />
      ) : (
        <div className="flex h-full min-h-48 items-center justify-center text-cyan-100">
          <Layers3 className="h-12 w-12 opacity-70" />
        </div>
      )}
      {!usesVentlyPreview && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-[#05071a] via-[#05071a]/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
        </>
      )}
      {featured && !usesVentlyPreview && (
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          Featured project
        </div>
      )}
    </div>
  );
};

const ProjectContent = ({
  item,
  featured,
}: {
  item: Project;
  featured: boolean;
}) => {
  const links = getProjectLinks(item);
  const badges = getProjectBadges(item);

  return (
    <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {item.subtitle && (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {item.subtitle}
            </p>
          )}
          <h3
            className={
              featured
                ? "mt-3 text-2xl font-bold leading-tight text-white md:text-3xl"
                : "mt-3 text-xl font-semibold leading-tight text-white"
            }
          >
            {item.title}
          </h3>
        </div>

        <div className="flex shrink-0 -space-x-2">
          {item.icon_list.slice(0, featured ? 5 : 4).map((icon) => (
            <span
              key={icon}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black-100 shadow-md shadow-black/20 transition group-hover:border-cyan-300/30"
            >
              <Image
                src={icon}
                alt=""
                width={18}
                height={18}
                className="h-4 w-4 object-contain"
              />
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100"
          >
            <Code2 className="h-3 w-3" />
            {badge}
          </span>
        ))}
      </div>

      <p
        className={
          featured
            ? "mt-5 text-sm leading-7 text-white-200 md:text-base"
            : "mt-4 flex-1 text-sm leading-6 text-white-200"
        }
      >
        {item.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.tech.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white-200 transition hover:border-cyan-300/30 hover:text-cyan-100"
          >
            {tech}
          </span>
        ))}
      </div>

      {links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {links.map((link, index) => {
            const Icon = link.icon;

            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  index === 0
                    ? "inline-flex h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black-100 transition hover:-translate-y-0.5 hover:bg-cyan-100"
                    : "inline-flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
                }
              >
                {link.label}
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

const RecentProjects = ({
  section,
  projects,
}: {
  section?: SectionContent;
  projects: Project[];
}) => {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="scroll-mt-28 py-16 md:py-24" id="projects">
      <Reveal className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">
            {section?.eyebrow}
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-white md:text-5xl">
            {section?.title}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-white-200 md:text-right">
          {section?.description}
        </p>
      </Reveal>

      <Stagger className="grid grid-cols-1 gap-5 lg:grid-cols-6">
        {projects.map((item) => {
          const featured = item.featured;

          return (
            <StaggerItem
              key={item.id}
              className={
                featured
                  ? "lg:col-span-6 xl:col-span-4"
                  : "lg:col-span-3 xl:col-span-2"
              }
            >
              <MotionCard
                className={
                  featured
                    ? "group grid h-full overflow-hidden bg-[#05071a]/95 shadow-2xl shadow-black/30 md:grid-cols-[0.95fr_1.05fr] hover:bg-white/[0.045]"
                    : "group flex h-full flex-col overflow-hidden bg-[#05071a]/95 hover:bg-white/[0.045]"
                }
              >
                <ProjectMedia item={item} featured={featured} />
                <ProjectContent item={item} featured={featured} />
              </MotionCard>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
};

export default RecentProjects;
