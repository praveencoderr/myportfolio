import { NextRequest, NextResponse } from "next/server";

import {
  jsonError,
  requireAuth,
  userCanManagePortfolio,
} from "@/lib/server-content";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);

  if ("error" in auth) {
    return auth.error;
  }

  try {
    const portfolioId = request.nextUrl.searchParams.get("portfolioId");

    if (!portfolioId) {
      return jsonError("Missing portfolioId.", 400);
    }

    const canManage = await userCanManagePortfolio(
      auth.supabase,
      portfolioId,
      auth.user,
      auth.isAdmin
    );

    if (!canManage) {
      return jsonError("You cannot inspect this portfolio.", 403);
    }

    const { data: portfolio, error: portfolioError } = await auth.supabase
      .from("portfolios")
      .select("*")
      .eq("id", portfolioId)
      .single();

    if (portfolioError) {
      throw portfolioError;
    }

    if (!portfolio.custom_domain) {
      return NextResponse.json({
        portfolio,
        status: "unconfigured",
        message: "No custom domain has been added yet.",
      });
    }

    const token = process.env.VERCEL_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    const projectId = process.env.VERCEL_PORTFOLIO_PROJECT_ID;

    if (!token || !teamId || !projectId) {
      return jsonError(
        "Vercel domain automation is not configured. Add VERCEL_TOKEN, VERCEL_TEAM_ID, and VERCEL_PORTFOLIO_PROJECT_ID.",
        503
      );
    }

    const response = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/domains/${portfolio.custom_domain}?teamId=${teamId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    if (!response.ok) {
      return jsonError("Vercel could not inspect this domain.", response.status);
    }

    const verified = result.verified === true;
    const { data: updated, error: updateError } = await auth.supabase
      .from("portfolios")
      .update({
        domain_status: verified ? "verified" : "pending",
        domain_instructions: result,
      })
      .eq("id", portfolioId)
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      portfolio: updated,
      status: verified ? "verified" : "pending",
      instructions: result,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to inspect domain.",
      500
    );
  }
}
