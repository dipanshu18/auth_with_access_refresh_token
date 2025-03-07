/* eslint-disable @typescript-eslint/no-unused-vars */
import { QueryClient } from "@tanstack/react-query";
import axios from "axios";
import { navigate } from "./navigate";

const options = {
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
};

const queryClient = new QueryClient();

// create a separate client for refreshing the access token
// to avoid infinite loops with the error interceptor
const TokenRefreshClient = axios.create(options);
TokenRefreshClient.interceptors.response.use((response) => response.data);

const API = axios.create(options);

API.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { config, response } = error;
    const { status, data } = response || {};

    // try to refresh the access token behind the scenes
    if (status === 401 && data?.errorCode === "InvalidAccessToken") {
      try {
        // refresh the access token, then retry the original request
        await TokenRefreshClient.get("/auth/refresh");
        return TokenRefreshClient(config);
      } catch (error) {
        // handle refresh errors by clearing the query cache & redirecting to login
        queryClient.clear();
        navigate("/login", {
          state: {
            redirectUri: window.location.pathname,
          },
        });
      }
    }

    return Promise.reject({ status, ...data });
  }
);

export { API };
