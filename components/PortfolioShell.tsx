import Achievements from "@/components/Achievements";
import About from "@/components/About";
import Approach from "@/components/Approach";
import Experience from "@/components/Experience";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import RecentProjects from "@/components/RecentProjects";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import type { PortfolioContent } from "@/lib/cms";

const PortfolioShell = ({ content }: { content: PortfolioContent }) => {
  return (
    <main className="relative mx-auto flex min-h-screen w-full flex-col items-center overflow-x-hidden bg-black-100 px-4 text-white sm:px-6 lg:px-10">
      <div className="w-full min-w-0 max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] lg:max-w-7xl">
        <FloatingNav navItems={content.navItems} />
        <Hero
          profile={content.profile}
          section={content.sections.hero}
          settings={content.settings}
          skills={content.skills}
          metrics={content.metrics}
        />
        <About
          section={content.sections.about}
          metrics={content.metrics}
          skills={content.skills}
        />
        <Experience
          section={content.sections.experience}
          experience={content.experience}
          education={content.education}
        />
        <RecentProjects
          section={content.sections.projects}
          projects={content.projects}
        />
        <Achievements
          section={content.sections.achievements}
          profile={content.profile}
          achievements={content.achievements}
        />
        <Approach
          section={content.sections.approach}
          steps={content.settings.build_steps ?? []}
        />
        <Footer
          profile={content.profile}
          section={content.sections.contact}
          settings={content.settings}
        />
      </div>
      <FloatingWhatsApp
        phone={content.settings.whatsapp_phone}
        message={content.settings.whatsapp_message}
      />
    </main>
  );
};

export default PortfolioShell;
