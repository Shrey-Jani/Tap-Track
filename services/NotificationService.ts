import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const PERSISTENT_QUICK_ADD_ID = "taptrack_persistent_quick_add";
const END_OF_DAY_REMINDER_ID = "taptrack_end_of_day_reminder";

const STORAGE_KEY_PERSISTENT_ENABLED = "taptrack_persistent_enabled";
const STORAGE_KEY_REMINDER_ENABLED = "taptrack_reminder_enabled";
const STORAGE_KEY_REMINDER_TIME = "taptrack_reminder_time";

export const NOTIFICATION_TAP_ACTION = "open_add_screen";

export interface ReminderTime {
    hour: number;
    minute: number;
}

export function configureNotificationHandler(): void {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    });
}

export async function requestNotificationPermission(): Promise<boolean> {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === "granted") {
        return true;
    }
    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === "granted";
}

export async function postPersistentQuickAddNotification(): Promise<void> {
    await Notifications.dismissNotificationAsync(PERSISTENT_QUICK_ADD_ID).catch(() => undefined);

    await Notifications.scheduleNotificationAsync({
        identifier: PERSISTENT_QUICK_ADD_ID,
        content: {
            title: "TapTrack",
            body: "Tap to log a payment",
            sticky: Platform.OS === "android",
            autoDismiss: false,
            data: { action: NOTIFICATION_TAP_ACTION },
        },
        trigger: null,
    });
}

export async function dismissPersistentQuickAddNotification(): Promise<void> {
    await Notifications.dismissNotificationAsync(PERSISTENT_QUICK_ADD_ID).catch(() => undefined);
    await Notifications.cancelScheduledNotificationAsync(PERSISTENT_QUICK_ADD_ID).catch(() => undefined);
}

export async function scheduleEndOfDayReminder(time: ReminderTime): Promise<void> {
    await cancelEndOfDayReminder();

    await Notifications.scheduleNotificationAsync({
        identifier: END_OF_DAY_REMINDER_ID,
        content: {
            title: "End-of-day check-in",
            body: "Did you log all of today's payments?",
            data: { action: NOTIFICATION_TAP_ACTION },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: time.hour,
            minute: time.minute,
        },
    });
}

export async function cancelEndOfDayReminder(): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(END_OF_DAY_REMINDER_ID).catch(() => undefined);
}

export async function savePersistentEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY_PERSISTENT_ENABLED, enabled ? "1" : "0");
}

export async function loadPersistentEnabled(): Promise<boolean> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_PERSISTENT_ENABLED);
    return stored === "1";
}

export async function saveReminderEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY_REMINDER_ENABLED, enabled ? "1" : "0");
}

export async function loadReminderEnabled(): Promise<boolean> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_REMINDER_ENABLED);
    return stored === "1";
}

export async function saveReminderTime(time: ReminderTime): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY_REMINDER_TIME, `${time.hour}:${time.minute}`);
}

export async function loadReminderTime(): Promise<ReminderTime> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_REMINDER_TIME);
    if (!stored) {
        return { hour: 21, minute: 0 };
    }
    const [hourStr, minuteStr] = stored.split(":");
    return { hour: parseInt(hourStr, 10), minute: parseInt(minuteStr, 10) };
}
