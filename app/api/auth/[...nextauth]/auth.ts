// library imports
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// types imports
import type { NextAuthOptions, Session } from "next-auth";
import type { LoginResponse } from "@/types/user";
import { LOGIN_ENDPOINT } from "@/lib/api-endpoints";
import $axios from "@/lib/axios";
import { JWT } from "next-auth/jwt";

export async function login(
    credentials: Record<"email" | "password", string> | undefined
): Promise<{
    token: string;
    id: number;
    email: string;
    username: string;
    profileImage: string | null;
    createdAt: Date;
    updatedAt: Date;
    streamKey: string | null;
}> {
    try {
        const response = await $axios.post<LoginResponse>(
            LOGIN_ENDPOINT,
            credentials
        );
        const user = {
            ...response.data.data.user,
            token: response.data.data.token,
        };
        return user;
    } catch (error) {
        console.error("error call API login", error);
        throw new Error("Something went wrong.");
    }
}

export const config: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            type: "credentials",
            name: "Credentials",
            credentials: {
                email: {},
                password: {},
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async authorize(credentials, req) {
                try {
                    return await login(credentials);
                } catch (e) {
                    console.error(e);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.user = user;
                console.log("token", token);
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            session.user = token.user as Session["user"];
            return session;
        },
    },
    debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(config);

export default handler;
