import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SettingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.settingItem}>Currency: CAD</Text>
      <Text style={styles.settingItem}>Version 1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121218",
    padding: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  settingItem: {
    color: "#888",
    fontSize: 16,
    marginBottom: 12,
  },
});

export default SettingsScreen;