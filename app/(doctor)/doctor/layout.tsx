export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar or Header could go here */}
            <main className="p-4">{children}</main>
        </div>
    );
}
