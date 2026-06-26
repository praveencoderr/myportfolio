import Image from "next/image";
import { CheckCircle2, GraduationCap } from "lucide-react";

import type {
  Education,
  ExperienceItem,
  SectionContent,
} from "@/lib/cms";
import { MotionCard, Reveal, Stagger, StaggerItem } from "./ui/Motion";

const Experience = ({
  section,
  experience,
  education,
}: {
  section?: SectionContent;
  experience: ExperienceItem[];
  education: Education[];
}) => {
  return (
    <section id="experience" className="w-full scroll-mt-28 py-16 md:py-24">
      <Reveal className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
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

      <Stagger className="grid gap-5 lg:grid-cols-2">
        {experience.map((card, index) => (
          <StaggerItem key={card.id}>
            <MotionCard className="relative h-full overflow-hidden p-6 hover:bg-white/[0.045]">
              <div className="absolute inset-y-6 left-6 w-px bg-gradient-to-b from-emerald-300/50 via-cyan-300/30 to-transparent sm:left-[3.75rem]" />
              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] shadow-lg shadow-black/25">
                  {card.thumbnail ? (
                    <Image
                      src={card.thumbnail}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 object-contain"
                    />
                  ) : (
                    <CheckCircle2 className="h-8 w-8 text-emerald-200" />
                  )}
                </div>

                <div className="min-w-0 sm:pl-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                        Experience 0{index + 1}
                      </p>
                      <h3 className="text-xl font-semibold text-white">
                        {card.role}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-cyan-100">
                        {card.company}
                      </p>
                    </div>
                    {card.period && (
                      <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white-200">
                        {card.period}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-white-200">
                    {card.summary}
                  </p>

                  <div className="mt-5 grid gap-2">
                    {card.bullets.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-sm text-white-200"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {card.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white-200 transition hover:border-emerald-300/30 hover:text-emerald-100"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </MotionCard>
          </StaggerItem>
        ))}
      </Stagger>

      {education.length > 0 && (
        <Stagger className="mt-5 grid gap-5 lg:grid-cols-2">
          {education.map((item) => (
            <StaggerItem key={item.id}>
              <MotionCard className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-semibold text-white">
                    Education
                  </h3>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <h4 className="text-sm font-semibold text-white">
                    {item.degree}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-white-200">
                    {item.institution}
                  </p>
                  <p className="mt-1 text-xs text-white-200">
                    {[item.location, item.period].filter(Boolean).join(" | ")}
                  </p>
                </div>
              </MotionCard>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
};

export default Experience;
