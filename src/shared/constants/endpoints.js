import { Platform } from "react-native";

function getBaseUrl() {
  if (Platform.OS === "android") {
    return "http://10.0.2.2";
  }
  if (Platform.OS === "web") {
    return "http://localhost";
  }
  return null;
}

const platformBase = getBaseUrl();

export const ENDPOINTS = {
  AUTH:
    process.env.EXPO_PUBLIC_AUTH_URL ||
    (platformBase ? `${platformBase}:3000/api/v1/auth` : "http://localhost:3000/api/v1/auth"),
  USER:
    process.env.EXPO_PUBLIC_USER ||
    (platformBase ? `${platformBase}:3002/novapay/v1` : "http://localhost:3002/novapay/v1"),
};
