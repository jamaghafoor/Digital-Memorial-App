import React from "react";
import type { MemorialDraft } from "../types";
import { MemorialHeadstone } from "./MemorialHeadstone";

/** @deprecated Use MemorialHeadstone directly. Kept for compatibility with older callers. */
export function MemorialPreview({ item }: { item: MemorialDraft }) {
  return <MemorialHeadstone memorial={item} />;
}
