import { AuthProvider } from '../authProvider';

export class IncludeAuthProvider implements AuthProvider {
    async authorize(init: RequestInit): Promise<void> {
        init.credentials = 'include';
    }
}