import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY_THEME = "taptrack_theme_pref";

export type ThemePref = "system" | "dark" | "light";

interface ThemeState {
    pref: ThemePref;
    loadThemePref: () => Promise<void>;
    setThemePref: (pref: ThemePref) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
    pref: "dark",

    loadThemePref: async () => {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_THEME);
        if (stored === "system" || stored === "dark" || stored === "light") {
            set({ pref: stored });
        }
    },

    setThemePref: async (pref) => {
        set({ pref });
        await AsyncStorage.setItem(STORAGE_KEY_THEME, pref);
    },
}));
