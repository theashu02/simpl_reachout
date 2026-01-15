"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import CustomSkeleton from "./components/CustomSkeleton";

const EmailSearch = dynamic(() => import("./components/EmailSearch"), {
  loading: () => <CustomSkeleton />,
});

const CompanySearch = dynamic(() => import("./components/CompanySearch"), {
  loading: () => <CustomSkeleton />,
});

export default function FinderPage() {
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 font-geist overflow-hidden">
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto py-2 px-4 min-h-0">
        {/* Main Tabs Interface */}
        <Tabs defaultValue="company" className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-none pb-2 shrink-0">
            <TabsList className="grid w-full max-w-xl grid-cols-2 h-14 bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
              <TabsTrigger
                value="company"
                className="rounded-lg text-xs sm:text-base font-semibold text-slate-600 dark:text-slate-300 transition-all dark:data-[state=active]:bg-slate-800 data-[state=active]:bg-slate-200 dark:data-[state=active]:text-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md sm:tracking-widest"
              >
                Find Company
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="rounded-lg text-xs sm:text-base font-semibold text-slate-600 dark:text-slate-300 transition-all dark:data-[state=active]:bg-slate-800 data-[state=active]:bg-slate-200 dark:data-[state=active]:text-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md sm:tracking-widest"
              >
                Find Email by Name
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Find Company Content - Domain Search Style */}
          <TabsContent value="company" className="flex-1 flex flex-col min-h-0 focus-visible:outline-none animate-in fade-in-50 duration-500 mt-0 data-[state=inactive]:hidden">
            <CompanySearch />
          </TabsContent>

          {/* Find Email Content - Email Finder Style */}
          <TabsContent value="email" className="flex-1 flex flex-col min-h-0 focus-visible:outline-none space-y-8 animate-in fade-in-50 duration-500 mt-0 data-[state=inactive]:hidden">
            <EmailSearch />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
