"use client";

import Image from "next/image";
import { useEffect, useState, type KeyboardEvent, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Eye,
  Github,
  Layers3,
  PlayCircle,
  Sparkles,
  X,
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
    tech.some(
      (value) =>
        value.includes("rag") ||
        value.includes("gemini") ||
        value.includes("agentic") ||
        value.includes("ocr")
    )
      ? "AI workflow"
      : null,
  ].filter(Boolean);

  return badges.slice(0, item.featured ? 5 : 3) as string[];
}

function stopLinkClick(event: MouseEvent<HTMLAnchorElement>) {
  event.stopPropagation();
}

const ProjectMedia = ({
  item,
  featured,
}: {
  item: Project;
  featured: boolean;
}) => (
  <div
    className={
      featured
        ? "relative min-h-64 overflow-hidden bg-[#090d2a] md:min-h-full"
        : "relative aspect-[16/10] overflow-hidden bg-[#090d2a]"
    }
  >
    {item.image ? (
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
    <div className="absolute inset-0 bg-gradient-to-t from-[#05071a] via-[#05071a]/20 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
    {featured && (
      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100 backdrop-blur">
        <Sparkles className="h-3.5 w-3.5" />
        Featured project
      </div>
    )}
  </div>
);

const ProjectContent = ({
  item,
  featured,
  onViewDetails,
}: {
  item: Project;
  featured: boolean;
  onViewDetails: () => void;
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
          {item.role && (
            <p className="mt-2 text-sm font-medium text-emerald-100">
              {item.role}
            </p>
          )}
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
        {item.tech.slice(0, featured ? 10 : 7).map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white-200 transition hover:border-cyan-300/30 hover:text-cyan-100"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onViewDetails();
          }}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/15"
        >
          View details
          <Eye className="h-4 w-4" />
        </button>

        {links.map((link, index) => {
          const Icon = link.icon;

          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={stopLinkClick}
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
    </div>
  );
};

const ProjectDetailModal = ({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) => {
  const prefersReducedMotion = useReducedMotion();
  const links = project ? getProjectLinks(project) : [];

  useEffect(() => {
    if (!project) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, project]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[6000] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm md:items-center md:p-6"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          onClick={onClose}
        >
          <motion.article
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-detail-title"
            className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-[#05071a] shadow-2xl shadow-black/50"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 28 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-64 overflow-hidden bg-[#090d2a] lg:min-h-full">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={`${project.title} project detail preview`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                ) : (
                  <div className="flex h-full min-h-64 items-center justify-center text-cyan-100">
                    <Layers3 className="h-14 w-14 opacity-70" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#05071a] via-transparent to-transparent" />
                {project.role && (
                  <span className="absolute bottom-5 left-5 right-5 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 text-sm font-semibold text-emerald-100 backdrop-blur">
                    {project.role}
                  </span>
                )}
              </div>

              <div className="min-w-0 p-5 md:p-7">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {project.subtitle && (
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                        {project.subtitle}
                      </p>
                    )}
                    <h3
                      id="project-detail-title"
                      className="mt-3 text-2xl font-bold leading-tight text-white md:text-4xl"
                    >
                      {project.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                    aria-label="Close project details"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {project.description && (
                  <p className="text-sm leading-7 text-white-200 md:text-base">
                    {project.description}
                  </p>
                )}

                {project.highlights.length > 0 && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {project.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-4"
                      >
                        <p className="text-sm font-semibold text-cyan-100">
                          {highlight}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {project.features.length > 0 && (
                  <div className="mt-7">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">
                      Features
                    </h4>
                    <div className="mt-4 grid gap-3">
                      {project.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white-200"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {project.tech.length > 0 && (
                  <div className="mt-7">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">
                      Tech stack
                    </h4>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {links.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-3">
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
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const RecentProjects = ({
  section,
  projects,
}: {
  section?: SectionContent;
  projects: Project[];
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (projects.length === 0) {
    return null;
  }

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    project: Project
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedProject(project);
    }
  };

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
                role="button"
                tabIndex={0}
                aria-label={`View details for ${item.title}`}
                onClick={() => setSelectedProject(item)}
                onKeyDown={(event) => handleCardKeyDown(event, item)}
                className={
                  featured
                    ? "group grid h-full cursor-pointer overflow-hidden bg-[#05071a]/95 shadow-2xl shadow-black/30 outline-none transition focus-visible:border-cyan-300/50 focus-visible:ring-2 focus-visible:ring-cyan-300/30 md:grid-cols-[0.95fr_1.05fr] hover:bg-white/[0.045]"
                    : "group flex h-full cursor-pointer flex-col overflow-hidden bg-[#05071a]/95 outline-none transition focus-visible:border-cyan-300/50 focus-visible:ring-2 focus-visible:ring-cyan-300/30 hover:bg-white/[0.045]"
                }
              >
                <ProjectMedia item={item} featured={featured} />
                <ProjectContent
                  item={item}
                  featured={featured}
                  onViewDetails={() => setSelectedProject(item)}
                />
              </MotionCard>
            </StaggerItem>
          );
        })}
      </Stagger>

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};

export default RecentProjects;
