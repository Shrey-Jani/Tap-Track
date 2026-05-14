import PrimaryButton from "@/design/PrimaryButton";
import { spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import {
    authenticateWithBiometrics,
    BiometricKind,
    checkBiometricAvailability,
} from "@/services/BiometricAuthService";
import { useAuthStore } from "@/store/authStore";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

const BIOMETRIC_LABELS: Record<BiometricKind, string> = {
    face: "Face ID",
    fingerprint: "Fingerprint",
    iris: "Iris Scan",
    none: "Device unlock",
};

const BIOMETRIC_ICONS: Record<BiometricKind, React.ComponentProps<typeof Feather>["name"]> = {
    face: "user",
    fingerprint: "shield",
    iris: "eye",
    none: "lock",
};

const LockOverlay: React.FC = () => {
    const { palette, gradients, mode } = useTheme();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
    const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

    const isLocked = biometricEnabled && !isAuthenticated;
    const [biometricKind, setBiometricKind] = useState<BiometricKind>("none");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const attemptUnlock = useCallback(async () => {
        setErrorMessage("");
        const result = await authenticateWithBiometrics();
        if (result.success) {
            setAuthenticated(true);
        } else if (result.error) {
            setErrorMessage(result.error);
        }
    }, [setAuthenticated]);

    useEffect(() => {
        if (!isLocked) return;
        checkBiometricAvailability().then((res) => setBiometricKind(res.kind));
        attemptUnlock();
    }, [isLocked, attemptUnlock]);

    const bgGradient = mode === "light"
        ? (["#FFFFFF", "#F0FDF4", "#FFFFFF"] as const)
        : (["#0A0A12", "#1A0F1E", "#0A0A12"] as const);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.xxl,
        },
        iconWrap: {
            shadowColor: palette.brand.primary,
            shadowOpacity: 0.6,
            shadowRadius: 30,
            shadowOffset: { width: 0, height: 0 },
            elevation: 12,
        },
        iconBubble: {
            width: 100,
            height: 100,
            borderRadius: 50,
            alignItems: "center",
            justifyContent: "center",
        },
        brand: {
            ...typography.hero,
            fontSize: 40,
            color: palette.text.primary,
            marginTop: spacing.xl,
        },
        subtitle: {
            ...typography.body,
            color: palette.text.secondary,
            marginTop: 4,
            marginBottom: spacing.xl,
        },
        error: {
            ...typography.caption,
            color: palette.semantic.danger,
            marginBottom: spacing.md,
            textAlign: "center",
        },
        buttonWrap: {
            width: "100%",
            maxWidth: 280,
        },
    }), [palette]);

    return (
        <Modal visible={isLocked} animationType="fade" transparent={false}>
            <LinearGradient
                colors={bgGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <View style={styles.iconWrap}>
                    <LinearGradient
                        colors={gradients.brand}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconBubble}
                    >
                        <Feather
                            name={BIOMETRIC_ICONS[biometricKind]}
                            size={42}
                            color="#FFFFFF"
                        />
                    </LinearGradient>
                </View>

                <Text style={styles.brand}>TapTrack</Text>
                <Text style={styles.subtitle}>
                    Unlock with {BIOMETRIC_LABELS[biometricKind]}
                </Text>

                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

                <View style={styles.buttonWrap}>
                    <PrimaryButton
                        label="Try again"
                        onPress={attemptUnlock}
                        icon={<Feather name="refresh-cw" size={18} color="#FFFFFF" />}
                    />
                </View>
            </LinearGradient>
        </Modal>
    );
};

export default LockOverlay;
