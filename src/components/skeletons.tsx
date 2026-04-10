import { Skeleton } from "@/components/ui/skeleton";

// ── Shared pieces ──────────────────────────────────────────────────────────

function PageHeader({ wide = false }: { wide?: boolean }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="space-y-2">
                <Skeleton className={`h-9 ${wide ? "w-64" : "w-48"}`} />
                <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-32 rounded-full" />
        </div>
    );
}

function TableSkeleton({
    cols,
    rows = 6,
}: {
    cols: number;
    rows?: number;
}) {
    return (
        <div className="rounded-2xl border border-neutral-200 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-gray-900/20">
            {/* Table head */}
            <div className="flex gap-4 px-5 py-3.5 border-b border-neutral-200 dark:border-slate-700/50 bg-neutral-50/50 dark:bg-gray-900/50">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-3 flex-1" />
                ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 px-5 py-4 border-b border-neutral-100 dark:border-slate-700/30 last:border-0"
                >
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    {Array.from({ length: cols - 1 }).map((_, j) => (
                        <Skeleton
                            key={j}
                            className="h-4 flex-1"
                            style={{ opacity: 1 - j * 0.15 }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

function StatCardsSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div
            className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-${count} gap-5 mb-8`}
        >
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="p-6 rounded-2xl bg-white dark:bg-gray-900/40 border border-neutral-200 dark:border-slate-700/50"
                >
                    <div className="flex justify-between items-start mb-4">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="h-5 w-20 rounded-md" />
                    </div>
                    <Skeleton className="h-9 w-16 mb-2" />
                    <Skeleton className="h-3 w-28" />
                </div>
            ))}
        </div>
    );
}

// ── Page skeletons ─────────────────────────────────────────────────────────

export function DashboardPageSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-52" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-8 w-36 rounded-lg" />
            </div>

            {/* Stats */}
            <StatCardsSkeleton count={4} />

            {/* Middle row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Requests card */}
                <div className="rounded-2xl border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900/40 overflow-hidden">
                    <div className="p-5 border-b border-neutral-100 dark:border-slate-700/50">
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="p-4 space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3">
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-36" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-7 w-7 rounded-lg" />
                                    <Skeleton className="h-7 w-7 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick actions */}
                <div className="lg:col-span-2 rounded-2xl border border-neutral-200 dark:border-slate-700/50 bg-white dark:bg-gray-900/40 p-6">
                    <Skeleton className="h-3 w-28 mb-5" />
                    <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-slate-700/50"
                            >
                                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Patient table */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-40" />
                    <div className="flex gap-3">
                        <Skeleton className="h-9 w-64 rounded-full" />
                        <Skeleton className="h-9 w-32 rounded-full" />
                    </div>
                </div>
                <TableSkeleton cols={5} rows={5} />
            </div>
        </div>
    );
}

export function PatientsPageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <PageHeader />
            <TableSkeleton cols={7} rows={8} />
        </div>
    );
}

export function WorkspacesPageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left panel */}
                <div className="xl:col-span-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-40" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-8 rounded-xl" />
                                <Skeleton className="h-8 w-8 rounded-xl" />
                            </div>
                        </div>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800"
                            >
                                <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center */}
                <div className="xl:col-span-5">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
                        <div className="space-y-3">
                            <Skeleton className="h-9 w-64" />
                            <div className="flex gap-3">
                                <Skeleton className="h-7 w-20 rounded-full" />
                                <Skeleton className="h-7 w-32 rounded-full" />
                            </div>
                            <div className="flex gap-2 mt-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-9 w-24 rounded-full" />
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`p-5 rounded-2xl border border-slate-200 dark:border-slate-800 ${i === 2 ? "col-span-2" : ""}`}
                                >
                                    <Skeleton className="w-10 h-10 rounded-xl mb-3" />
                                    <Skeleton className="h-10 w-12 mb-2" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div className="xl:col-span-3 space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3"
                        >
                            <Skeleton className="h-3 w-32" />
                            {Array.from({ length: 3 }).map((_, j) => (
                                <div
                                    key={j}
                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                                >
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                    <div className="flex gap-1.5">
                                        <Skeleton className="h-7 w-7 rounded-lg" />
                                        <Skeleton className="h-7 w-7 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function CasesPageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <PageHeader wide />
            <TableSkeleton cols={6} rows={8} />
        </div>
    );
}

export function FormPageSkeleton() {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
            <div className="flex items-center gap-4">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 p-8 space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 2 }).map((_, j) => (
                            <div key={j} className="space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        ))}
                    </div>
                ))}
                <div className="flex gap-3 pt-2">
                    <Skeleton className="flex-1 h-12 rounded-xl" />
                    <Skeleton className="flex-1 h-12 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export function CaseDetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    {/* Viewer */}
                    <Skeleton className="h-[500px] rounded-2xl" />
                    {/* Patient + notes */}
                    <div className="grid grid-cols-2 gap-6">
                        <Skeleton className="h-48 rounded-2xl" />
                        <Skeleton className="h-48 rounded-2xl" />
                    </div>
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <Skeleton className="h-72 rounded-2xl" />
                    <Skeleton className="h-40 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}