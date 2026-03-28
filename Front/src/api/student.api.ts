// ─── Student API ─────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

/** POST /students — Add new student */
export async function addStudent(
    name: string, roll_number: string, parent_phone: string, theory_batch_id: number, lab_batch_id: number, phone: string, current_year: number, email: string, dob: string, gender: string, address: string
): Promise<void> {
    await apiClient.post('/students', { name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, theory_batch_id, lab_batch_id });
}

/** GET /students — Fetch students, optionally filtered */
export async function getStudents(year?: number, theory_batch_id?: number, lab_batch_id?: number): Promise<any[]> {
    const params: Record<string, string> = {};
    if (year) params.year = year.toString();
    if (theory_batch_id) params.theory_batch_id = theory_batch_id.toString();
    if (lab_batch_id) params.lab_batch_id = lab_batch_id.toString();
    const students = await apiClient.get<any[]>('/students', Object.keys(params).length ? params : undefined);
    return Array.isArray(students) ? students : [];
}

/** PUT /students/:rollNumber — Update student (validated server-side) */
export async function updateStudent(rollNumber: string, data: {
    name?: string;
    roll_number?: string;
    parent_phone?: string;
    current_year?: number;
    theory_batch_id?: number;
    lab_batch_id?: number;
    phone?: string;
    email?: string;
    dob?: string;
    gender?: string;
    address?: string;
}): Promise<void> {
    await apiClient.put(`/students/${rollNumber}`, data);
}

/** DELETE /students/:rollNumber — Delete student */
export async function deleteStudent(rollNumber: string): Promise<void> {
    await apiClient.delete(`/students/${rollNumber}`);
}
