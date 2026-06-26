import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";

import { jsonError, requireAuth } from "@/lib/server-content";

export const runtime = "nodejs";

const maxResumeBytes = 10 * 1024 * 1024;
const supportedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

async function extractText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }

  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function resumeSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      profile: {
        type: "object",
        additionalProperties: false,
        properties: {
          full_name: { type: "string" },
          role: { type: "string" },
          location: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          portfolio_url: { type: "string" },
          github_url: { type: "string" },
          linkedin_url: { type: "string" },
          leetcode_url: { type: "string" },
          summary: { type: "string" },
          published: { type: "boolean" },
        },
        required: [
          "full_name",
          "role",
          "location",
          "email",
          "phone",
          "portfolio_url",
          "github_url",
          "linkedin_url",
          "leetcode_url",
          "summary",
          "published",
        ],
      },
      metrics: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            value: { type: "string" },
            label: { type: "string" },
            href: { type: "string" },
            sort_order: { type: "number" },
            published: { type: "boolean" },
          },
          required: ["value", "label", "href", "sort_order", "published"],
        },
      },
      skills: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            category: { type: "string" },
            name: { type: "string" },
            featured: { type: "boolean" },
            sort_order: { type: "number" },
            published: { type: "boolean" },
          },
          required: [
            "category",
            "name",
            "featured",
            "sort_order",
            "published",
          ],
        },
      },
      experience: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            role: { type: "string" },
            company: { type: "string" },
            location: { type: "string" },
            employment_type: { type: "string" },
            period: { type: "string" },
            summary: { type: "string" },
            bullets: { type: "array", items: { type: "string" } },
            tech: { type: "array", items: { type: "string" } },
            thumbnail: { type: "string" },
            sort_order: { type: "number" },
            published: { type: "boolean" },
          },
          required: [
            "role",
            "company",
            "location",
            "employment_type",
            "period",
            "summary",
            "bullets",
            "tech",
            "thumbnail",
            "sort_order",
            "published",
          ],
        },
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            description: { type: "string" },
            image: { type: "string" },
            icon_list: { type: "array", items: { type: "string" } },
            tech: { type: "array", items: { type: "string" } },
            live_url: { type: "string" },
            code_url: { type: "string" },
            case_study_url: { type: "string" },
            featured: { type: "boolean" },
            sort_order: { type: "number" },
            published: { type: "boolean" },
          },
          required: [
            "title",
            "subtitle",
            "description",
            "image",
            "icon_list",
            "tech",
            "live_url",
            "code_url",
            "case_study_url",
            "featured",
            "sort_order",
            "published",
          ],
        },
      },
      education: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            institution: { type: "string" },
            degree: { type: "string" },
            location: { type: "string" },
            period: { type: "string" },
            sort_order: { type: "number" },
            published: { type: "boolean" },
          },
          required: [
            "institution",
            "degree",
            "location",
            "period",
            "sort_order",
            "published",
          ],
        },
      },
      achievements: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            href: { type: "string" },
            sort_order: { type: "number" },
            published: { type: "boolean" },
          },
          required: ["title", "description", "href", "sort_order", "published"],
        },
      },
    },
    required: [
      "profile",
      "metrics",
      "skills",
      "experience",
      "projects",
      "education",
      "achievements",
    ],
  };
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);

  if ("error" in auth) {
    return auth.error;
  }

  if (!process.env.OPENAI_API_KEY) {
    return jsonError(
      "Resume AI is not configured. Add OPENAI_API_KEY and OPENAI_RESUME_MODEL.",
      503
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return jsonError("Upload a resume file.", 400);
    }

    if (!supportedTypes.has(file.type)) {
      return jsonError("Only PDF and DOCX resumes are supported.", 400);
    }

    if (file.size > maxResumeBytes) {
      return jsonError("Resume must be 10MB or smaller.", 400);
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const resumePath = `${auth.user.id}/${Date.now()}-${safeName}`;
    const upload = await auth.supabase.storage
      .from("resumes")
      .upload(resumePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (upload.error) {
      throw upload.error;
    }

    const text = (await extractText(file)).slice(0, 50000);
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_RESUME_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Extract portfolio CMS data from the resume. Return concise, recruiter-ready content. Use empty strings for missing URLs/text and empty arrays when a section is absent.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "resume_portfolio_extract",
          strict: true,
          schema: resumeSchema(),
        },
      },
    });

    const extracted = JSON.parse(response.output_text || "{}") as Record<
      string,
      unknown
    >;

    return NextResponse.json({
      resumePath,
      extracted,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Resume parsing failed.",
      500
    );
  }
}
