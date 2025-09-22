import { z } from "zod";

export const ValidateRequestSchema = z.object({
  code: z
    .string()
    .min(1, "Please enter a referral code")
    .regex(/^[a-zA-Z0-9_-]+$/, "Code can only contain letters, numbers, dashes, and underscores")
    .transform((val) => val.trim()),
});

export type ValidateRequest = z.infer<typeof ValidateRequestSchema>;

export type ValidateResponse = {
  ok: boolean;
  valid: boolean | null;
  message?: string;
  raw?: unknown;
  eligibility?: string;
  metadata?: {
    name?: string;
    email?: string;
    phone?: string;
    referral_code?: string;
    usage?: number;
    row_number?: number;
    eligibility?: string;
    [key: string]: any;
  };
};