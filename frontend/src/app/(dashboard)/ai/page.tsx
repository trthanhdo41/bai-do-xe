"use client";

import { RoleGuard } from "@/components/layout/role-guard";
import { AiView } from "@/features/ai/ai-view";

export default function AiPage() {
  return (
    <RoleGuard allowedRoles={["admin", "staff"]}>
      <AiView />
    </RoleGuard>
  );
}
