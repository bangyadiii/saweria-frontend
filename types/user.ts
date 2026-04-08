interface UserType {
    id: number;
    email: string;
    username: string;
    profile_image: string | null;
    created_at: Date;
    updated_at: Date;
    streamKey: string | null;
}

type LoginResponse = {
    message: string;
    data: {
        token: string;
        user: UserType;
    };
};

export type { UserType, LoginResponse };
