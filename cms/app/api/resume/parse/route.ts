import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Resume import is disabled. This CMS edits only the Praveen Gupta portfolio content.",
    },
    { status: 410 }
  );
}
