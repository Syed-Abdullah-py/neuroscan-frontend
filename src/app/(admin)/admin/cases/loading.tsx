import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCasesLoading() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

            {/* 1. Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-9 w-64 mb-1" />
                    <Skeleton className="h-5 w-80" />
                </div>
                <Skeleton className="h-10 w-40 rounded-xl" />
            </div>

            {/* 2. Content Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

                {/* Table Header */}
                <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 flex">
                    <Skeleton className="h-4 w-1/6" />
                    <Skeleton className="h-4 w-1/6 ml-4" />
                    <Skeleton className="h-4 w-1/6 ml-4" />
                    <Skeleton className="h-4 w-1/6 ml-4" />
                    <Skeleton className="h-4 w-1/6 ml-4" />
                    <Skeleton className="h-4 w-20 ml-auto" />
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[1, 2, 3, 4, 5, 6].map((row) => (
                        <div key={row} className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3 w-1/6">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="flex flex-col gap-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <div className="w-1/6 px-4"><Skeleton className="h-6 w-16" /></div>
                            <div className="w-1/6 px-4"><Skeleton className="h-6 w-20 rounded-full" /></div>
                            <div className="w-1/6 px-4"><Skeleton className="h-4 w-24" /></div>
                            <div className="w-1/6 px-4"><Skeleton className="h-4 w-32" /></div>
                            <div className="w-20 pl-4 text-right"><Skeleton className="h-8 w-16 rounded-lg ml-auto" /></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
