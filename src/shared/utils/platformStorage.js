import { Platform } from "react-native";

let SecureStore;
try {
  SecureStore = require("expo-secure-store");
} catch {
  SecureStore = null;
}

const isWeb = Platform.OS === "web";

const webStorage = {
  getItemAsync: async (key) => {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItemAsync: async (key, value) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  deleteItemAsync: async (key) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

const storage = isWeb || !SecureStore ? webStorage : SecureStore;

export default storage;
