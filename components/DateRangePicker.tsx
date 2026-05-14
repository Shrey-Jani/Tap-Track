import { radii, spacing, typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { addDays, format, isToday, subDays } from "date-fns";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface DateRangePickerProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ selectedDate, onDateChange }) => {
    const { palette, mode } = useTheme();
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const atToday = isToday(selectedDate);

    const goToPreviousDay = () => {
        Haptics.selectionAsync().catch(() => undefined);
        onDateChange(subDays(selectedDate, 1));
    };

    const goToNextDay = () => {
        if (!atToday) {
            Haptics.selectionAsync().catch(() => undefined);
            onDateChange(addDays(selectedDate, 1));
        }
    };

    const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
        setShowPicker(false);
        if (date) onDateChange(date);
    };

    const formattedDate = atToday ? "Today" : format(selectedDate, "EEE, MMM dd");

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: palette.bg.surface,
            borderRadius: radii.pill,
            padding: 4,
            marginBottom: spacing.md,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: palette.border.subtle,
        },
        arrowButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
        },
        arrowDisabled: { opacity: 0.4 },
        dateButton: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 8,
        },
        dateText: {
            ...typography.h3,
            color: palette.text.primary,
        },
    }), [palette]);

    return (
        <View style={styles.container}>
            <Pressable onPress={goToPreviousDay} style={styles.arrowButton} hitSlop={8}>
                <Feather name="chevron-left" size={20} color={palette.brand.primary} />
            </Pressable>

            <Pressable onPress={() => setShowPicker(true)} style={styles.dateButton}>
                <Feather name="calendar" size={14} color={palette.text.secondary} />
                <Text style={styles.dateText}>{formattedDate}</Text>
            </Pressable>

            <Pressable
                onPress={goToNextDay}
                style={[styles.arrowButton, atToday && styles.arrowDisabled]}
                disabled={atToday}
                hitSlop={8}
            >
                <Feather
                    name="chevron-right"
                    size={20}
                    color={atToday ? palette.text.muted : palette.brand.primary}
                />
            </Pressable>

            {showPicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                    themeVariant={mode}
                />
            )}
        </View>
    );
};

export default DateRangePicker;
