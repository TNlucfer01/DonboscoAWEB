import { apiClient } from './apiClient';

export interface Batch {
    batch_id: number;
    name: string;
    batch_type: 'THEORY' | 'LAB';
    year: number;
    capacity: number;
    student_count: number;
}

export async function fetchBatches(year?: number): Promise<Batch[]> {
    const params = year ? { year: String(year) } : undefined;
    return await apiClient.get<Batch[]>('/batches', params);
}
