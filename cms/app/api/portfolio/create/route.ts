import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Portfolio workspace creation is disabled. This CMS edits only the Praveen Gupta portfolio.",
    },
    { status: 410 }
  );
}
