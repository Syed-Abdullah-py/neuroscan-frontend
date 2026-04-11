// Compatibility shim — all implementations live in feature folders.
// Import from here only if you haven't migrated the call site yet.

export {
  loginUser,
  registerUser,
  verifyOtp,
  resendOtp,
  logoutUser,
  getAuthToken,
  getCurrentUser,
  type SignupState,
  type LoginState,
} from "@/features/auth/actions/auth.actions";

export {
  setActiveWorkspaceCookie,
  createWorkspaceAction as createWorkspace,
  updateWorkspaceAction as updateWorkspace,
  deleteWorkspaceAction as deleteWorkspace,
  removeMemberAction as removeWorkspaceMember,
  inviteMemberAction as inviteUser,
  acceptInvitationAction as acceptInvitation,
  rejectInvitationAction as rejectInvitation,
  approveJoinRequestAction,
  rejectJoinRequestAction,
  requestJoinAction as requestJoinWorkspace,
} from "@/features/workspaces/actions/workspace.actions";

// These are now handled by React Query hooks + client API
// Kept as stubs so any remaining old imports don't crash the build
export async function getUserWorkspaces(): Promise<{ id: string; membershipId?: string }[]> { return []; }
export async function switchWorkspace(_id: string): Promise<{ success: boolean; message?: string }> { return { success: true }; }
export async function getJoinRequests(_wid?: string) { return []; }
export async function getTeamMembers(_wid?: string) { return []; }
export async function getMyInvitations() { return []; }
export async function getWorkspaceInvitations(_wid: string) { return []; }
export async function getDiscoverableWorkspaces() { return []; }
export async function leaveWorkspace(_wid: string) { return { success: false, message: "Use workspace settings." }; }
export async function resolveJoinRequest(_id: string, _action: "approve" | "reject") { return { success: false, message: "Use workspace hooks." }; }
export async function searchUsers(_query: string) { return []; }
export async function addWorkspaceMember(_wid: string, _email: string, _role: string) { return { success: false, message: "Use invitations." }; }
export async function createWorkspaceFromForm(_prev: any, formData: FormData) {
  const name = formData.get("workspaceName") as string;
  if (!name) return { success: false, message: "Name required" };
  return { success: false, message: "Use WorkspacesShell." };
}
export async function requestJoinWorkspaceFromForm(_prev: any, _fd: FormData) {
  return { success: false, message: "Use WorkspacesShell." };
}