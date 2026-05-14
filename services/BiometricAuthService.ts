import * as LocalAuthentication from "expo-local-authentication";

export type BiometricKind = "face" | "fingerprint" | "iris" | "none";

export interface BiometricAvailability {
    available: boolean;
    kind: BiometricKind;
    reason?: string;
}

export interface BiometricAuthResult {
    success: boolean;
    error?: string;
}

function pickPreferredBiometric(
    types: LocalAuthentication.AuthenticationType[]
): BiometricKind {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return "face";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return "fingerprint";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return "iris";
    }
    return "none";
}

export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
        return {
            available: false,
            kind: "none",
            reason: "This device has no biometric hardware.",
        };
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
        return {
            available: false,
            kind: "none",
            reason: "No fingerprint or face is set up in system settings.",
        };
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return {
        available: true,
        kind: pickPreferredBiometric(types),
    };
}

export async function authenticateWithBiometrics(): Promise<BiometricAuthResult> {
    const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock TapTrack",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
    });

    if (result.success) {
        return { success: true };
    }
    return { success: false, error: result.error };
}
