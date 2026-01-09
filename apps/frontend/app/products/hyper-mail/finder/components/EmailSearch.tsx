import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { memo } from "react";

const EmailSearch = () => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Email Finder</h2>
          <div className="text-slate-400 cursor-help" title="Find professional email addresses"></div>
        </div>

        <Button variant="outline" className="gap-2 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
          Upload a list of names and domains to find
        </Button>
      </div>

      <div className="flex flex-col md:flex-row shadow-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-700 focus-within:border-slate-400 dark:focus-within:border-slate-600">
        <Input className="h-14 border-0 rounded-none bg-transparent pl-4 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" placeholder="Enter a full name..." />

        <div className="h-14 flex items-center justify-center px-4 text-slate-400">
          <span className="text-lg">@</span>
        </div>

        <Input className="h-14 border-0 rounded-none bg-transparent pl-4 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" placeholder="company.com" />

        <Button
          className="h-14 w-full md:w-auto rounded-md px-8 font-semibold bg-white dark:bg-slate-900 text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-base shadow-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          variant="ghost"
        >
          Find
        </Button>
      </div>
    </>
  );
}


export default memo(EmailSearch)