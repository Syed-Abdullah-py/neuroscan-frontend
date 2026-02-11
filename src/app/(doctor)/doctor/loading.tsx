import { Skeleton } from "@/components/ui/skeleton";

export default function DoctorDashboardLoading() {
    return (
        <div className="min-h-screen bg-transparent text-black dark:text-white">
            <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <div>
                        <Skeleton className="h-10 w-48 mb-2" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                    <div>
                        <Skeleton className="hidden md:block h-8 w-32 rounded-lg" />
                    </div>
                </div>

                {/* 2. Stats Grid */}
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

                {/* 3. Main Data Table Section */}
                <div className="space-y-4 pt-2">

                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-7 w-48" />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Skeleton className="h-9 w-48 rounded-lg" />
                            <Skeleton className="h-9 w-32 rounded-lg" />
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="rounded-xl border border-neutral-200 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-gray-900/20 shadow-sm">
                        <div className="p-4 border-b border-neutral-200 dark:border-slate-700/50 bg-neutral-50/50 dark:bg-gray-900/50 flex">
                            <Skeleton className="h-4 w-24 mr-auto" />
                            <Skeleton className="h-4 w-20 mx-4" />
                            <Skeleton className="h-4 w-20 mx-4" />
                            <Skeleton className="h-4 w-24 mx-4" />
                            <Skeleton className="h-4 w-12 ml-4" />
                        </div>
                        <div className="divide-y divide-neutral-100 dark:divide-slate-700/30">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <div key={row} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Skeleton className="w-9 h-9 rounded-lg" />
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                    <div className="w-24 px-4"><Skeleton className="h-6 w-16 rounded-md" /></div>
                                    <div className="w-24 px-4"><Skeleton className="h-6 w-20 rounded-full" /></div>
                                    <div className="w-32 px-4"><Skeleton className="h-4 w-24" /></div>
                                    <div className="w-16 pl-4 text-right"><Skeleton className="h-8 w-16 rounded-lg ml-auto" /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
