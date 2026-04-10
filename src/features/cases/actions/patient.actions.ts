// Re-export from the canonical location
export {
    createPatientAction as createPatient,
    updatePatientAction as updatePatient,
    deletePatientAction as deletePatient,
} from "@/features/patients/actions/patients.actions";

export async function getAllPatients(_workspaceId: string) {
    return [];
}

export async function checkPatientByPhone(
    _phone: string,
    _workspaceId: string
) {
    return [];
}