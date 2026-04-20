import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { addDays, format, isToday, subDays } from "date-fns";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";


interface DateRangePickerProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;  
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ selectedDate, onDateChange }) => {
    const [showPicker, setShowPicker] = useState<boolean>(false);

    const goToPreviousDay = () => {
        onDateChange(subDays(selectedDate, 1));
    };

    const goToNextDay = () => {
        if (!isToday(selectedDate)) {
            onDateChange(addDays(selectedDate, 1));
        }
    };

    const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
        setShowPicker(false);
        if (date) {
            onDateChange(date);
        }
    };

    const formattedDate = isToday(selectedDate)
        ? "Today"
        : format(selectedDate, "MMM dd, yyyy");

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={goToPreviousDay} style={styles.arrowButton}>
                <Text style={styles.arrowText}>◀</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>{formattedDate}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={goToNextDay}
                style={[styles.arrowButton, isToday(selectedDate) && styles.arrowDisabled]}
                disabled={isToday(selectedDate)}
            >
                <Text style={[styles.arrowText, isToday(selectedDate) && styles.arrowTextDisabled]}>▶</Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    maximumDate={new Date()}
                    onChange={handleDateChange}
                    themeVariant="dark"
                />
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container:{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1E1E2E",
        borderRadius: 12,
        padding: 8,
        marginBottom: 12,
    },
    arrowButton: {
        padding: 12,
    },

    arrowText: {
        color: "#4ADE80",
        fontSize:18,
        fontWeight:"bold",
    },

    arrowDisabled: {
        opacity: 0.3,
    },

    arrowTextDisabled: {
        color: "#888",
    },

    dateButton : {
        flex: 1,
        alignItems: "center",
        paddingVertical: 8,
    },

    dateText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default DateRangePicker;