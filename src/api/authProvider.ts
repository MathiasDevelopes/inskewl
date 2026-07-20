export interface AuthProvider {
    authorize(init: RequestInit): Promise<void>;
}