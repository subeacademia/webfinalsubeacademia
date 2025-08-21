import { Timestamp } from '@angular/fire/firestore';

export interface Certificate {
	id?: string;
	studentName: string;
	courseName: string;
	completionDate: Timestamp;
	certificateCode: string;
	grade?: number;
	instructorName?: string;
}


