import { NextRequest, NextResponse } from "next/server";

import {
  jsonError,
  requireAuth,
  userCanManagePortfolio,
} from "@/lib/server-content";

export const runtime = "nodejs";

function normalizeDomain(domain: string) {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function isValidDomain(domain: string) {
  return /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/.test(domain);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);

  if ("error" in auth) {
    return auth.error;
  }

  try {
    const body = (await request.json()) as {
      portfolioId?: string;
      domain?: string;
    };
    const portfolioId = body.portfolioId;
    const domain = normalizeDomain(body.domain ?? "");

    if (!portfolioId) {
      return jsonError("Missing portfolioId.", 400);
    }

    if (!isValidDomain(domain)) {
      return jsonError("Enter a valid domain like example.com.", 400);
    }

    const canManage = await userCanManagePortfolio(
      auth.supabase,
      portfolioId,
      auth.user,
      auth.isAdmin
    );

    if (!canManage) {
      return jsonError("You cannot update this portfolio.", 403);
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
      `https://api.vercel.com/v10/projects/${projectId}/domains?teamId=${teamId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: domain }),
      }
    );
    const result = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    if (!response.ok) {
      return jsonError(
        typeof result.error === "object" &&
          result.error &&
          "message" in result.error
          ? String((result.error as { message?: unknown }).message)
          : "Vercel could not add this domain.",
        response.status
      );
    }

    const verified = result.verified === true;
    const { data, error } = await auth.supabase
      .from("portfolios")
      .update({
        custom_domain: domain,
        domain_status: verified ? "verified" : "pending",
        domain_instructions: result,
      })
      .eq("id", portfolioId)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      portfolio: data,
      domain,
      status: verified ? "verified" : "pending",
      instructions: result,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to add domain.",
      500
    );
  }
}
