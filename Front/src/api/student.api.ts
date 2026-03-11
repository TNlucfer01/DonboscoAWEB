// ─── Student API ─────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

const USE_MOCK = false;

/** POST /students — Add new student */
export async function addStudent(
    name: string, roll_number: string, parent_phone: string, theory_batch_id: Number, lab_batch_id: Number, phone: string, current_year: Number, email: string, dob: string, gender: string, address: string
): Promise<void> {
    if (USE_MOCK) return;
    await apiClient.post('/students', { name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, theory_batch_id, lab_batch_id });
}
export async function getStudents(year?:number, theory_batch_id?: number, lab_batch_id?: number): Promise<any[]> {
    if (USE_MOCK) return [];
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (theory_batch_id) params.append('theory_batch_id', theory_batch_id.toString());
    if (lab_batch_id) params.append('lab_batch_id', lab_batch_id.toString());
    const students = await apiClient.get<any[]>(`/students`);
    return Array.isArray(students) ? students : [];

}
