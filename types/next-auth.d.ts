import { DefaultSession, User } from "next-auth";

export interface CustomAuthUser extends User {
    id: number;
    username: string;
    email: string;
    profile_image: string | null;
    created_at: Date;
    updated_at: Date;
    streamKey: string | null;
    token: string;
}

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: CustomAuthUser & DefaultSession["user"];
    }
    interface User {
        id: number;
        username: string;
        email: string;
        profile_image: string | null;
        created_at: Date;
        updated_at: Date;
        streamKey: string | null;
        token: string;
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        user: CustomAuthUser;
    }
}
