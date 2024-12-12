import Env from "./env";

export const SERVER_ENDPOINT: string = Env.SERVER_ENDPOINT;
export const LOGIN_ENDPOINT: string = SERVER_ENDPOINT + "/auth/login";
export const REGISTER_ENDPOINT: string = SERVER_ENDPOINT + "/auth/register";
