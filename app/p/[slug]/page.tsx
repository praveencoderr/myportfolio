import CmsUnavailable from "@/components/CmsUnavailable";
import PortfolioShell from "@/components/PortfolioShell";
import { getPortfolioContent } from "@/lib/cms";

const PublicPortfolioPage = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const result = await getPortfolioContent({ slug: params.slug });

  if (result.status !== "ready") {
    return <CmsUnavailable message={result.message} />;
  }

  return <PortfolioShell content={result.content} />;
};

export default PublicPortfolioPage;
