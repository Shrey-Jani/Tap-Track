import Card from "@/design/Card";
import PrimaryButton from "@/design/PrimaryButton";
import { radii, spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import {
    exportEncryptedBackup,
    importEncryptedBackup,
} from "@/services/BackupService";
import {
    authenticateWithBiometrics,
    checkBiometricAvailability,
} from "@/services/BiometricAuthService";
import {
    cancelEndOfDayReminder,
    dismissPersistentQuickAddNotification,
    loadPersistentEnabled,
    loadReminderEnabled,
    loadReminderTime,
    postPersistentQuickAddNotification,
    ReminderTime,
    requestNotificationPermission,
    savePersistentEnabled,
    saveReminderEnabled,
    saveReminderTime,
    scheduleEndOfDayReminder,
} from "@/services/NotificationService";
import { useAppstore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { ThemePref, useThemeStore } from "@/store/themeStore";
import { getCurrencyByCode, SUPPORTED_CURRENCIES } from "@/utils/currencies";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";

const formatReminderTime = (time: ReminderTime): string => {
    const hh = time.hour.toString().padStart(2, "0");
    const mm = time.minute.toString().padStart(2, "0");
    return `${hh}:${mm}`;
};

interface SectionProps {
    icon: React.ComponentProps<typeof Feather>["name"];
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon, title, children }) => {
    const { palette } = useTheme();
    const styles = useMemo(() => StyleSheet.create({
        section: { marginBottom: spacing.lg },
        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: spacing.sm,
            paddingHorizontal: 4,
        },
        sectionTitle: {
            ...typography.label,
            color: palette.text.secondary,
        },
    }), [palette]);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Feather name={icon} size={14} color={palette.brand.primary} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <Card padding={spacing.lg}>{children}</Card>
        </View>
    );
};

const THEME_OPTIONS: { pref: ThemePref; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
    { pref: "system", label: "System", icon: "smartphone" },
    { pref: "dark", label: "Dark", icon: "moon" },
    { pref: "light", label: "Light", icon: "sun" },
];

const SettingsScreen: React.FC = () => {
    const { palette, mode } = useTheme();
    const {
        dailyBudgetInCents,
        loadBudget,
        saveBudget,
        currencyCode,
        loadCurrency,
        saveCurrency,
    } = useAppstore();

    const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
    const setBiometricEnabled = useAuthStore((s) => s.setBiometricEnabled);

    const themePref = useThemeStore((s) => s.pref);
    const setThemePref = useThemeStore((s) => s.setThemePref);

    const [budgetText, setBudgetText] = useState<string>("");

    const [persistentEnabled, setPersistentEnabled] = useState<boolean>(false);
    const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
    const [reminderTime, setReminderTime] = useState<ReminderTime>({ hour: 21, minute: 0 });
    const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

    const [showCurrencyPicker, setShowCurrencyPicker] = useState<boolean>(false);

    const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
    const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
    const [backupPassword, setBackupPassword] = useState<string>("");

    useEffect(() => {
        loadBudget();
        loadCurrency();
    }, []);

    useEffect(() => {
        (async () => {
            const [persistent, reminder, time] = await Promise.all([
                loadPersistentEnabled(),
                loadReminderEnabled(),
                loadReminderTime(),
            ]);
            setPersistentEnabled(persistent);
            setReminderEnabled(reminder);
            setReminderTime(time);
        })();
    }, []);

    useEffect(() => {
        setBudgetText((dailyBudgetInCents / 100).toFixed(2));
    }, [dailyBudgetInCents]);

    const handleSaveBudget = () => {
        const parsed = parseFloat(budgetText);
        if (isNaN(parsed) || parsed <= 0) {
            Alert.alert("Invalid Budget", "Please enter a valid amount greater than 0.");
            return;
        }
        const budgetInCents = Math.round(parsed * 100);
        saveBudget(budgetInCents);
        Alert.alert("Budget Saved", `Daily budget set to ${formatCentstoDisplayCurrency(budgetInCents, currencyCode)}.`);
    };

    const handleTogglePersistent = async (nextValue: boolean) => {
        if (nextValue) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                Alert.alert("Permission Denied", "Notifications are blocked. Enable them in system settings.");
                return;
            }
            await postPersistentQuickAddNotification();
        } else {
            await dismissPersistentQuickAddNotification();
        }
        setPersistentEnabled(nextValue);
        await savePersistentEnabled(nextValue);
    };

    const handleToggleReminder = async (nextValue: boolean) => {
        if (nextValue) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                Alert.alert("Permission Denied", "Notifications are blocked. Enable them in system settings.");
                return;
            }
            await scheduleEndOfDayReminder(reminderTime);
        } else {
            await cancelEndOfDayReminder();
        }
        setReminderEnabled(nextValue);
        await saveReminderEnabled(nextValue);
    };

    const handleTimeChange = async (event: DateTimePickerEvent, date?: Date) => {
        setShowTimePicker(false);
        if (!date) return;
        const nextTime: ReminderTime = { hour: date.getHours(), minute: date.getMinutes() };
        setReminderTime(nextTime);
        await saveReminderTime(nextTime);
        if (reminderEnabled) await scheduleEndOfDayReminder(nextTime);
    };

    const handleToggleBiometric = async (nextValue: boolean) => {
        if (nextValue) {
            const availability = await checkBiometricAvailability();
            if (!availability.available) {
                Alert.alert("Can't Enable", availability.reason ?? "Biometric not available.");
                return;
            }
            const result = await authenticateWithBiometrics();
            if (!result.success) {
                Alert.alert("Authentication Failed", "Couldn't verify identity.");
                return;
            }
        }
        await setBiometricEnabled(nextValue);
    };

    const handlePickCurrency = async (code: string) => {
        await saveCurrency(code);
        setShowCurrencyPicker(false);
    };

    const handleExportBackup = async () => {
        try {
            await exportEncryptedBackup(backupPassword);
            setShowBackupModal(false);
            setBackupPassword("");
            Alert.alert("Backup Created", "Save it somewhere safe.");
        } catch (e) {
            Alert.alert("Backup Failed", e instanceof Error ? e.message : "Unknown error");
        }
    };

    const handleImportBackup = async () => {
        try {
            const count = await importEncryptedBackup(backupPassword);
            setShowRestoreModal(false);
            setBackupPassword("");
            if (count === 0) {
                Alert.alert("Cancelled", "No file selected.");
            } else {
                Alert.alert("Restored", `Imported ${count} payment${count === 1 ? "" : "s"}.`);
            }
        } catch (e) {
            Alert.alert("Restore Failed", e instanceof Error ? e.message : "Unknown error");
        }
    };

    const reminderTimeAsDate = (() => {
        const d = new Date();
        d.setHours(reminderTime.hour, reminderTime.minute, 0, 0);
        return d;
    })();

    const currentCurrency = getCurrencyByCode(currencyCode);

    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: palette.bg.base },
        content: { paddingTop: 60, paddingHorizontal: spacing.lg, paddingBottom: 120 },
        title: {
            ...typography.h1,
            color: palette.text.primary,
            marginBottom: spacing.lg,
        },
        hint: {
            ...typography.caption,
            color: palette.text.muted,
            marginBottom: spacing.md,
        },
        subtle: {
            ...typography.caption,
            color: palette.text.muted,
            marginTop: 6,
        },
        budgetRow: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: palette.bg.surfaceAlt,
            borderRadius: radii.md,
            paddingHorizontal: spacing.lg,
        },
        currencySymbol: {
            color: palette.brand.primary,
            fontSize: 32,
            fontWeight: "800",
            marginRight: 8,
        },
        budgetInput: {
            flex: 1,
            color: palette.text.primary,
            fontSize: 32,
            fontWeight: "800",
            paddingVertical: 14,
            fontVariant: ["tabular-nums"],
        },
        toggleRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: spacing.md,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: palette.border.subtle,
            marginTop: 4,
        },
        toggleLeft: { flex: 1, marginRight: 12 },
        toggleLabel: {
            ...typography.bodyStrong,
            color: palette.text.primary,
            marginBottom: 2,
        },
        toggleHint: {
            ...typography.caption,
            color: palette.text.muted,
        },
        rowButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: spacing.md,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: palette.border.subtle,
            marginTop: 4,
        },
        rowButtonLabel: {
            ...typography.body,
            color: palette.text.primary,
        },
        rowButtonRight: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
        },
        rowButtonValue: {
            ...typography.body,
            color: palette.brand.primary,
            fontWeight: "700",
        },
        footer: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: spacing.md,
            opacity: 0.6,
        },
        footerText: {
            ...typography.caption,
            color: palette.text.muted,
        },
        themeRow: {
            flexDirection: "row",
            gap: 8,
        },
        themeOption: {
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 8,
            borderRadius: radii.md,
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: palette.bg.surfaceAlt,
            borderWidth: 1,
            borderColor: "transparent",
        },
        themeOptionActive: {
            borderColor: palette.brand.primary,
            backgroundColor: palette.bg.surface,
        },
        themeOptionLabel: {
            ...typography.caption,
            color: palette.text.secondary,
            fontWeight: "600",
        },
        themeOptionLabelActive: {
            color: palette.brand.primary,
            fontWeight: "800",
        },
        modalBackdrop: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            padding: 20,
        },
        modalCard: {
            backgroundColor: palette.bg.surface,
            borderRadius: radii.xl,
            padding: spacing.lg,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: palette.border.subtle,
        },
        modalTitle: {
            ...typography.h2,
            color: palette.text.primary,
            marginBottom: 6,
        },
        modalHint: {
            ...typography.caption,
            color: palette.text.muted,
            marginBottom: spacing.md,
        },
        modalInput: {
            backgroundColor: palette.bg.surfaceAlt,
            color: palette.text.primary,
            padding: 14,
            borderRadius: radii.md,
            fontSize: 16,
            marginBottom: spacing.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: palette.border.subtle,
        },
        currencyOption: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 14,
            borderRadius: radii.md,
            marginBottom: 6,
            backgroundColor: palette.bg.surfaceAlt,
        },
        currencyOptionActive: {
            borderWidth: 1,
            borderColor: palette.brand.primary,
        },
        currencyOptionSymbol: {
            color: palette.brand.primary,
            fontSize: 22,
            fontWeight: "800",
            width: 30,
            textAlign: "center",
        },
        currencyOptionName: {
            ...typography.bodyStrong,
            color: palette.text.primary,
        },
        currencyOptionCode: {
            ...typography.caption,
            color: palette.text.muted,
            marginTop: 2,
        },
    }), [palette]);

    const renderToggleRow = (
        label: string,
        hint: string,
        value: boolean,
        onChange: (v: boolean) => void,
    ) => (
        <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
                <Text style={styles.toggleLabel}>{label}</Text>
                <Text style={styles.toggleHint}>{hint}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: palette.bg.elevated, true: palette.brand.primary }}
                thumbColor="#FFFFFF"
            />
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Settings</Text>

            <Section icon="sun" title="Appearance">
                <Text style={styles.hint}>Pick the look. System follows your phone's settings.</Text>
                <View style={styles.themeRow}>
                    {THEME_OPTIONS.map((opt) => {
                        const active = themePref === opt.pref;
                        return (
                            <Pressable
                                key={opt.pref}
                                style={[styles.themeOption, active && styles.themeOptionActive]}
                                onPress={() => setThemePref(opt.pref)}
                            >
                                <Feather
                                    name={opt.icon}
                                    size={18}
                                    color={active ? palette.brand.primary : palette.text.secondary}
                                />
                                <Text style={[styles.themeOptionLabel, active && styles.themeOptionLabelActive]}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </Section>

            <Section icon="target" title="Daily Budget">
                <Text style={styles.hint}>Alert when daily spending exceeds this amount.</Text>
                <View style={styles.budgetRow}>
                    <Text style={styles.currencySymbol}>{currentCurrency.symbol}</Text>
                    <TextInput
                        style={styles.budgetInput}
                        value={budgetText}
                        onChangeText={setBudgetText}
                        keyboardType="decimal-pad"
                        placeholder="100.00"
                        placeholderTextColor={palette.text.muted}
                    />
                </View>
                <Text style={styles.subtle}>
                    Current: {formatCentstoDisplayCurrency(dailyBudgetInCents, currencyCode)}
                </Text>
                <View style={{ marginTop: spacing.md }}>
                    <PrimaryButton label="Save Budget" onPress={handleSaveBudget} />
                </View>
            </Section>

            <Section icon="shield" title="Security">
                {renderToggleRow(
                    "Lock with biometric",
                    "Face ID / fingerprint after 30s in background.",
                    biometricEnabled,
                    handleToggleBiometric,
                )}
            </Section>

            <Section icon="dollar-sign" title="Currency">
                <Pressable style={styles.rowButton} onPress={() => setShowCurrencyPicker(true)}>
                    <Text style={styles.rowButtonLabel}>Display currency</Text>
                    <View style={styles.rowButtonRight}>
                        <Text style={styles.rowButtonValue}>{currentCurrency.code}</Text>
                        <Feather name="chevron-right" size={18} color={palette.text.muted} />
                    </View>
                </Pressable>
            </Section>

            <Section icon="bell" title="Notifications">
                {renderToggleRow(
                    "Persistent Quick-Add",
                    Platform.OS === "ios"
                        ? "Always-visible notification (re-posts on app open)."
                        : "Sticky notification in tray for fast logging.",
                    persistentEnabled,
                    handleTogglePersistent,
                )}
                {renderToggleRow(
                    "End-of-Day Reminder",
                    "Daily nudge to log everything.",
                    reminderEnabled,
                    handleToggleReminder,
                )}
                {reminderEnabled && (
                    <Pressable style={styles.rowButton} onPress={() => setShowTimePicker(true)}>
                        <Text style={styles.rowButtonLabel}>Remind me at</Text>
                        <View style={styles.rowButtonRight}>
                            <Text style={styles.rowButtonValue}>{formatReminderTime(reminderTime)}</Text>
                            <Feather name="clock" size={16} color={palette.text.muted} />
                        </View>
                    </Pressable>
                )}
                {showTimePicker && (
                    <DateTimePicker
                        value={reminderTimeAsDate}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleTimeChange}
                        themeVariant={mode}
                    />
                )}
            </Section>

            <Section icon="hard-drive" title="Backup & Restore">
                <Text style={styles.hint}>
                    Encrypted backup. Keep the password — without it, the file can't be restored.
                </Text>
                <Pressable
                    style={styles.rowButton}
                    onPress={() => { setBackupPassword(""); setShowBackupModal(true); }}
                >
                    <Text style={styles.rowButtonLabel}>Export encrypted backup</Text>
                    <Feather name="upload" size={18} color={palette.brand.primary} />
                </Pressable>
                <Pressable
                    style={styles.rowButton}
                    onPress={() => { setBackupPassword(""); setShowRestoreModal(true); }}
                >
                    <Text style={styles.rowButtonLabel}>Restore from backup</Text>
                    <Feather name="download" size={18} color={palette.brand.primary} />
                </Pressable>
            </Section>

            <View style={styles.footer}>
                <Text style={styles.footerText}>TapTrack · v1.0.0</Text>
                <Text style={styles.footerText}>{currentCurrency.name}</Text>
            </View>

            <Modal visible={showCurrencyPicker} animationType="slide" transparent>
                <Pressable style={styles.modalBackdrop} onPress={() => setShowCurrencyPicker(false)}>
                    <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
                        <Text style={styles.modalTitle}>Pick Currency</Text>
                        <ScrollView style={{ maxHeight: 360 }}>
                            {SUPPORTED_CURRENCIES.map((c) => (
                                <Pressable
                                    key={c.code}
                                    style={[
                                        styles.currencyOption,
                                        c.code === currencyCode && styles.currencyOptionActive,
                                    ]}
                                    onPress={() => handlePickCurrency(c.code)}
                                >
                                    <Text style={styles.currencyOptionSymbol}>{c.symbol}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.currencyOptionName}>{c.name}</Text>
                                        <Text style={styles.currencyOptionCode}>{c.code}</Text>
                                    </View>
                                    {c.code === currencyCode && (
                                        <Feather name="check" size={18} color={palette.brand.primary} />
                                    )}
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal visible={showBackupModal} animationType="slide" transparent>
                <Pressable style={styles.modalBackdrop} onPress={() => setShowBackupModal(false)}>
                    <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
                        <Text style={styles.modalTitle}>Encrypted Backup</Text>
                        <Text style={styles.modalHint}>
                            Min 4 characters. You'll need this exact password to restore.
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Backup password"
                            placeholderTextColor={palette.text.muted}
                            secureTextEntry
                            value={backupPassword}
                            onChangeText={setBackupPassword}
                        />
                        <PrimaryButton label="Export" onPress={handleExportBackup} />
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal visible={showRestoreModal} animationType="slide" transparent>
                <Pressable style={styles.modalBackdrop} onPress={() => setShowRestoreModal(false)}>
                    <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
                        <Text style={styles.modalTitle}>Restore Backup</Text>
                        <Text style={styles.modalHint}>
                            Enter the backup password, then pick the file. This overwrites all current payments.
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Backup password"
                            placeholderTextColor={palette.text.muted}
                            secureTextEntry
                            value={backupPassword}
                            onChangeText={setBackupPassword}
                        />
                        <PrimaryButton label="Pick File" onPress={handleImportBackup} />
                    </Pressable>
                </Pressable>
            </Modal>
        </ScrollView>
    );
};

export default SettingsScreen;
