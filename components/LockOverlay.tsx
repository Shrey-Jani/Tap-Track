import {
    authenticateWithBiometrics,
    BiometricKind,
    checkBiometricAvailability,
} from "@/services/BiometricAuthService";
import { useAuthStore } from "@/store/authStore";
import React, { useCallback, useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const BIOMETRIC_LABELS: Record<BiometricKind, string> = {
    face: "Face ID",
    fingerprint: "Fingerprint",
    iris: "Iris",
    none: "Biometric",
};

const BIOMETRIC_ICONS: Record<BiometricKind, string> = {
    face: "👤",
    fingerprint: "👆",
    iris: "👁",
    none: "🔒",
};

const LockOverlay: React.FC = () => {
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

    return (
        <Modal visible={isLocked} animationType="fade" transparent={false}>
            <View style={styles.container}>
                <Text style={styles.icon}>{BIOMETRIC_ICONS[biometricKind]}</Text>
                <Text style={styles.title}>TapTrack</Text>
                <Text style={styles.subtitle}>
                    Unlock with {BIOMETRIC_LABELS[biometricKind]}
                </Text>
                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
                <TouchableOpacity style={styles.button} onPress={attemptUnlock}>
                    <Text style={styles.buttonText}>Try again</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121218",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
    },
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 4,
    },
    subtitle: {
        color: "#AAAAAA",
        fontSize: 16,
        marginBottom: 24,
    },
    error: {
        color: "#F87171",
        fontSize: 13,
        marginBottom: 16,
        textAlign: "center",
    },
    button: {
        backgroundColor: "#4ADE80",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 32,
    },
    buttonText: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default LockOverlay;
