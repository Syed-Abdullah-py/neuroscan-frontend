import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
    return (
        <div className="min-h-screen bg-transparent text-black dark:text-white">
            <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">

                {/* 1. Header Section Skeleton */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <div>
                        <Skeleton className="h-10 w-48 mb-2" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                    <div>
                        <Skeleton className="h-8 w-32 rounded-lg" />
                    </div>
                </div>

                {/* 2. Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-gray-900/40 border border-neutral-200 dark:border-slate-700/50 h-[160px]">
                            <div className="flex justify-between items-start mb-4">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <Skeleton className="h-6 w-16 rounded-md" />
                            </div>
                            <div>
                                <Skeleton className="h-9 w-24 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. Patient Management Skeleton */}
                <div className="space-y-4 pt-2">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-7 w-40" />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <Skeleton className="h-10 w-full md:w-64 rounded-full" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-32 rounded-full" />
                                <Skeleton className="h-10 w-32 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Table Skeleton */}
                    <div className="rounded-3xl border border-neutral-200 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-gray-900/20 shadow-sm">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <Skeleton className="h-7 w-48" />
                        </div>
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <div key={row} className="flex justify-between items-center">
                                    <div className="flex gap-4 items-center flex-1">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-24 hidden md:block" />
                                    <Skeleton className="h-4 w-24 hidden md:block" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-8 w-8 rounded-lg" />
                                        <Skeleton className="h-8 w-8 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
