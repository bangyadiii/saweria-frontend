interface UserType {
    id: number;
    email: string;
    username: string;
    profileImage: string | null;
    createdAt: Date;
    updatedAt: Date;
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
