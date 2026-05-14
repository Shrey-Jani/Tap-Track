import { typography } from "@/design/theme";
import { useTheme } from "@/design/useTheme";
import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

interface TabIconProps {
    name: FeatherIconName;
    color: string;
    focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ name, color, focused }) => {
    const { palette } = useTheme();
    return (
        <View style={tabIconStyles.iconWrap}>
            <Feather name={name} size={22} color={color} />
            {focused && (
                <View style={[tabIconStyles.activeDot, { backgroundColor: palette.brand.primary }]} />
            )}
        </View>
    );
};

const tabIconStyles = StyleSheet.create({
    iconWrap: {
        alignItems: "center",
        justifyContent: "center",
        height: 26,
    },
    activeDot: {
        position: "absolute",
        bottom: -6,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
});

const TabLayout: React.FC = () => {
    const { palette } = useTheme();

    const screenOptions = useMemo(() => ({
        tabBarActiveTintColor: palette.brand.primary,
        tabBarInactiveTintColor: palette.text.muted,
        tabBarStyle: {
            backgroundColor: palette.bg.surface,
            borderTopColor: palette.border.subtle,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: Platform.OS === "ios" ? 88 : 68,
            paddingTop: 8,
        },
        tabBarLabelStyle: {
            ...typography.caption,
            fontWeight: "600" as const,
            marginTop: 2,
        },
        tabBarItemStyle: { paddingTop: 4 },
        headerShown: false,
    }), [palette]);

    return (
        <Tabs screenOptions={screenOptions}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    title: "Add",
                    tabBarIcon: ({ color, focused }) => <TabIcon name="plus-circle" color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="summary"
                options={{
                    title: "Summary",
                    tabBarIcon: ({ color, focused }) => <TabIcon name="bar-chart-2" color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, focused }) => <TabIcon name="settings" color={color} focused={focused} />,
                }}
            />
        </Tabs>
    );
};

export default TabLayout;
