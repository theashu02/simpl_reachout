import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Separator } from "@radix-ui/react-dropdown-menu";
import { Search } from "lucide-react";
import { memo } from "react";
// import CompanyTable from "./CompanyTable";
import CustomSkeleton from "./CustomSkeleton";
import dynamic from "next/dynamic";

const CompanyTable = dynamic(() => import("./CompanyTable"), {
  loading: () => <CustomSkeleton />,
});

const CompanySearch = () => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Domain Search</h2>
          {/* <div className="text-slate-400 cursor-help" title="Search for company domains and details">
          </div> */}
        </div>

        <Button variant="outline" className="gap-2 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
          Upload a list of domains to search
        </Button>
      </div>

      {/* Big Search Input */}
      <div className="relative">
        <Input
          placeholder="Enter a domain or company name..."
          className="h-14 pl-4 pr-14 text-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600"
        />
        <Button variant="ghost" className="absolute right-0 top-0 h-full w-14 p-0 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          <Search className="h-full w-full" />
        </Button>
      </div>

      {/* Recent Searches */}
      <div className="space-y-4">
        <CompanyTable />
      </div>
    </>
  );
}

export default memo(CompanySearch)