import Env from "./env";

export const SERVER_ENDPOINT: string = Env.SERVER_ENDPOINT;

// Auth
export const LOGIN_ENDPOINT: string = SERVER_ENDPOINT + "/auth/login";
export const REGISTER_ENDPOINT: string = SERVER_ENDPOINT + "/auth/register";
export const REFRESH_TOKEN_ENDPOINT: string = SERVER_ENDPOINT + "/auth/refresh";

// User
export const ME_ENDPOINT: string = SERVER_ENDPOINT + "/users/me";
export const PUBLIC_PROFILE_ENDPOINT = (username: string) =>
    `${SERVER_ENDPOINT}/users/${username}`;

// Overlay
export const OVERLAY_SETTINGS_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/settings";
export const OVERLAY_ALERT_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/alert";
export const OVERLAY_TEMPLATE_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/template";
export const OVERLAY_FILTER_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/filter";
export const OVERLAY_SOUND_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/sound";
export const OVERLAY_STREAM_KEY_RESET_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/stream-key/reset";
export const OVERLAY_MEDIASHARE_RULES_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/mediashare/rules";
export const OVERLAY_MEDIASHARE_TEMPLATE_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/mediashare/template";
export const OVERLAY_QR_ENDPOINT: string = SERVER_ENDPOINT + "/overlay/qr";
export const OVERLAY_MILESTONE_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/milestone";
export const OVERLAY_SUBATHON_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/subathon";
export const OVERLAY_SUBATHON_TEST_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/subathon/test";
export const OVERLAY_SUBATHON_CONTROL_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/subathon/control";

// Donation
export const DONATE_ENDPOINT = (username: string) =>
    `${SERVER_ENDPOINT}/donate/${username}`;
export const DONATIONS_ENDPOINT: string = SERVER_ENDPOINT + "/donations";
export const DONATION_DETAIL_ENDPOINT = (id: string) =>
    `${SERVER_ENDPOINT}/donations/${id}`;

// Wallet
export const WALLET_BALANCE_ENDPOINT: string =
    SERVER_ENDPOINT + "/wallet/balance";
export const WALLET_CASHOUT_ENDPOINT: string =
    SERVER_ENDPOINT + "/wallet/cashout";
export const WALLET_CASHOUT_HISTORY_ENDPOINT: string =
    SERVER_ENDPOINT + "/wallet/cashout/history";

// Widgets (public, uses stream key)
export const WIDGET_INFO_ENDPOINT = (streamKey: string) =>
    `${SERVER_ENDPOINT}/widgets/info?streamKey=${streamKey}`;
export const WIDGET_LEADERBOARD_ENDPOINT = (streamKey: string) =>
    `${SERVER_ENDPOINT}/widgets/leaderboard?streamKey=${streamKey}`;

// Overlay control panel
export const OVERLAY_TEST_ALERT_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/test-alert";
export const OVERLAY_TEST_MEDIASHARE_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/test-mediashare";
export const OVERLAY_CONTROL_ENDPOINT: string =
    SERVER_ENDPOINT + "/overlay/control";
