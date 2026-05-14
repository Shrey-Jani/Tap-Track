import { TextStyle } from "react-native";

export interface Palette {
    bg: {
        base: string;
        surface: string;
        surfaceAlt: string;
        elevated: string;
    };
    brand: {
        primary: string;
        primaryDim: string;
        accent: string;
        accentDim: string;
    };
    text: {
        primary: string;
        secondary: string;
        muted: string;
        inverse: string;
    };
    semantic: {
        success: string;
        warning: string;
        danger: string;
        info: string;
    };
    border: {
        subtle: string;
        emphasis: string;
        brand: string;
    };
}

export const darkPalette: Palette = {
    bg: {
        base: "#0A0A12",
        surface: "#15151F",
        surfaceAlt: "#1E1E2C",
        elevated: "#252535",
    },
    brand: {
        primary: "#4ADE80",
        primaryDim: "#22C55E",
        accent: "#06B6D4",
        accentDim: "#0891B2",
    },
    text: {
        primary: "#FFFFFF",
        secondary: "#A8A8B5",
        muted: "#6B6B7E",
        inverse: "#0A0A12",
    },
    semantic: {
        success: "#4ADE80",
        warning: "#FBBF24",
        danger: "#F87171",
        info: "#60A5FA",
    },
    border: {
        subtle: "rgba(255, 255, 255, 0.06)",
        emphasis: "rgba(255, 255, 255, 0.12)",
        brand: "rgba(74, 222, 128, 0.35)",
    },
};

export const lightPalette: Palette = {
    bg: {
        base: "#F7F7FA",
        surface: "#FFFFFF",
        surfaceAlt: "#F0F0F4",
        elevated: "#E6E6EC",
    },
    brand: {
        primary: "#16A34A",
        primaryDim: "#15803D",
        accent: "#0891B2",
        accentDim: "#0E7490",
    },
    text: {
        primary: "#0A0A12",
        secondary: "#4A4A55",
        muted: "#8E8E96",
        inverse: "#FFFFFF",
    },
    semantic: {
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        info: "#2563EB",
    },
    border: {
        subtle: "rgba(10, 10, 18, 0.06)",
        emphasis: "rgba(10, 10, 18, 0.12)",
        brand: "rgba(22, 163, 74, 0.30)",
    },
};

export interface GradientSet {
    brand: readonly [string, string];
    brandDim: readonly [string, string];
    danger: readonly [string, string];
    warning: readonly [string, string];
    surface: readonly [string, string];
    heroGlow: readonly [string, string];
}

export const darkGradients: GradientSet = {
    brand: ["#4ADE80", "#06B6D4"] as const,
    brandDim: ["#22C55E", "#0891B2"] as const,
    danger: ["#F87171", "#E11D48"] as const,
    warning: ["#FBBF24", "#F97316"] as const,
    surface: ["#1E1E2C", "#15151F"] as const,
    heroGlow: ["rgba(74, 222, 128, 0.35)", "rgba(6, 182, 212, 0)"] as const,
};

export const lightGradients: GradientSet = {
    brand: ["#16A34A", "#0891B2"] as const,
    brandDim: ["#15803D", "#0E7490"] as const,
    danger: ["#DC2626", "#9F1239"] as const,
    warning: ["#D97706", "#C2410C"] as const,
    surface: ["#F0F0F4", "#FFFFFF"] as const,
    heroGlow: ["rgba(22, 163, 74, 0.18)", "rgba(8, 145, 178, 0)"] as const,
};

export const CATEGORY_GRADIENTS = {
    FOOD: ["#FB7185", "#E11D48"] as const,
    TRANSPORT: ["#60A5FA", "#2563EB"] as const,
    SHOPPING: ["#FBBF24", "#D97706"] as const,
    ENTERTAINMENT: ["#A78BFA", "#7C3AED"] as const,
    BILLS: ["#22D3EE", "#0891B2"] as const,
    HEALTH: ["#F472B6", "#DB2777"] as const,
    OTHER: ["#94A3B8", "#475569"] as const,
} as const;

export const CATEGORY_SOLID = {
    FOOD: "#FB7185",
    TRANSPORT: "#60A5FA",
    SHOPPING: "#FBBF24",
    ENTERTAINMENT: "#A78BFA",
    BILLS: "#22D3EE",
    HEALTH: "#F472B6",
    OTHER: "#94A3B8",
} as const;

export const spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
} as const;

export const radii = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    xxl: 28,
    pill: 999,
} as const;

export const typography: Record<string, TextStyle> = {
    hero: { fontSize: 56, fontWeight: "800", letterSpacing: -2 },
    h1: { fontSize: 32, fontWeight: "800", letterSpacing: -0.6 },
    h2: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
    h3: { fontSize: 17, fontWeight: "600" },
    body: { fontSize: 15, fontWeight: "500" },
    bodyStrong: { fontSize: 15, fontWeight: "700" },
    label: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" },
    caption: { fontSize: 12, fontWeight: "500" },
};

export interface ShadowSet {
    glow: object;
    card: object;
    soft: object;
}

export const darkShadows: ShadowSet = {
    glow: {
        shadowColor: darkPalette.brand.primary,
        shadowOpacity: 0.4,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 0 },
        elevation: 8,
    },
    card: {
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
    },
    soft: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
};

export const lightShadows: ShadowSet = {
    glow: {
        shadowColor: lightPalette.brand.primary,
        shadowOpacity: 0.18,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 0 },
        elevation: 3,
    },
    card: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    soft: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
};
