import { NextRequest, NextResponse } from "next/server";
import { ValidateRequestSchema } from "@/lib/validation";
import { z } from "zod";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const toPositiveNumber = (value: string | number | undefined, fallback: number) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const RATE_LIMIT_MAX = toPositiveNumber(process.env.VALIDATOR_RATE_LIMIT_MAX, 150);
const RATE_LIMIT_WINDOW = toPositiveNumber(
  process.env.VALIDATOR_RATE_LIMIT_WINDOW_MS,
  15 * 60 * 1000
); // default 15 minutes

function getClientIP(req: NextRequest): string {
  return req.ip || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

function normalizeN8nResponse(raw: any, status: number) {
  const str = (v: any) => (typeof v === "string" ? v : undefined);
  const num = (v: any) => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const parsed = Number(v);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  // valid = whether the referral code exists
  let valid: boolean | null = null;
  if (status === 200) valid = true;
  else if (status === 404) valid = false;

  const metadata: {
    name?: string;
    email?: string;
    phone?: string;
    referral_code?: string;
    usage?: number;
    row_number?: number;
  } = {};

  const name = str(raw?.first_name) ?? str(raw?.name);
  const email = str(raw?.email);
  const phone = str(raw?.phone);
  const referralCode = str(raw?.referral_code) ?? str(raw?.code);
  const usage = num(raw?.usage);
  const rowNumber = num(raw?.row_number);

  if (name) metadata.name = name;
  if (email) metadata.email = email;
  if (phone) metadata.phone = phone;
  if (referralCode) metadata.referral_code = referralCode;
  if (usage !== undefined) metadata.usage = usage;
  if (rowNumber !== undefined) metadata.row_number = rowNumber;

  const hasUserDetails = Boolean(name || email || phone);
  const eligibility = valid === true
    ? hasUserDetails
      ? "Eligible"
      : "Details unavailable"
    : undefined;

  const fallbackMessage = (() => {
    if (valid === true) {
      return hasUserDetails
        ? "Referral code is valid."
        : "Referral code is valid, but no user details were returned.";
    }
    if (valid === false) return "Referral code not found.";
    return "Unexpected response from referral service.";
  })();

  return {
    valid,
    message: str(raw?.message) ?? fallbackMessage,
    eligibility,
    metadata: Object.keys(metadata).length ? metadata : undefined,
  };
}


export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req);

  // Rate limiting
  if (!checkRateLimit(clientIP)) {
    return NextResponse.json(
      {
        ok: false,
        valid: null,
        message: "Too many requests. Please wait a few minutes before trying again.",
      },
      { status: 429 }
    );
  }

  try {
    // Validate request body
    const body = await req.json().catch(() => ({}));
    const parseResult = ValidateRequestSchema.safeParse(body);

    if (!parseResult.success) {
      const error = parseResult.error.errors[0];
      return NextResponse.json(
        {
          ok: false,
          valid: null,
          message: error.message,
        },
        { status: 400 }
      );
    }

    const { code } = parseResult.data;

    // Log the validation attempt (with masked code for privacy)
    const maskedCode = code.length > 4 
      ? `${code.slice(0, 2)}***${code.slice(-2)}`
      : `${code.slice(0, 1)}***`;
    console.log(`[${new Date().toISOString()}] Validation attempt: ${maskedCode} from ${clientIP}`);

    // Mock mode for development
    if (process.env.MOCK === "1") {
      const isValid = code.endsWith("7") || code.toLowerCase().includes("test");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      return NextResponse.json({
        ok: true,
        valid: isValid,
        message: isValid ? "Referral code is valid (mock)." : "Referral code is invalid (mock).",
        metadata: isValid ? { code, owner: "Test User", notes: "This is a mock response" } : undefined,
        raw: { status: isValid ? "found" : "not_found", code, mock: true },
      });
    }

    // Call n8n webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL || "https://academyofsigma.app.n8n.cloud/webhook/search-referral";
    const timeoutMs = Number(process.env.VALIDATOR_TIMEOUT_MS || 10000);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-aos-key": "aos-scaleflow-validator",
        },
        body: JSON.stringify({ code }),
        signal: controller.signal,
      });

      const rawData = await response.json().catch(() => ({}));
      const normalized = normalizeN8nResponse(rawData, response.status);

      console.log(`[${new Date().toISOString()}] Validation result for ${maskedCode}: ${normalized.valid}`);

      return NextResponse.json(
        {
          ok: response.ok,
          ...normalized,
          raw: rawData,
        },
        { status: response.status }
      );
    } catch (error: any) {
      const message =
        error?.name === "AbortError"
          ? "Request timed out. Please try again."
          : "Network error. Please check your connection and try again.";

      console.error(`[${new Date().toISOString()}] Validation error for ${maskedCode}:`, error.message);

      return NextResponse.json(
        {
          ok: false,
          valid: null,
          message,
        },
        { status: 504 }
      );
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API route error:`, error);
    
    return NextResponse.json(
      {
        ok: false,
        valid: null,
        message: "Internal server error. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "This endpoint only accepts POST requests." },
    { status: 405 }
  );
}
