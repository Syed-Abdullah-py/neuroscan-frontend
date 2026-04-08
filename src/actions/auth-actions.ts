// Compatibility shim — re-exports from the canonical location.
// All NEW code should import from @/features/auth/actions/auth.actions
// All existing components still work without any changes.
export {
    loginUser,
    registerUser,
    verifyOtp,
    resendOtp,
    logoutUser,
    getAuthToken,
    getCurrentUser,
    type SignupState,
} from "@/features/auth/actions/auth.actions";

// Workspace actions — still live here until Phase 6 migrates them.
// Stubbed so old imports don't crash the build.
export async function getUserWorkspaces() { return []; }
export async function switchWorkspace(_id: string) { return { success: true }; }
export async function getJoinRequests() { return []; }
export async function getTeamMembers() { return []; }
export async function createWorkspace(_name: string) { return { success: false, message: "Not implemented yet" }; }
export async function updateWorkspace(_id: string, _name: string) { return { success: false, message: "Not implemented yet" }; }
export async function deleteWorkspace(_id: string) { return { success: false, message: "Not implemented yet" }; }
export async function addWorkspaceMember(_wid: string, _email: string, _role: string) { return { success: false, message: "Not implemented yet" }; }
export async function removeWorkspaceMember(_wid: string, _uid: string) { return { success: false, message: "Not implemented yet" }; }
export async function inviteUser(_email: string, _wid?: string) { return { success: false, message: "Not implemented yet" }; }
export async function acceptInvitation(_id: string) { return { success: false, message: "Not implemented yet" }; }
export async function rejectInvitation(_id: string) { return { success: false, message: "Not implemented yet" }; }
export async function getMyInvitations() { return []; }
export async function getWorkspaceInvitations(_wid: string) { return []; }
export async function getDiscoverableWorkspaces() { return []; }
export async function requestJoinWorkspace(_wid: string) { return { success: false, message: "Not implemented yet" }; }
export async function leaveWorkspace(_wid: string) { return { success: false, message: "Not implemented yet" }; }
export async function resolveJoinRequest(_id: string, _action: "approve" | "reject") { return { success: false, message: "Not implemented yet" }; }
export async function searchUsers(_query: string) { return []; }
export async function createWorkspaceFromForm(_prevState: any, formData: FormData) {
    const name = formData.get("workspaceName") as string;
    if (!name) return { success: false, message: "Name required" };
    return { success: false, message: "Not implemented yet" };
}
export async function requestJoinWorkspaceFromForm(_prevState: any, formData: FormData) {
    return { success: false, message: "Not implemented yet" };
}