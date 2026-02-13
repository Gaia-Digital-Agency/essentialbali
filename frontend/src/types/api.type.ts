export interface ApiResponse<T> {
    status: string;
    status_code: number;
    message?: string; // biasanya hanya muncul kalau error
    data?: T;
}