import { StyleProp, ViewStyle, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, type Href } from "expo-router";
import { useAppContext } from '@/utils/AppContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';


interface ListItemLinkProps {
  title: string;
  subtitle?: string;
  iconName?: string;
  onPress?: () => void;
  href?: Href;
  style?: StyleProp<ViewStyle>;
  secondary?: boolean;
}

export default function ListItemLink({title, subtitle, onPress, href, style, secondary}: ListItemLinkProps) {
  const { darkMode } = useAppContext();
  const borderColor = useThemeColor({darkMode}, 'border');
  const color = secondary ? useThemeColor({darkMode}, 'secondary') : useThemeColor({darkMode}, 'text');
  console.debug(`[ListItemLink] darkMode: ${darkMode}, secondary: ${secondary}, color: ${color}, borderColor: ${borderColor}, style:`, style);
  const children = (
    <TouchableOpacity style={[style]} onPress={onPress}>
      <ThemedView style={[styles.item, { borderColor }]}>
        <ThemedView style={{ maxWidth: "85%" }}>
          <ThemedText type="defaultSemiBold" style={{ color }}>{title}</ThemedText>
          {subtitle && <ThemedText lighter style={{ fontSize: 14, color }}>{subtitle}</ThemedText>}
        </ThemedView>
        {(onPress || href) && <Ionicons name="chevron-forward" size={32} color={secondary ? color : borderColor} />}
      </ThemedView>
    </TouchableOpacity>
  );
  if(href) return (
    <Link href={href} asChild>
      {children}
    </Link>
  );
  return children;
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    marginTop: -1,
  }
});