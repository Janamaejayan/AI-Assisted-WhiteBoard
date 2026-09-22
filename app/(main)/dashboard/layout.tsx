import AppHeader from "@/components/custom/dashboard/AppHeader";
import React from "react";

const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />

      <div className="flex-1 p-5">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;