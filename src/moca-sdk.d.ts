// Global TypeScript declarations for Moca SDK (loaded globally via script tag)

interface MocaClient {
    id?: string;
    name: string;
    email?: string;
    logo_url?: string;
}

interface MocaUser {
    id?: string;
    name: string;
    email?: string;
    role: string;
    level?: string;
    job_title?: string;
}

interface MocaApplication {
    id?: string;
    name: string;
    description?: string;
}

interface MocaSession {
    client: MocaClient;
    user: MocaUser;
    application: MocaApplication;
    configurations: Record<string, string>;
    timestamp: number;
}

declare class MocaSDK {
    hubUrl: string;
    session: MocaSession | null;
    mockConfig?: Record<string, unknown>;

    constructor(hubUrl: string);
    init(): Promise<boolean>;
    enableMockMode(config: {
        client?: Partial<MocaClient>;
        user?: Partial<MocaUser>;
        configurations?: Record<string, string>;
    }): void;
    isAuthenticated(): boolean;
    getConfig(key: string): string | null;
    getAllConfigs(): Record<string, string>;
    getClient(): MocaClient | null;
    getUser(): MocaUser | null;
    getApplication(): MocaApplication | null;
    logout(): void;
    showAccessDenied(): void;
}

interface Window {
    MocaSDK: typeof MocaSDK;
}
