export type CaseStatus = "PENDING" | "PROCESSING" | "REVIEWED";
export type CasePriority = "low" | "normal" | "high" | "urgent";

/** Returned by GET /cases/, GET /cases/{id}, GET /cases/recent */
export interface Case {
    id: string;
    status: CaseStatus;
    priority: CasePriority;
    /**
     * JSON string containing an array of exactly 4 Supabase Storage URLs.
     * Parse with: JSON.parse(case.file_references) as string[]
     */
    file_references: string;
    verdict: string | null;
    verdict_updated_at: string | null;
    notes: string | null;
    patient_id: string;
    patient_first_name: string | null;
    patient_last_name: string | null;
    assigned_to_member_id: string | null;
    /** Stable reference to the assigned doctor's user account; persists after membership changes. */
    assigned_to_user_id: string | null;
    /** Display name of the assigned doctor; null if unassigned. */
    assigned_to_name: string | null;
    created_at: string;
    updated_at: string;
}

/** Returned by GET /cases/stats */
export interface CaseStats {
    total: number;
    pending: number;
    processing: number;
    reviewed: number;
}

/**
 * Sent as multipart/form-data to POST /cases/
 * The 4 scan files are sent as the `scans` field.
 */
export interface CaseCreate {
    patient_id: string;
    priority?: CasePriority;
    assigned_to_member_id?: string;
    notes?: string;
}

/**
 * Body for PUT /cases/{id}
 * DOCTORs may only send: status, verdict, notes
 * OWNER/ADMIN may send all fields
 */
export interface CaseUpdate {
    status?: CaseStatus;
    priority?: CasePriority;
    verdict?: string;
    notes?: string;
    assigned_to_member_id?: string | null;
}