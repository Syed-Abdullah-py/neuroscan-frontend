// Compatibility shim — canonical location is case.actions.ts
export {
    deleteCaseAction,
} from "@/features/cases/actions/case.actions";

// VerdictForm calls with (caseId, verdict) — stub with matching signature
export async function updateCaseVerdict(_caseId: string, _verdict: string): Promise<void> { return; }

// Wizard calls createCase with a plain object — stub with matching signature
export async function createCase(_data: {
    patientId: string;
    workspaceId: string;
    fileReferences?: string;
    assignedToMemberId?: string;
    [key: string]: unknown;
}): Promise<void> { return; }

// These were in the old file — stub them out
export async function getAssignedCases() { return []; }
export async function getDoctorsForDropdown(_wid: string): Promise<{ id: string; name: string }[]> { return []; }
export async function getAllCasesForWorkspace(_wid: string) { return []; }
export async function getCaseById(_id: string) { return null; }
