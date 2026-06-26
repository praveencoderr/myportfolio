import Image from "next/image";
import { ArrowUpRight, Github, PlayCircle, type LucideIcon } from "lucide-react";

import type { Project, SectionContent } from "@/lib/cms";
import { MotionCard, Reveal, Stagger, StaggerItem } from "./ui/Motion";

type ProjectLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const RecentProjects = ({
  section,
  projects,
}: {
  section?: SectionContent;
  projects: Project[];
}) => {
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

      <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((item) => {
          const links = [
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

          return (
            <StaggerItem key={item.id}>
              <MotionCard className="group flex h-full flex-col overflow-hidden bg-[#05071a]/95 hover:bg-white/[0.045]">
                <div className="relative h-48 overflow-hidden bg-[#090d2a]">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={`${item.title} project preview`}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05071a] via-[#05071a]/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-200/40 to-transparent opacity-0 transition group-hover:opacity-100" />
                  {item.featured && (
                    <span className="absolute left-4 top-4 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100 backdrop-blur">
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold leading-tight text-white">
                      {item.title}
                    </h3>
                    <div className="flex -space-x-2">
                      {item.icon_list.slice(0, 4).map((icon) => (
                        <span
                          key={icon}
                          className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black-100 shadow-md shadow-black/20 transition group-hover:border-cyan-300/30"
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

                  {item.subtitle && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                      {item.subtitle}
                    </p>
                  )}

                  <p className="mt-4 flex-1 text-sm leading-6 text-white-200">
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
                      {links.map((link) => {
                        const Icon = link.icon;

                        return (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
                          >
                            {link.label}
                            <Icon className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </MotionCard>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
};

export default RecentProjects;
