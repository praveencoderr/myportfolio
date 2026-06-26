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

const monthPattern =
  "(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)";

type ResumeExtract = {
  profile: Record<string, unknown>;
  metrics: Record<string, unknown>[];
  skills: Record<string, unknown>[];
  experience: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  education: Record<string, unknown>[];
  achievements: Record<string, unknown>[];
};

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

function cleanLine(line: string) {
  return line.replace(/\s+/g, " ").trim();
}

function getLines(text: string) {
  return text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean);
}

function unique(values: string[]) {
  return Array.from(new Set(values.map(cleanLine).filter(Boolean)));
}

function extractSection(lines: string[], headings: string[]) {
  const normalizedHeadings = headings.map((heading) => heading.toLowerCase());
  const allSectionHeadings = [
    "summary",
    "profile",
    "skills",
    "technical skills",
    "experience",
    "work experience",
    "professional experience",
    "projects",
    "education",
    "achievements",
    "certifications",
    "awards",
  ];
  const startIndex = lines.findIndex((line) =>
    normalizedHeadings.includes(line.toLowerCase().replace(/:$/, ""))
  );

  if (startIndex === -1) {
    return [];
  }

  const sectionLines: string[] = [];
  for (const line of lines.slice(startIndex + 1)) {
    const normalized = line.toLowerCase().replace(/:$/, "");
    if (allSectionHeadings.includes(normalized)) {
      break;
    }
    sectionLines.push(line);
  }

  return sectionLines;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function guessSkillCategory(name: string) {
  const lower = name.toLowerCase();

  if (/(react|next|tailwind|html|css|redux|frontend|framer)/.test(lower)) {
    return "Frontend";
  }

  if (/(node|express|api|postgres|mysql|mongodb|redis|prisma|sql)/.test(lower)) {
    return "Backend";
  }

  if (/(openai|llm|ai|langchain|aws|docker|kubernetes|supabase|vercel)/.test(lower)) {
    return "AI / Cloud";
  }

  return "Programming";
}

function inferRole(lines: string[], text: string) {
  const roleCandidates = [
    "Full Stack Developer",
    "Software Development Engineer",
    "SDE-I",
    "Frontend Developer",
    "React Developer",
    "Next.js Developer",
    "Backend Developer",
  ];
  const found = roleCandidates.find((role) =>
    new RegExp(escapeRegExp(role), "i").test(text)
  );

  if (found) {
    return found;
  }

  return lines.find((line) => /developer|engineer/i.test(line)) ?? "";
}

function extractProfile(lines: string[], text: string) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone =
    text.match(/(?:\+?\d[\d\s().-]{8,}\d)/)?.[0]?.replace(/[^\d+]/g, "") ??
    "";
  const urls = unique(text.match(/https?:\/\/[^\s)]+/gi) ?? []);
  const github = urls.find((url) => /github/i.test(url)) ?? "";
  const linkedin = urls.find((url) => /linkedin/i.test(url)) ?? "";
  const leetcode = urls.find((url) => /leetcode/i.test(url)) ?? "";
  const gfg =
    urls.find((url) => /(geeksforgeeks|gfg)/i.test(url)) ?? "";
  const portfolio =
    urls.find((url) => !/(github|linkedin|leetcode|geeksforgeeks|gfg)/i.test(url)) ?? "";
  const name =
    lines.find(
      (line) =>
        line.length <= 48 &&
        !/[|/@]/.test(line) &&
        !/\d/.test(line) &&
        !/resume|curriculum|developer|engineer/i.test(line)
    ) ?? "";
  const summarySection = extractSection(lines, ["summary", "profile"]);
  const summary =
    summarySection.slice(0, 3).join(" ") ||
    lines.find((line) =>
      line.length > 80 && /developer|engineer|react|node|ai/i.test(line)
    ) ||
    "";

  return {
    full_name: name,
    role: inferRole(lines, text),
    location: "",
    email,
    phone,
    portfolio_url: portfolio,
    github_url: github,
    linkedin_url: linkedin,
    leetcode_url: leetcode,
    gfg_url: gfg,
    summary,
    published: true,
  };
}

function extractSkills(lines: string[], text: string) {
  const knownSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Express",
    "Tailwind CSS",
    "Framer Motion",
    "Supabase",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Prisma",
    "SQL",
    "GraphQL",
    "REST API",
    "OpenAI",
    "LLM",
    "LangChain",
    "Python",
    "Java",
    "C++",
    "AWS",
    "Docker",
    "Kubernetes",
    "Vercel",
    "WebRTC",
    "Socket.io",
  ];
  const skillSection = extractSection(lines, ["skills", "technical skills"]);
  const sectionSkills = skillSection
    .join(",")
    .split(/[,•|]/)
    .map((item) => cleanLine(item.replace(/^[A-Za-z ]+:/, "")))
    .filter((item) => item.length > 1 && item.length <= 32);
  const matchedSkills = knownSkills.filter((skill) =>
    new RegExp(`\\b${escapeRegExp(skill)}\\b`, "i").test(text)
  );

  return unique([...matchedSkills, ...sectionSkills])
    .slice(0, 36)
    .map((name, index) => ({
      category: guessSkillCategory(name),
      name,
      featured: index < 12,
      sort_order: index + 1,
      published: true,
    }));
}

function extractMetrics(text: string) {
  const metricRules: Array<[RegExp, string]> = [
    [/(900\+?|900\s*\+?).{0,40}leetcode/i, "LeetCode problems solved"],
    [/(2m\+?|2\s+million).{0,50}events/i, "events processed monthly"],
    [/(99\.9%).{0,40}uptime/i, "production uptime"],
    [/(30%).{0,50}(cost|infra)/i, "infrastructure cost reduction"],
    [/((?:nearly\s*)?3\+?|three).{0,30}years/i, "professional experience"],
  ];

  return metricRules
    .map(([pattern, label], index) => {
      const match = text.match(pattern);
      if (!match) {
        return null;
      }

      return {
        value: cleanLine(match[1] ?? ""),
        label,
        href: "",
        sort_order: index + 1,
        published: true,
      };
    })
    .filter(Boolean) as Record<string, unknown>[];
}

function splitIntoEntries(sectionLines: string[]) {
  const dateRegex = new RegExp(
    `(${monthPattern}\\s+)?20\\d{2}|present|current`,
    "i"
  );
  const entries: string[][] = [];
  let current: string[] = [];

  for (const line of sectionLines) {
    if (dateRegex.test(line) && current.length > 0) {
      entries.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) {
    entries.push(current);
  }

  return entries;
}

function extractExperience(lines: string[]) {
  const section = extractSection(lines, [
    "experience",
    "work experience",
    "professional experience",
  ]);

  return splitIntoEntries(section)
    .slice(0, 5)
    .map((entry, index) => {
      const header = entry[0] ?? "";
      const second = entry[1] ?? "";
      const period =
        entry.find((line) =>
          new RegExp(`${monthPattern}|20\\d{2}|present|current`, "i").test(line)
        ) ?? "";
      const parts = header.split(/\s+[-|@]\s+|\s+at\s+/i).map(cleanLine);

      return {
        role: parts[0] || header,
        company: parts[1] || second,
        location: "",
        employment_type: "",
        period,
        summary: entry.slice(1, 3).join(" "),
        bullets: entry.slice(1, 6),
        tech: [],
        thumbnail: "",
        sort_order: index + 1,
        published: true,
      };
    })
    .filter((item) => item.role || item.company || item.summary);
}

function extractProjects(lines: string[]) {
  const section = extractSection(lines, ["projects"]);

  return splitIntoEntries(section)
    .slice(0, 6)
    .map((entry, index) => ({
      title: entry[0] ?? `Project ${index + 1}`,
      subtitle: "",
      description: entry.slice(1, 5).join(" "),
      image: "/p1.svg",
      icon_list: [],
      tech: [],
      live_url: "",
      code_url: "",
      case_study_url: "",
      featured: index < 2,
      sort_order: index + 1,
      published: true,
    }))
    .filter((item) => item.title || item.description);
}

function extractEducation(lines: string[]) {
  const section = extractSection(lines, ["education"]);

  return splitIntoEntries(section)
    .slice(0, 4)
    .map((entry, index) => ({
      institution: entry[0] ?? "",
      degree: entry[1] ?? "",
      location: "",
      period:
        entry.find((line) => /20\d{2}|present|current/i.test(line)) ?? "",
      sort_order: index + 1,
      published: true,
    }))
    .filter((item) => item.institution || item.degree);
}

function extractAchievements(lines: string[]) {
  const section = extractSection(lines, [
    "achievements",
    "certifications",
    "awards",
  ]);

  return section.slice(0, 8).map((line, index) => ({
    title: line.length > 80 ? `Achievement ${index + 1}` : line,
    description: line.length > 80 ? line : "",
    href: "",
    sort_order: index + 1,
    published: true,
  }));
}

function fallbackExtract(text: string): ResumeExtract {
  const lines = getLines(text);

  return {
    profile: extractProfile(lines, text),
    metrics: extractMetrics(text),
    skills: extractSkills(lines, text),
    experience: extractExperience(lines),
    projects: extractProjects(lines),
    education: extractEducation(lines),
    achievements: extractAchievements(lines),
  };
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
          gfg_url: { type: "string" },
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
          "gfg_url",
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
    let extracted: ResumeExtract | Record<string, unknown> =
      fallbackExtract(text);
    let parser = "built-in";
    let warning = "";

    if (process.env.OPENAI_API_KEY) {
      try {
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

        extracted = JSON.parse(response.output_text || "{}") as Record<
          string,
          unknown
        >;
        parser = "openai";
      } catch (error) {
        warning =
          error instanceof Error
            ? `OpenAI parse failed, used built-in parser instead: ${error.message}`
            : "OpenAI parse failed, used built-in parser instead.";
      }
    }

    return NextResponse.json({
      resumePath,
      extracted,
      parser,
      warning,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Resume parsing failed.",
      500
    );
  }
}
