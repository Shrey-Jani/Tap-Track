import { PaymentCategory } from "@/models/payment";
import { CATEGORY_ICONS } from "@/utils/constants";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CategoryPickerProps{
    selectedCategory: PaymentCategory,
    onSelectedCategory: (category: PaymentCategory) => void;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({selectedCategory, onSelectedCategory}) => {
    const categories = Object.values(PaymentCategory);

    return (
        <View style={styles.container}>
            {categories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                    <TouchableOpacity
                    key={category}
                    onPress={() => onSelectedCategory(category)}
                    style={[
                        styles.categoryButton, 
                        isSelected && styles.categoryButtonSelected,
                    ]}
                    accessibilityLabel={`Select category ${category}`}
                    accessibilityState={{ selected : isSelected }}>
                        
                    <Text style={styles.categoryIcon}>
                    {CATEGORY_ICONS[category]}
                    </Text>

                    <Text style={[
                        styles.categoryName,
                        isSelected && styles.categoryNameSelected,
                    ]}
                    numberOfLines={1}>
                    {category}
                    </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },

    categoryButton: {
        width:"30%",
        padding: 12,
        borderRadius: 12,
        backgroundColor:"#3A3A4C",
        alignItems: "center",
        justifyContent: "center",
    },
    categoryButtonSelected: {
        backgroundColor:"#4ADE80",
    },

    categoryIcon: {
        fontSize: 11,
        textAlign: "center",
        color: "#FFFFFF",
        fontWeight:"500",
    },
    categoryName: {
        fontSize: 11,
        textAlign: "center",
        color: "#FFFFFF",
        fontWeight: "500",
        marginTop: 4,
    },

    categoryNameSelected: {
        color: "#1A1A2E",
        fontWeight: "600",
    },
        
});

export default CategoryPicker;