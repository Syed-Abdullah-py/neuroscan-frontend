import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPatientsLoading() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

            {/* 1. Page Header */}
            <div className="flex flex-col gap-1">
                <Skeleton className="h-10 w-64" />
            </div>

            {/* 2. Patient Management Component Skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

                {/* Header & Toolbar */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Skeleton className="h-7 w-48" />
                    </div>

                    {/* Search & Actions Placeholder */}
                    <div className="flex gap-3 w-full md:w-auto">
                        <Skeleton className="h-10 w-full md:w-64 rounded-full" />
                        <Skeleton className="h-10 w-32 rounded-full" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <div className="bg-slate-50 dark:bg-slate-950/50 flex p-4 border-b border-slate-200 dark:border-slate-800">
                        <Skeleton className="h-4 w-1/5 mr-4" />
                        <Skeleton className="h-4 w-1/5 mx-4" />
                        <Skeleton className="h-4 w-1/5 mx-4" />
                        <Skeleton className="h-4 w-1/5 mx-4" />
                        <Skeleton className="h-4 w-20 ml-auto" />
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[1, 2, 3, 4, 5, 6].map((row) => (
                            <div key={row} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 w-1/5">
                                    <div className="flex flex-col gap-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <div className="w-1/5 px-4"><Skeleton className="h-4 w-24" /></div>
                                <div className="w-1/5 px-4"><Skeleton className="h-4 w-24" /></div>
                                <div className="w-1/5 px-4"><Skeleton className="h-4 w-32" /></div>
                                <div className="w-20 pl-4 text-right flex gap-2 justify-end">
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
