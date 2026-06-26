import Hero from "@/components/Hero";
import About from "@/components/About";
import CmsUnavailable from "@/components/CmsUnavailable";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Footer from "@/components/Footer";
import Approach from "@/components/Approach";
import Experience from "@/components/Experience";
import RecentProjects from "@/components/RecentProjects";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { getPortfolioContent } from "@/lib/cms";

const Home = async () => {
  const result = await getPortfolioContent();

  if (result.status !== "ready") {
    return <CmsUnavailable message={result.message} />;
  }

  const { content } = result;

  return (
    <main className="relative mx-auto flex min-h-screen w-full flex-col items-center overflow-x-hidden bg-black-100 px-4 text-white sm:px-6 lg:px-10">
      <div className="w-full min-w-0 max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] lg:max-w-7xl">
        <FloatingNav navItems={content.navItems} />
        <Hero
          profile={content.profile}
          section={content.sections.hero}
          settings={content.settings}
          skills={content.skills}
        />
        <About
          section={content.sections.about}
          metrics={content.metrics}
          skills={content.skills}
        />
        <RecentProjects
          section={content.sections.projects}
          projects={content.projects}
        />
        <Experience
          section={content.sections.experience}
          experience={content.experience}
          achievements={content.achievements}
          education={content.education}
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

export default Home;
