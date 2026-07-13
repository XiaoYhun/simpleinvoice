import { z } from "zod";

import { CURRENCY_OPTIONS, UOM_OPTIONS } from "./constants";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date");

const money = z.coerce
  .number({ error: "Enter a number" })
  .refine((n) => Number.isFinite(n), "Enter a number");

export const invoiceFormSchema = z
  .object({
    // Customer
    customerFirstName: z.string().trim().min(1, "First name is required"),
    customerLastName: z.string().trim().min(1, "Last name is required"),
    customerEmail: z.email("Enter a valid email"),
    customerMobile: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s-]{6,20}$/, "Enter a valid phone number"),

    // Billing address
    addressPremise: z.string().trim().min(1, "Address line is required"),
    addressCity: z.string().trim().min(1, "City is required"),
    addressCounty: z.string().trim().min(1, "County is required"),
    addressPostcode: z.string().trim().min(1, "Postcode is required"),
    addressCountryCode: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{2}$/, "Use a 2-letter country code"),

    // Bank account the invoice is payable to
    bankAccountName: z.string().trim().min(1, "Account name is required"),
    bankAccountNumber: z
      .string()
      .trim()
      .regex(/^[0-9]{6,12}$/, "6–12 digits"),
    bankSortCode: z
      .string()
      .trim()
      .regex(/^\d{2}-\d{2}-\d{2}$/, "Format 00-00-00"),

    // Invoice header
    invoiceNumber: z.string().trim().min(1, "Invoice number is required"),
    invoiceReference: z.string().trim().optional(),
    currency: z.enum(CURRENCY_OPTIONS),
    invoiceDate: isoDate,
    dueDate: isoDate,
    description: z.string().trim().max(500, "Keep it under 500 characters").optional(),

    // Single line item
    itemName: z.string().trim().min(1, "Item name is required"),
    itemDescription: z.string().trim().optional(),
    itemUOM: z.enum(UOM_OPTIONS),
    quantity: z.coerce.number().int("Whole numbers only").min(1, "At least 1"),
    rate: money.refine((n) => n >= 0, "Cannot be negative"),

    // Optional adjustments
    taxPercent: money
      .refine((n) => n >= 0 && n <= 100, "0–100")
      .optional(),
    discountValue: money.refine((n) => n >= 0, "Cannot be negative").optional(),
  })
  .refine((v) => v.dueDate >= v.invoiceDate, {
    path: ["dueDate"],
    message: "Due date cannot be before the invoice date",
  });

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
