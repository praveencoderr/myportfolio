import { NextRequest, NextResponse } from "next/server";

import { defaultPortfolioId, type ContentPayload } from "@/lib/content-types";
import {
  createServiceClient,
  getOptionalAuth,
  getConfig,
  jsonError,
  readContent,
  saveContent,
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
  const config = getConfig();

  if (!config) {
    return jsonError("CMS environment is incomplete.", 500);
  }

  try {
    const content = (await request.json()) as ContentPayload;
    const supabase = createServiceClient(config);
    await saveContent(supabase, defaultPortfolioId, content);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to save CMS content.",
      500
    );
  }
}
