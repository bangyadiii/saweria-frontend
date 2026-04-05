class Env {
    static SERVER_ENDPOINT: string = process.env.NEXT_PUBLIC_API_URL as string;
    static WS_URL: string = process.env.NEXT_PUBLIC_WS_URL as string;
    static APP_URL: string = process.env.NEXT_PUBLIC_APP_URL as string;
}

export default Env;
