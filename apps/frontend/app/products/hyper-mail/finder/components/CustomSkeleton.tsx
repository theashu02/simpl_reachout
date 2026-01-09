import { Skeleton } from '@/components/ui/skeleton'
import { memo } from 'react'

const CustomSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Skeleton className="h-8 w-40 rounded-lg bg-slate-200/80! dark:bg-slate-800/80!" />
        <Skeleton className="h-10 w-full sm:w-64 rounded-lg bg-slate-200/80! dark:bg-slate-800/80!" />
      </div>

      <Skeleton className="h-14 w-full rounded-xl bg-slate-200/80! dark:bg-slate-800/80!" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/80 shadow-sm">
          <Skeleton className="h-4 w-24 rounded-full bg-slate-200/80! dark:bg-slate-800/80!" />
          <Skeleton className="h-5 w-40 rounded-md bg-slate-200/80! dark:bg-slate-800/80!" />
          <Skeleton className="h-3 w-full rounded-md bg-slate-200/80! dark:bg-slate-800/80!" />
          <Skeleton className="h-3 w-5/6 rounded-md bg-slate-200/80! dark:bg-slate-800/80!" />
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/80 shadow-sm">
          <Skeleton className="h-4 w-20 rounded-full bg-slate-200/80! dark:bg-slate-800/80!" />
          <Skeleton className="h-5 w-48 rounded-md bg-slate-200/80! dark:bg-slate-800/80!" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full bg-slate-200/80! dark:bg-slate-800/80!" />
            <Skeleton className="h-6 w-16 rounded-full bg-slate-200/80! dark:bg-slate-800/80!" />
            <Skeleton className="h-6 w-24 rounded-full bg-slate-200/80! dark:bg-slate-800/80!" />
          </div>
          <Skeleton className="h-3 w-4/5 rounded-md bg-slate-200/80! dark:bg-slate-800/80!" />
        </div>
      </div>
    </div>
  )
}

export default memo(CustomSkeleton);