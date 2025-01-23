import { View, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Progress from 'react-native-progress';
import { useAppContext } from '@/utils/AppContext';

export function ThemedProgressCircle(props: any) {
  const { darkMode } = useAppContext();
  const color = useThemeColor({darkMode}, 'tint');
  return (
    <View style={styles.container}>
      <Progress.Circle color={color} indeterminate={true} {...props} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
})