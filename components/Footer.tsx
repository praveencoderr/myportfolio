import Image from "next/image";
import { ArrowUpRight, Download, Mail } from "lucide-react";
import type { IconType } from "react-icons";
import {
  SiGeeksforgeeks,
  SiGithub,
  SiLeetcode,
  SiLinkedin,
} from "react-icons/si";

import type { Profile, SectionContent, SettingsMap } from "@/lib/cms";
import { Reveal, Stagger, StaggerItem } from "./ui/Motion";

type SocialLink = {
  id: string;
  name: string;
  icon: IconType;
  link: string;
};

type MaybeSocialLink = Omit<SocialLink, "link"> & {
  link: string | null;
};

const Footer = ({
  profile,
  section,
  settings,
}: {
  profile: Profile;
  section?: SectionContent;
  settings: SettingsMap;
}) => {
  const socialItems: MaybeSocialLink[] = [
    { id: "github", name: "GitHub", icon: SiGithub, link: profile.github_url },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: SiLinkedin,
      link: profile.linkedin_url,
    },
    {
      id: "leetcode",
      name: "LeetCode",
      icon: SiLeetcode,
      link: profile.leetcode_url,
    },
    {
      id: "gfg",
      name: "GeeksforGeeks",
      icon: SiGeeksforgeeks,
      link: profile.gfg_url,
    },
  ];
  const socialMedia = socialItems.filter(
    (item): item is SocialLink => Boolean(item.link)
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

      <Reveal className="rounded-lg border border-white/10 bg-[#05071a]/90 p-6 text-center shadow-2xl shadow-black/30 backdrop-blur md:p-10">
        <div className="mx-auto mb-6 h-px max-w-xl bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
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
      </Reveal>

      <Reveal className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-6 md:flex-row">
        <p className="text-sm text-white-200">
          Copyright © {new Date().getFullYear()} {profile.full_name}
        </p>

        <Stagger className="flex items-center gap-3">
          {socialMedia.map((info) => {
            const Icon = info.icon;

            return (
              <StaggerItem key={info.id}>
                <a
                  href={info.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={info.name}
                  className="group relative flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                >
                  <Icon className="h-5 w-5 text-white transition group-hover:text-cyan-100" />
                  <ArrowUpRight className="absolute h-3 w-3 translate-x-3 -translate-y-3 text-cyan-100 opacity-0 transition group-hover:opacity-100" />
                </a>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Reveal>
    </footer>
  );
};

export default Footer;
