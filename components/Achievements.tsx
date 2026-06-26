import { ArrowUpRight, Award, CheckCircle2, Trophy } from "lucide-react";

import type { Achievement, SectionContent } from "@/lib/cms";
import { MotionCard, Reveal, Stagger, StaggerItem } from "./ui/Motion";

const highlights = [
  "Competitive programming",
  "AI finalist",
  "Certificates",
  "Project delivery",
];

const Achievements = ({
  section,
  achievements,
}: {
  section?: SectionContent;
  achievements: Achievement[];
}) => {
  if (achievements.length === 0) {
    return null;
  }

  return (
    <section id="achievements" className="w-full scroll-mt-28 py-16 md:py-24">
      <Reveal className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">
            {section?.eyebrow ?? "Achievements"}
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-white md:text-5xl">
            {section?.title ?? "Proof beyond project work."}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-white-200 md:text-right">
          {section?.description ??
            "Certifications, coding milestones, and proof points that support the engineering story."}
        </p>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="rounded-lg border border-white/10 bg-gradient-to-br from-violet-300/[0.12] via-white/[0.04] to-cyan-300/[0.08] p-6 shadow-xl shadow-black/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-violet-300/30 bg-violet-300/10 text-violet-100">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="mt-6 text-2xl font-bold leading-tight text-white">
            Measurable consistency across AI, DSA, and delivery.
          </h3>
          <div className="mt-6 grid gap-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-black-100/40 px-3 py-3 text-sm text-white-200"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />
                {item}
              </div>
            ))}
          </div>
        </Reveal>

        <Stagger className="grid gap-4 sm:grid-cols-2">
          {achievements.map((achievement) => {
            const content = (
              <MotionCard className="group h-full p-5 hover:bg-white/[0.045]">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
                    <Award className="h-5 w-5" />
                  </span>
                  {achievement.href && (
                    <ArrowUpRight className="h-4 w-4 text-white-200 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-100" />
                  )}
                </div>
                <h3 className="text-lg font-semibold leading-tight text-white">
                  {achievement.title}
                </h3>
                {achievement.description && (
                  <p className="mt-3 text-sm leading-6 text-white-200">
                    {achievement.description}
                  </p>
                )}
              </MotionCard>
            );

            return (
              <StaggerItem key={achievement.id}>
                {achievement.href ? (
                  <a
                    href={achievement.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={achievement.title}
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
};

export default Achievements;
