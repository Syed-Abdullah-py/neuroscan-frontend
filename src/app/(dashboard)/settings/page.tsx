import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/auth.actions";
import { SettingsShell } from "@/features/settings/components/settings-shell";
import type { WorkspaceRole } from "@/lib/types/workspace.types";

export default async function SettingsPage() {
    // getCurrentUser() only decodes the JWT cookie - zero network calls
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // workspaceRole comes from the layout's sidebar context on the client
    // Settings doesn't need it server-side - nothing is gated on role here
    return (
        <SettingsShell
            user={{
                id: user.id,
                name: user.name,
                email: user.email,
                globalRole: user.globalRole,
                avatar: user.avatar,
            }}
            workspaceRole={null}
        />
    );
}