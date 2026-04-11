// Compatibility shim — canonical location is case.actions.ts
export {
    createCaseAction as createCase,
    updateCaseAction as updateCaseVerdict,
    deleteCaseAction,
} from "@/features/cases/actions/case.actions";

// These were in the old file — stub them out
export async function getAssignedCases() { return []; }
export async function getDoctorsForDropdown(_wid: string): Promise<{ id: string; name: string }[]> { return []; }
export async function getAllCasesForWorkspace(_wid: string) { return []; }
export async function getCaseById(_id: string) { return null; }