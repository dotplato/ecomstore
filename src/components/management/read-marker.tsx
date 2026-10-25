"use client";
import { useEffect } from "react";
import { markThreadRead } from "@/actions/support";
export function ReadMarker({ id, seenAt }: { id: string; seenAt: string }) {
  useEffect(() => { void markThreadRead(id, seenAt); }, [id, seenAt]);
  return null;
}
