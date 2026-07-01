/**
 * Claim Vendor — Mock data kosong.
 * Data diisi melalui CRUD (local state).
 */

import type { ClaimEntry } from "./types";

export const claimVendorData: ClaimEntry[] = [];

export const VENDOR_OPTIONS: string[] = ["Balrich", "Majur", "GTU", "Sumber Mas", "Delta Cargo"];
export const STATUS_OPTIONS: ("Pending" | "Lunas")[] = ["Pending", "Lunas"];
