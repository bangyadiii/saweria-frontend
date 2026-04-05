import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const $axios = axios.create({
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

$axios.interceptors.request.use(async (config) => {
    const session = await getSession();
    if (session?.user?.token) {
        config.headers.Authorization = `Bearer ${session.user.token}`;
    }
    return config;
});

$axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await signOut({ callbackUrl: "/login" });
        }
        return Promise.reject(error);
    },
);

export default $axios;
