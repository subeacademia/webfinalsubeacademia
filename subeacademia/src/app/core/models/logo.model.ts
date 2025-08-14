export type LogoType = 'empresa' | 'educacion';

export interface ClientLogo {
	id?: string;
	name?: string;
	url: string;
	path?: string;
	type: LogoType;
	order?: number;
	createdAt?: any;
	createdBy?: string;
}


