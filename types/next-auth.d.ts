import { DefaultSession, User } from "next-auth";

export interface CustomAuthUser extends User {
    id: number;
    username: string;
    email: string;
    profileImage: string | null;
    createdAt: Date;
    updatedAt: Date;
    streamKey: string | null;
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
        profileImage: string | null;
        createdAt: Date;
        updatedAt: Date;
        streamKey: string | null;
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        user: CustomAuthUser;
    }
}
