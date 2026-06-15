"use client";

import { RoleGuard } from "@/components/layout/role-guard";
import { ShiftsView } from "@/features/shifts/shifts-view";

export default function ShiftsPage() {
  return (
    <RoleGuard allowedRoles={["admin", "staff"]}>
      <ShiftsView />
    </RoleGuard>
  );
}
