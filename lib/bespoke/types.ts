import type { BespokeConcentration, BespokeSizeOption } from "@/lib/bespoke/options";
import type { BespokeStatus } from "@/lib/bespoke/status";

export type BespokeRequestRecord = {
  id: string;
  reference: string;
  perfumeName: string;
  brandName: string;
  sizeOption: BespokeSizeOption | null;
  customSize: string;
  quantity: number;
  concentration: BespokeConcentration | null;
  notes: string;
  phone: string;
  status: BespokeStatus;
  internalNote: string;
  proposedPriceSar: number | null;
  fulfillmentEstimate: string;
  quotedAt: string | null;
  customerResponseAt: string | null;
  customerResponse: "approved" | "rejected" | null;
  createdAt: string;
  updatedAt: string;
  quoteWhatsAppUrl: string | null;
};

export type PublicQuoteView = {
  reference: string;
  perfumeName: string;
  brandName: string;
  sizeOption: BespokeSizeOption | null;
  customSize: string;
  quantity: number;
  concentration: BespokeConcentration | null;
  proposedPriceSar: number;
  fulfillmentEstimate: string;
  status: BespokeStatus;
  customerResponse: "approved" | "rejected" | null;
};
