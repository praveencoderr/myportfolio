import { ArrowUpRight, Bot, BriefcaseBusiness, Code2, Database } from "lucide-react";

import type { Metric, SectionContent, Skill } from "@/lib/cms";
import { MotionCard, Reveal, Stagger, StaggerItem } from "./ui/Motion";

const accentStyles: Record<string, string> = {
  violet: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  cyan: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
  emerald: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  blue: "border-blue-300/30 bg-blue-300/10 text-blue-100",
};

const iconByCategory: Record<string, typeof Code2> = {
  Programming: Code2,
  Frontend: BriefcaseBusiness,
  "Backend/Cloud": Database,
  "AI/LLM": Bot,
  Tools: Code2,
};

const accents = ["violet", "cyan", "emerald", "blue"];

function groupSkills(skills: Skill[]) {
  return skills.reduce<Record<string, Skill[]>>((groups, skill) => {
    groups[skill.category] = groups[skill.category] ?? [];
    groups[skill.category].push(skill);
    return groups;
  }, {});
}

const About = ({
  section,
  metrics,
  skills,
}: {
  section?: SectionContent;
  metrics: Metric[];
  skills: Skill[];
}) => {
  const skillGroups = Object.entries(groupSkills(skills));

  return (
    <section id="about" className="scroll-mt-28 py-16 md:py-24">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <Reveal className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            {section?.eyebrow}
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight text-white md:text-5xl">
            {section?.title}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white-200">
            {section?.description}
          </p>
        </Reveal>

        <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <StaggerItem key={metric.label}>
              <MotionCard className="group h-full bg-[#070b24]/90 p-5 hover:bg-white/[0.06]">
                <div className="flex items-start justify-between gap-4">
                  <span className="break-words text-3xl font-bold text-white md:text-4xl">
                    {metric.value}
                  </span>
                  {metric.href && (
                    <a
                      href={metric.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={metric.label}
                    >
                      <ArrowUpRight className="h-4 w-4 text-white-200 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-200" />
                    </a>
                  )}
                </div>
                <p className="mt-3 text-sm leading-5 text-white-200">
                  {metric.label}
                </p>
              </MotionCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <Stagger className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {skillGroups.map(([category, items], index) => {
          const Icon = iconByCategory[category] ?? Code2;
          const accent = accents[index % accents.length];

          return (
            <StaggerItem key={category}>
              <MotionCard className="h-full p-6">
                <div
                  className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border ${
                    accentStyles[accent]
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {category}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white-200 transition hover:border-cyan-300/30 hover:text-cyan-100"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </MotionCard>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
};

export default About;
