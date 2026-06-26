import { NextRequest, NextResponse } from "next/server";

import type { ContentPayload } from "@/lib/content-types";
import {
  getOptionalAuth,
  jsonError,
  readContent,
  requireAuth,
  saveContent,
  userCanManagePortfolio,
} from "@/lib/server-content";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await getOptionalAuth(request);

  if ("error" in auth) {
    return auth.error;
  }

  try {
    const portfolioId = request.nextUrl.searchParams.get("portfolioId");
    const slug = request.nextUrl.searchParams.get("slug");
    const content = await readContent(auth.supabase, {
      portfolioId,
      slug,
      user: auth.user,
      isAdmin: auth.isAdmin,
    });

    return NextResponse.json(content);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to load CMS content.",
      500
    );
  }
}

export async function PUT(request: NextRequest) {
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
      return jsonError("You cannot update this portfolio.", 403);
    }

    const content = (await request.json()) as ContentPayload;
    await saveContent(auth.supabase, portfolioId, content);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to save CMS content.",
      500
    );
  }
}
