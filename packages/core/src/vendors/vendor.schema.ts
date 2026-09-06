import { z } from "zod";

import { E164_PHONE } from "../contracts/content";

/** The exact wording shown to the vendor. Stored verbatim with the timestamp. */
export const CONSENT_TEXT =
  "I give permission for Nazarii Tsubera to use these photos and my business details, " +
  "including my phone number, to build my website and to show that website in " +
  "Nazarii Tsubera's portfolio.";

const phone = z
  .string()
  .trim()
  .transform((value) => {
    const digits = value.replace(/[^\d+]/g, "");
    if (digits.startsWith("+")) return digits;
    const bare = digits.replace(/\D/g, "");
    return bare.length === 10 ? `+1${bare}` : `+${bare}`;
  })
  .pipe(z.string().regex(E164_PHONE, "Enter a valid phone number"));

export const createVendorSchema = z.object({
  businessName: z.string().trim().min(1).max(80),
  contactName: z.string().trim().max(80).nullish(),
  phone,
  instagramHandle: z
    .string()
    .trim()
    .max(30)
    .nullish()
    .transform((v) => (v ? v.replace(/^@/, "") : null)),
  marketId: z.uuid().nullish(),
  bestSellerNote: z.string().trim().max(200).nullish(),
  consent: z.literal(true, { message: "Photo consent is required" }),
});
export type CreateVendorInput = z.infer<typeof createVendorSchema>;

export const updateVendorSchema = createVendorSchema
  .omit({ consent: true })
  .partial()
  .extend({ designNotes: z.string().trim().max(500).nullish(), themeOverride: z.string().nullish() });
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
