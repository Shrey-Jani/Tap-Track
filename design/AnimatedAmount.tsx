import { formatCentstoDisplayCurrency } from "@/utils/formatCurrency";
import React, { useEffect, useState } from "react";
import { TextStyle } from "react-native";
import Animated, {
    Easing,
    runOnJS,
    useAnimatedReaction,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface AnimatedAmountProps {
    valueInCents: number;
    currencyCode: string;
    style?: TextStyle | TextStyle[];
    duration?: number;
}

const AnimatedAmount: React.FC<AnimatedAmountProps> = ({
    valueInCents,
    currencyCode,
    style,
    duration = 700,
}) => {
    const animated = useSharedValue(valueInCents);
    const [displayed, setDisplayed] = useState<number>(valueInCents);

    useEffect(() => {
        animated.value = withTiming(valueInCents, {
            duration,
            easing: Easing.out(Easing.cubic),
        });
    }, [valueInCents, duration, animated]);

    useAnimatedReaction(
        () => Math.round(animated.value),
        (current, previous) => {
            if (current !== previous) {
                runOnJS(setDisplayed)(current);
            }
        }
    );

    return (
        <Animated.Text style={style} numberOfLines={1} adjustsFontSizeToFit>
            {formatCentstoDisplayCurrency(displayed, currencyCode)}
        </Animated.Text>
    );
};

export default AnimatedAmount;
