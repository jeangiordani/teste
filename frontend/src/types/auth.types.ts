
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role?: 'USER' | 'ADMIN';
    areaId?: string | null;
}

export interface LoginResponse {
    access_token?: string;
    accessToken?: string;
    user?: AuthUser;
}

export interface Area {
    id: string;
    name: string;
    description?: string | null;
    isActive: boolean;
}
