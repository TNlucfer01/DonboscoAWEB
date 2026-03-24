// ─── Subject API ──────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

export interface Subject {
    subject_id: number;
    subject_name: string;
    subject_code: string;
    subject_year: number;
    semester: string;
    credits: number;
    subject_description?: string;
}

/** GET /subjects — List all subjects */
export async function fetchSubjects(year?: string, semester?: string): Promise<Subject[]> {
    const params: Record<string, string> = {};
    if (year) params.year = year;
    if (semester) params.semester = semester;
    return apiClient.get<Subject[]>('/subjects', Object.keys(params).length ? params : undefined);
}

/** POST /subjects — Add new subject */
export async function addSubject(data: {
    subject_name: string;
    subject_code: string;
    subject_year: number;
    semester: string;
    credits: number;
    subject_description?: string;
}): Promise<void> {
    await apiClient.post('/subjects', data);
}

/** PUT /subjects/:id — Update subject */
export async function updateSubject(id: number, data: Partial<Subject>): Promise<void> {
    await apiClient.put(`/subjects/${id}`, data);
}

/** DELETE /subjects/:id — Delete subject */
export async function deleteSubject(id: number): Promise<void> {
    await apiClient.delete(`/subjects/${id}`);
}
