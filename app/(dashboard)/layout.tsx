import DashboardFooter from "@/components/dashboard/dashboard-footer";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import React from "react";

function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="container mx-auto">
      <DashboardHeader />
      {children}
      <DashboardFooter />
    </div>
  );
}

export default DashboardLayout;
