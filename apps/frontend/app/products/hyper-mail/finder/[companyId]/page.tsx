"use client";

import { useParams } from "next/navigation";
import { memo } from "react";

const CompanyDetailPage = () => {
  const params = useParams();
  const companyId = params.companyId as string;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Company Details</h1>
      <p>
        Viewing company with ID: <strong>{companyId}</strong>
      </p>

      {/* Add your company detail logic here */}
    </div>
  );
}

export default memo(CompanyDetailPage)

