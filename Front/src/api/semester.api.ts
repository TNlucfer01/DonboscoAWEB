// ─── Semester API ─────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

export interface Semester {
    semester_id: number;
    name: string;
    academic_year: number;
    is_active: boolean;
}

/** GET /semesters — List all semesters */
export async function fetchSemesters(): Promise<Semester[]> {
    return apiClient.get<Semester[]>('/semesters');
}

/** Returns the currently active semester, or null if none */
export async function getActiveSemester(): Promise<Semester | null> {
    const semesters = await fetchSemesters();
    return semesters.find(s => s.is_active) ?? null;
}
