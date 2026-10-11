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

      <div className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
