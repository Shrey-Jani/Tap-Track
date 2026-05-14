import {
    darkGradients,
    darkPalette,
    darkShadows,
    GradientSet,
    lightGradients,
    lightPalette,
    lightShadows,
    Palette,
    ShadowSet,
} from "@/design/theme";
import { useThemeStore } from "@/store/themeStore";
import { useColorScheme } from "react-native";

export interface ResolvedTheme {
    mode: "dark" | "light";
    palette: Palette;
    gradients: GradientSet;
    shadows: ShadowSet;
}

export function useTheme(): ResolvedTheme {
    const pref = useThemeStore((s) => s.pref);
    const systemScheme = useColorScheme();

    const mode: "dark" | "light" =
        pref === "system"
            ? systemScheme === "light"
                ? "light"
                : "dark"
            : pref;

    if (mode === "light") {
        return {
            mode,
            palette: lightPalette,
            gradients: lightGradients,
            shadows: lightShadows,
        };
    }

    return {
        mode,
        palette: darkPalette,
        gradients: darkGradients,
        shadows: darkShadows,
    };
}
