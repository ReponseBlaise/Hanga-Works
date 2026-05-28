export type ApiEnvelope<T> = {
	data: T;
	message?: string;
	success?: boolean;
};

export type ApiErrorPayload = {
	message: string | string[];
	error?: string;
	statusCode?: number;
};

