export default function DashboardPage() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                    <span className="text-2xl">🧠</span>
                </div>
                <h1 className="text-xl font-bold text-black dark:text-white">
                    Dashboard
                </h1>
                <p className="text-sm text-neutral-500">
                    Coming in Phase 5.
                </p>
            </div>
        </div>
    );
}