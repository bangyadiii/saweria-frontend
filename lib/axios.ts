import axios from "axios";

const $axios = axios.create({
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export default $axios;
