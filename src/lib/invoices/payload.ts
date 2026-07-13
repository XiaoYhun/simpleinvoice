import type { InvoiceFormValues } from "./schema";

interface Extension {
  addDeduct: "ADD" | "DEDUCT";
  type: "PERCENTAGE" | "FIXED_VALUE";
  value: number;
  name: string;
}

export interface CreateInvoicePayload {
  invoices: [
    {
      bankAccount: {
        bankId: string;
        sortCode: string;
        accountNumber: string;
        accountName: string;
      };
      customer: {
        firstName: string;
        lastName: string;
        contact: { email: string; mobileNumber: string };
        addresses: Array<{
          premise: string;
          countryCode: string;
          postcode: string;
          county: string;
          city: string;
          addressType: "BILLING";
        }>;
      };
      invoiceReference: string;
      invoiceNumber: string;
      currency: string;
      invoiceDate: string;
      dueDate: string;
      description: string;
      extensions: Extension[];
      items: Array<{
        itemReference: string;
        itemName: string;
        description: string;
        quantity: number;
        rate: number;
        itemUOM: string;
        extensions: Extension[];
      }>;
    },
  ];
}

/**
 * Turns the flat form model into the nested shape the invoice-service expects.
 * The service accepts a batch, but the brief limits us to one invoice with one
 * line item, so we always emit a single-element `invoices` array.
 */
export function buildCreateInvoicePayload(values: InvoiceFormValues): CreateInvoicePayload {
  const extensions: Extension[] = [];
  if (values.taxPercent && values.taxPercent > 0) {
    extensions.push({ addDeduct: "ADD", type: "PERCENTAGE", value: values.taxPercent, name: "tax" });
  }
  if (values.discountValue && values.discountValue > 0) {
    extensions.push({ addDeduct: "DEDUCT", type: "FIXED_VALUE", value: values.discountValue, name: "discount" });
  }

  return {
    invoices: [
      {
        bankAccount: {
          bankId: "",
          sortCode: values.bankSortCode,
          accountNumber: values.bankAccountNumber,
          accountName: values.bankAccountName,
        },
        customer: {
          firstName: values.customerFirstName,
          lastName: values.customerLastName,
          contact: { email: values.customerEmail, mobileNumber: values.customerMobile },
          addresses: [
            {
              premise: values.addressPremise,
              countryCode: values.addressCountryCode.toUpperCase(),
              postcode: values.addressPostcode,
              county: values.addressCounty,
              city: values.addressCity,
              addressType: "BILLING",
            },
          ],
        },
        invoiceReference: values.invoiceReference?.trim() || values.invoiceNumber,
        invoiceNumber: values.invoiceNumber,
        currency: values.currency,
        invoiceDate: values.invoiceDate,
        dueDate: values.dueDate,
        description: values.description?.trim() ?? "",
        extensions,
        items: [
          {
            itemReference: `${values.invoiceNumber}-1`,
            itemName: values.itemName,
            description: values.itemDescription?.trim() || values.itemName,
            quantity: values.quantity,
            rate: values.rate,
            itemUOM: values.itemUOM,
            extensions: [],
          },
        ],
      },
    ],
  };
}
