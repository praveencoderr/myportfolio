import Image from "next/image";
import { ArrowUpRight, Download, Mail } from "lucide-react";

import type { Profile, SectionContent, SettingsMap } from "@/lib/cms";

const Footer = ({
  profile,
  section,
  settings,
}: {
  profile: Profile;
  section?: SectionContent;
  settings: SettingsMap;
}) => {
  const socialMedia = [
    { id: "github", name: "GitHub", img: "/git.svg", link: profile.github_url },
    {
      id: "linkedin",
      name: "LinkedIn",
      img: "/link.svg",
      link: profile.linkedin_url,
    },
  ].filter((item): item is { id: string; name: string; img: string; link: string } =>
    Boolean(item.link)
  );

  return (
    <footer className="relative w-full scroll-mt-28 pb-10 pt-16 md:pt-24" id="contact">
      <div className="absolute inset-x-1/2 bottom-0 -z-10 min-h-96 w-screen -translate-x-1/2">
        <Image
          src="/footer-grid.svg"
          alt=""
          fill
          className="object-cover opacity-35"
        />
      </div>

      <div className="rounded-lg border border-white/10 bg-[#05071a]/90 p-6 text-center backdrop-blur md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">
          {section?.eyebrow}
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold leading-tight text-white md:text-5xl">
          {section?.title}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white-200">
          {section?.description}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-black-100 transition hover:-translate-y-0.5 hover:bg-cyan-100"
            >
              Email Praveen
              <Mail className="h-4 w-4" />
            </a>
          )}

          {settings.resume_url && (
            <a
              href={settings.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-white/[0.08]"
            >
              Download resume
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-6 md:flex-row">
        <p className="text-sm text-white-200">
          Copyright © {new Date().getFullYear()} {profile.full_name}
        </p>

        <div className="flex items-center gap-3">
          {socialMedia.map((info) => (
            <a
              key={info.id}
              href={info.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={info.name}
              className="group relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
            >
              <Image
                src={info.img}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <ArrowUpRight className="absolute h-3 w-3 translate-x-3 -translate-y-3 text-cyan-100 opacity-0 transition group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
