import { NextRequest, NextResponse } from "next/server";

import {
  ensureUserPortfolio,
  jsonError,
  readContent,
  requireAuth,
} from "@/lib/server-content";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);

  if ("error" in auth) {
    return auth.error;
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      publish?: boolean;
      title?: string;
      slug?: string;
    };
    const result = await ensureUserPortfolio(auth.supabase, auth.user, {
      publish: body.publish,
      title: body.title,
      slug: body.slug,
    });
    const content = await readContent(auth.supabase, {
      portfolioId: result.portfolio.id,
      user: auth.user,
      isAdmin: auth.isAdmin,
    });

    return NextResponse.json({
      portfolio: result.portfolio,
      url: result.url,
      content,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to create portfolio workspace.",
      500
    );
  }
}
