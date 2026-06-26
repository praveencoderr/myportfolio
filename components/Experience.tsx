import Image from "next/image";
import { Award, CheckCircle2, GraduationCap } from "lucide-react";

import type {
  Achievement,
  Education,
  ExperienceItem,
  SectionContent,
} from "@/lib/cms";

const Experience = ({
  section,
  experience,
  achievements,
  education,
}: {
  section?: SectionContent;
  experience: ExperienceItem[];
  achievements: Achievement[];
  education: Education[];
}) => {
  return (
    <section id="experience" className="w-full scroll-mt-28 py-16 md:py-24">
      <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
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
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {experience.map((card) => (
          <article
            key={card.id}
            className="rounded-lg border border-white/10 bg-[#05071a] p-6 transition duration-200 hover:-translate-y-1 hover:border-emerald-300/35 hover:bg-white/[0.045]"
          >
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
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

              <div className="min-w-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
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
                      className="flex items-start gap-2 text-sm text-white-200"
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
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {(achievements.length > 0 || education.length > 0) && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {achievements.length > 0 && (
            <article className="rounded-lg border border-white/10 bg-[#05071a] p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-300/30 bg-violet-300/10 text-violet-100">
                  <Award className="h-5 w-5" />
                </span>
                <h3 className="text-xl font-semibold text-white">
                  Achievements
                </h3>
              </div>
              <div className="grid gap-3">
                {achievements.map((achievement) => {
                  const content = (
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-300/30">
                      <h4 className="text-sm font-semibold text-white">
                        {achievement.title}
                      </h4>
                      {achievement.description && (
                        <p className="mt-2 text-sm leading-6 text-white-200">
                          {achievement.description}
                        </p>
                      )}
                    </div>
                  );

                  return achievement.href ? (
                    <a
                      key={achievement.id}
                      href={achievement.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={achievement.id}>{content}</div>
                  );
                })}
              </div>
            </article>
          )}

          {education.length > 0 && (
            <article className="rounded-lg border border-white/10 bg-[#05071a] p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <h3 className="text-xl font-semibold text-white">Education</h3>
              </div>
              <div className="grid gap-3">
                {education.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
                  >
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
                ))}
              </div>
            </article>
          )}
        </div>
      )}
    </section>
  );
};

export default Experience;
