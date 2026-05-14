import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEY_BIOMETRIC_ENABLED = "taptrack_biometric_enabled";
const BACKGROUND_LOCK_THRESHOLD_MS = 30_000;

interface AuthState {
    isAuthenticated: boolean;
    biometricEnabled: boolean;
    backgroundedAt: number | null;

    setAuthenticated: (value: boolean) => void;
    setBackgroundedAt: (timestamp: number | null) => void;
    loadBiometricEnabled: () => Promise<void>;
    setBiometricEnabled: (enabled: boolean) => Promise<void>;
    shouldLockAfterBackground: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    biometricEnabled: false,
    backgroundedAt: null,

    setAuthenticated: (value) => set({ isAuthenticated: value }),
    setBackgroundedAt: (timestamp) => set({ backgroundedAt: timestamp }),

    loadBiometricEnabled: async () => {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_BIOMETRIC_ENABLED);
        const enabled = stored === "1";
        set({
            biometricEnabled: enabled,
            isAuthenticated: !enabled,
        });
    },

    setBiometricEnabled: async (enabled) => {
        await AsyncStorage.setItem(STORAGE_KEY_BIOMETRIC_ENABLED, enabled ? "1" : "0");
        set({
            biometricEnabled: enabled,
            isAuthenticated: enabled ? get().isAuthenticated : true,
        });
    },

    shouldLockAfterBackground: () => {
        const { backgroundedAt, biometricEnabled } = get();
        if (!biometricEnabled || backgroundedAt === null) return false;
        return Date.now() - backgroundedAt >= BACKGROUND_LOCK_THRESHOLD_MS;
    },
}));
