import { useAppstore } from "@/store/appStore";
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
import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
    Alert,
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
    const { dailyBudgetInCents, loadBudget, saveBudget } = useAppstore();
    const [budgetText, setBudgetText] = useState<string>("");

    const [persistentEnabled, setPersistentEnabled] = useState<boolean>(false);
    const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
    const [reminderTime, setReminderTime] = useState<ReminderTime>({ hour: 21, minute: 0 });
    const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

    useEffect(() => {
        loadBudget();
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
            Alert.alert("Invalid Budget", "Please enter a valid amount greater than $0.");
            return;
        }
        const budgetInCents = Math.round(parsed * 100);
        saveBudget(budgetInCents);
        Alert.alert("Budget Saved ✅", `Your daily budget is now ${formatCentstoDisplayCurrency(budgetInCents)}.`);
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

    const reminderTimeAsDate = (() => {
        const d = new Date();
        d.setHours(reminderTime.hour, reminderTime.minute, 0, 0);
        return d;
    })();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Settings</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Budget</Text>
                <Text style={styles.sectionHint}>
                    You'll get an alert when your daily spending exceeds this amount.
                </Text>
                <View style={styles.budgetRow}>
                    <Text style={styles.currencySymbol}>$</Text>
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
                    Current: {formatCentstoDisplayCurrency(dailyBudgetInCents)}
                </Text>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveBudget}>
                    <Text style={styles.saveButtonText}>Save Budget</Text>
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
                <Text style={styles.sectionTitle}>App Info</Text>
                <Text style={styles.settingItem}>Currency: CAD</Text>
                <Text style={styles.settingItem}>Version: 1.0.0</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121218",
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 24,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        color: "#4ADE80",
        fontSize: 14,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 6,
    },
    sectionHint: {
        color: "#888",
        fontSize: 13,
        marginBottom: 12,
    },
    budgetRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E1E2E",
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    currencySymbol: {
        color: "#4ADE80",
        fontSize: 28,
        fontWeight: "bold",
        marginRight: 8,
    },
    budgetInput: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 28,
        paddingVertical: 16,
    },
    currentBudget: {
        color: "#888",
        fontSize: 13,
        marginTop: 8,
    },
    saveButton: {
        backgroundColor: "#4ADE80",
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
        marginTop: 12,
    },
    saveButtonText: {
        color: "#000000",
        fontSize: 16,
        fontWeight: "bold",
    },
    settingItem: {
        color: "#FFFFFF",
        fontSize: 16,
        marginBottom: 10,
        backgroundColor: "#1E1E2E",
        padding: 14,
        borderRadius: 12,
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1E1E2E",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },
    toggleLeft: {
        flex: 1,
        marginRight: 12,
    },
    toggleLabel: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
    },
    toggleHint: {
        color: "#888",
        fontSize: 12,
    },
    timeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1E1E2E",
        borderRadius: 12,
        padding: 14,
        marginTop: 2,
    },
    timeButtonLabel: {
        color: "#FFFFFF",
        fontSize: 15,
    },
    timeButtonValue: {
        color: "#4ADE80",
        fontSize: 18,
        fontWeight: "700",
    },
});

export default SettingsScreen;
