import { Code2, Rocket, SearchCheck } from "lucide-react";
import type { BuildStep, SectionContent } from "@/lib/cms";

const icons = [SearchCheck, Code2, Rocket];

const Approach = ({
  section,
  steps,
}: {
  section?: SectionContent;
  steps: BuildStep[];
}) => {
  if (steps.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-cyan-300/[0.04] p-6 md:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
            {section?.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-white md:text-5xl">
            {section?.title}
          </h2>
          <p className="mt-5 text-base leading-7 text-white-200">
            {section?.description}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = icons[index % icons.length];

            return (
              <article
                key={step.title}
                className="rounded-lg border border-white/10 bg-black-100/60 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white-200">
                    0{index + 1}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white-200">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Approach;
