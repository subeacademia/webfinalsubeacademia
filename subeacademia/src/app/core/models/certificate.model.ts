import { Timestamp } from '@angular/fire/firestore';

export interface Certificate {
	id?: string;
	studentName: string;
	courseName: string;
	completionDate: Timestamp;
	certificateCode: string;
	qrCode: string;
	verificationHash: string;
	issuedDate: Timestamp;
	grade?: number;
	instructorName?: string;
	institutionName: string;
	courseDuration?: string;
	certificateType: 'completion' | 'achievement' | 'participation';
	status: 'active' | 'revoked' | 'expired';
	metadata?: {
		issuerEmail: string;
		issuerName: string;
		validationUrl: string;
		securityFeatures: string[];
	};
}


