import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Custom domain status checks are disabled. This CMS edits only the Praveen Gupta portfolio content.",
    },
    { status: 410 }
  );
}
