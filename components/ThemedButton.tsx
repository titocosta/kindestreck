import React from 'react';
import { View, TouchableOpacity, TouchableOpacityProps, StyleSheet, TextStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedProgressCircle } from './ThemedProgressCircle';
import { useThemeColor } from '@/hooks/useThemeColor';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppContext } from '@/utils/AppContext';

export type ThemedButtonProps = TouchableOpacityProps & {
  title?: string;
  lightColor?: string;
  darkColor?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  icon?: React.ReactNode;
  plain?: boolean;
  secondary?: boolean;
  loading?: boolean;
  textStyle?: TextStyle;
  iconStyle?: TextStyle;
  iconSize?: number;
};

export function ThemedButton({ 
  title, 
  style, 
  lightColor, 
  darkColor, 
  iconName,
  icon,
  plain,
  secondary,
  loading,
  textStyle,
  iconStyle,
  iconSize,
  ...otherProps 
}: ThemedButtonProps) {
  const { darkMode } = useAppContext();
  const backgroundColor = plain ? undefined : useThemeColor({ light: lightColor, dark: darkColor, darkMode }, secondary ? 'secondary' : 'tint');
  const labelColor = useThemeColor({ light: lightColor, dark: darkColor, darkMode }, 'text', !plain);

  const iconElement = loading ? <ThemedProgressCircle size={20} /> : (iconName ? (
    <Ionicons name={iconName} size={iconSize ?? 24} color={labelColor} style={iconStyle} />
  ) : icon);

  const iconElementWithColor = React.isValidElement(iconElement)
    ? React.cloneElement(iconElement, { color: labelColor } as React.HTMLAttributes<HTMLElement>)
    : iconElement;

  const label = iconElement ? (
    <View style={styles.contentContainer}>
      {iconElementWithColor}
      {title && <ThemedText style={[styles.buttonText, textStyle]} negative>{title}</ThemedText>}
    </View>
  ) : (
    <ThemedText style={[styles.buttonText, textStyle]} negative>{title}</ThemedText>
  );

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor }, style]} 
      {...otherProps}
    >
      {label}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: "auto"
  },
});
