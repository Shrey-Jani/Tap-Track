import {
    authenticateWithBiometrics,
    checkBiometricAvailability,
} from "@/services/BiometricAuthService";
import {
    exportEncryptedBackup,
    importEncryptedBackup,
} from "@/services/BackupService";
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
import { getCurrencyByCode, SUPPORTED_CURRENCIES } from "@/utils/currencies";
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const formatReminderTime = (time: ReminderTime): string => {
    const hh = time.hour.toString().padStart(2, "0");
    const mm = time.minute.toString().padStart(2, "0");
    return `${hh}:${mm}`;
};

const SettingsScreen: React.FC = () => {
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
        const loadNotificationSettings = async () => {
            const [persistent, reminder, time] = await Promise.all([
                loadPersistentEnabled(),
                loadReminderEnabled(),
                loadReminderTime(),
            ]);
            setPersistentEnabled(persistent);
            setReminderEnabled(reminder);
            setReminderTime(time);
        };
        loadNotificationSettings();
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
        Alert.alert("Budget Saved ✅", `Your daily budget is now ${formatCentstoDisplayCurrency(budgetInCents, currencyCode)}.`);
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

        if (reminderEnabled) {
            await scheduleEndOfDayReminder(nextTime);
        }
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
                Alert.alert("Authentication Failed", "Couldn't verify identity. Lock not enabled.");
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
            Alert.alert("Backup Created ✅", "Save the file somewhere safe. You'll need the password to restore.");
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
                Alert.alert("Restored ✅", `Imported ${count} payment${count === 1 ? "" : "s"}.`);
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

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Settings</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Budget</Text>
                <Text style={styles.sectionHint}>
                    You'll get an alert when your daily spending exceeds this amount.
                </Text>
                <View style={styles.budgetRow}>
                    <Text style={styles.currencySymbol}>{currentCurrency.symbol}</Text>
                    <TextInput
                        style={styles.budgetInput}
                        value={budgetText}
                        onChangeText={setBudgetText}
                        keyboardType="decimal-pad"
                        placeholder="100.00"
                        placeholderTextColor="#555"
                    />
                </View>
                <Text style={styles.currentBudget}>
                    Current: {formatCentstoDisplayCurrency(dailyBudgetInCents, currencyCode)}
                </Text>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveBudget}>
                    <Text style={styles.saveButtonText}>Save Budget</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>
                <View style={styles.toggleRow}>
                    <View style={styles.toggleLeft}>
                        <Text style={styles.toggleLabel}>Lock with biometric</Text>
                        <Text style={styles.toggleHint}>
                            Require Face ID / fingerprint after 30s in background.
                        </Text>
                    </View>
                    <Switch
                        value={biometricEnabled}
                        onValueChange={handleToggleBiometric}
                        trackColor={{ false: "#3A3A4C", true: "#4ADE80" }}
                        thumbColor="#FFFFFF"
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Currency</Text>
                <TouchableOpacity style={styles.rowButton} onPress={() => setShowCurrencyPicker(true)}>
                    <Text style={styles.rowButtonLabel}>Display currency</Text>
                    <Text style={styles.rowButtonValue}>{currentCurrency.code} ({currentCurrency.symbol})</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>

                <View style={styles.toggleRow}>
                    <View style={styles.toggleLeft}>
                        <Text style={styles.toggleLabel}>Persistent Quick-Add</Text>
                        <Text style={styles.toggleHint}>
                            Always-visible notification to log a payment fast.
                            {Platform.OS === "ios" ? " (iOS: re-posts on app open)" : ""}
                        </Text>
                    </View>
                    <Switch
                        value={persistentEnabled}
                        onValueChange={handleTogglePersistent}
                        trackColor={{ false: "#3A3A4C", true: "#4ADE80" }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                <View style={styles.toggleRow}>
                    <View style={styles.toggleLeft}>
                        <Text style={styles.toggleLabel}>End-of-Day Reminder</Text>
                        <Text style={styles.toggleHint}>
                            Daily nudge to check you've logged everything.
                        </Text>
                    </View>
                    <Switch
                        value={reminderEnabled}
                        onValueChange={handleToggleReminder}
                        trackColor={{ false: "#3A3A4C", true: "#4ADE80" }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                {reminderEnabled && (
                    <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
                        <Text style={styles.timeButtonLabel}>Remind me at</Text>
                        <Text style={styles.timeButtonValue}>{formatReminderTime(reminderTime)}</Text>
                    </TouchableOpacity>
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={reminderTimeAsDate}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleTimeChange}
                        themeVariant="dark"
                    />
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Backup & Restore</Text>
                <Text style={styles.sectionHint}>
                    Export an encrypted backup file. Keep the password — without it, the file cannot be restored.
                </Text>
                <TouchableOpacity
                    style={styles.rowButton}
                    onPress={() => { setBackupPassword(""); setShowBackupModal(true); }}
                >
                    <Text style={styles.rowButtonLabel}>Export encrypted backup</Text>
                    <Text style={styles.rowButtonValue}>↗</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.rowButton}
                    onPress={() => { setBackupPassword(""); setShowRestoreModal(true); }}
                >
                    <Text style={styles.rowButtonLabel}>Restore from backup</Text>
                    <Text style={styles.rowButtonValue}>↘</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App Info</Text>
                <Text style={styles.settingItem}>Currency: {currentCurrency.name} ({currentCurrency.code})</Text>
                <Text style={styles.settingItem}>Version: 1.0.0</Text>
            </View>

            <Modal visible={showCurrencyPicker} animationType="slide" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Pick Currency</Text>
                        <ScrollView style={styles.currencyList}>
                            {SUPPORTED_CURRENCIES.map((c) => (
                                <TouchableOpacity
                                    key={c.code}
                                    style={[
                                        styles.currencyOption,
                                        c.code === currencyCode && styles.currencyOptionActive,
                                    ]}
                                    onPress={() => handlePickCurrency(c.code)}
                                >
                                    <Text style={styles.currencyOptionText}>
                                        {c.symbol}  {c.code} — {c.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.modalCancel} onPress={() => setShowCurrencyPicker(false)}>
                            <Text style={styles.modalCancelText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showBackupModal} animationType="slide" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Encrypted Backup</Text>
                        <Text style={styles.modalHint}>
                            Set a password to encrypt your backup. Min 4 characters. You'll need this exact password to restore.
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Backup password"
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={backupPassword}
                            onChangeText={setBackupPassword}
                        />
                        <View style={styles.modalRow}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowBackupModal(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleExportBackup}>
                                <Text style={styles.modalConfirmText}>Export</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showRestoreModal} animationType="slide" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Restore Backup</Text>
                        <Text style={styles.modalHint}>
                            Enter the backup password, then pick the backup file. This will overwrite all current payments.
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Backup password"
                            placeholderTextColor="#666"
                            secureTextEntry
                            value={backupPassword}
                            onChangeText={setBackupPassword}
                        />
                        <View style={styles.modalRow}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowRestoreModal(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleImportBackup}>
                                <Text style={styles.modalConfirmText}>Pick File</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#121218" },
    content: { padding: 16, paddingBottom: 40 },
    title: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold", marginBottom: 24 },
    section: { marginBottom: 28 },
    sectionTitle: {
        color: "#4ADE80", fontSize: 14, fontWeight: "600",
        textTransform: "uppercase", letterSpacing: 1, marginBottom: 6,
    },
    sectionHint: { color: "#888", fontSize: 13, marginBottom: 12 },
    budgetRow: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#1E1E2E", borderRadius: 12, paddingHorizontal: 16,
    },
    currencySymbol: { color: "#4ADE80", fontSize: 28, fontWeight: "bold", marginRight: 8 },
    budgetInput: { flex: 1, color: "#FFFFFF", fontSize: 28, paddingVertical: 16 },
    currentBudget: { color: "#888", fontSize: 13, marginTop: 8 },
    saveButton: {
        backgroundColor: "#4ADE80", borderRadius: 12, padding: 14,
        alignItems: "center", marginTop: 12,
    },
    saveButtonText: { color: "#000000", fontSize: 16, fontWeight: "bold" },
    settingItem: {
        color: "#FFFFFF", fontSize: 16, marginBottom: 10,
        backgroundColor: "#1E1E2E", padding: 14, borderRadius: 12,
    },
    toggleRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "#1E1E2E", borderRadius: 12, padding: 14, marginBottom: 10,
    },
    toggleLeft: { flex: 1, marginRight: 12 },
    toggleLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "600", marginBottom: 4 },
    toggleHint: { color: "#888", fontSize: 12 },
    timeButton: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "#1E1E2E", borderRadius: 12, padding: 14, marginTop: 2,
    },
    timeButtonLabel: { color: "#FFFFFF", fontSize: 15 },
    timeButtonValue: { color: "#4ADE80", fontSize: 18, fontWeight: "700" },
    rowButton: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "#1E1E2E", borderRadius: 12, padding: 14, marginBottom: 10,
    },
    rowButtonLabel: { color: "#FFFFFF", fontSize: 15 },
    rowButtonValue: { color: "#4ADE80", fontSize: 15, fontWeight: "600" },
    modalBackdrop: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center", padding: 20,
    },
    modalCard: { backgroundColor: "#1E1E2E", borderRadius: 16, padding: 20 },
    modalTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold", marginBottom: 8 },
    modalHint: { color: "#888", fontSize: 13, marginBottom: 16 },
    modalInput: {
        backgroundColor: "#2A2A3C", color: "#FFFFFF", padding: 14,
        borderRadius: 12, fontSize: 16, marginBottom: 12,
    },
    modalRow: { flexDirection: "row", justifyContent: "space-between" },
    modalCancelBtn: {
        flex: 1, backgroundColor: "#2A2A3C", padding: 14,
        borderRadius: 12, alignItems: "center", marginRight: 8,
    },
    modalCancel: {
        backgroundColor: "#2A2A3C", padding: 14,
        borderRadius: 12, alignItems: "center", marginTop: 8,
    },
    modalCancelText: { color: "#FFFFFF", fontSize: 15 },
    modalConfirmBtn: {
        flex: 1, backgroundColor: "#4ADE80", padding: 14,
        borderRadius: 12, alignItems: "center", marginLeft: 8,
    },
    modalConfirmText: { color: "#000", fontSize: 15, fontWeight: "bold" },
    currencyList: { maxHeight: 320 },
    currencyOption: {
        padding: 14, borderRadius: 10, marginBottom: 6, backgroundColor: "#2A2A3C",
    },
    currencyOptionActive: { borderWidth: 1, borderColor: "#4ADE80" },
    currencyOptionText: { color: "#FFFFFF", fontSize: 15 },
});

export default SettingsScreen;
