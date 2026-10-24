import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isOrderProcessingHalted } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { BundlePortalShell } from "@/components/bundle-portal-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const halted = await isOrderProcessingHalted();

  const maintenanceModeSetting = await prisma.systemSetting.findUnique({
    where: { key: "maintenance_mode_enabled" },
  });

  if (maintenanceModeSetting?.value === "true" && user.role !== "ADMIN") {
    redirect("/maintenance");
  }

  return (
    <BundlePortalShell user={user}>
      {children}
    </BundlePortalShell>
  );
}
