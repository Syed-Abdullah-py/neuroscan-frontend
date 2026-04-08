/** Returned by GET /patients/ and GET /patients/{id} */
export interface Patient {
    id: string;
    workspace_id: string;
    first_name: string;
    last_name: string;
    /** Date string — YYYY-MM-DD */
    dob: string;
    gender: string;
    phone_number: string;
    mrn: string | null;
    cnic: string | null;
    address: string | null;
    city: string | null;
    created_at: string;
    updated_at: string;
}

/** Body for POST /patients/ */
export interface PatientCreate {
    first_name: string;
    last_name: string;
    /** YYYY-MM-DD */
    dob: string;
    gender: string;
    phone_number: string;
    mrn?: string;
    cnic?: string;
    address?: string;
    city?: string;
}

/** Body for PUT /patients/{id} — all fields optional */
export interface PatientUpdate {
    first_name?: string;
    last_name?: string;
    dob?: string;
    gender?: string;
    phone_number?: string;
    mrn?: string;
    cnic?: string;
    address?: string;
    city?: string;
}