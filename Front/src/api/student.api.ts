// ─── Student API ─────────────────────────────────────────────────────────────

import { apiClient } from './apiClient';

const USE_MOCK = false;

/** POST /students — Add new student */
export async function addStudent(
    			//await addStudent(name, roll_number, parent_phone, batch, phone, current_year, email, dob, gender, address);

    name: string, roll_number: string, parent_phone: string, batch: Number,phone:string,current_year:Number,email:string,dob:string,gender:string,address:string
): Promise<void> {
    if (USE_MOCK) return;
    	//const { name, roll_number, phone, email, dob, gender, address, parent_phone, current_year, batch_id } = data;

    await apiClient.post('/students', { name, roll_number, phone, email,dob,gender,address,parent_phone,current_year,batch });
}
