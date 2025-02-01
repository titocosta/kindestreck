import React from "react";
import { StyleSheet } from "react-native";
import ListItemLink from "./ListItemLink";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import RadioGroup from 'react-native-radio-buttons-group';
import BottomDrawer, { BottomDrawerMethods } from 'react-native-animated-bottom-drawer';
import { useAppContext } from "@/utils/AppContext";
import { useThemeColor } from "@/hooks/useThemeColor";


export default function DarkModeModal() {
  const drawerRef = React.useRef<BottomDrawerMethods>(null);
  const { darkMode, setDarkMode } = useAppContext();
  const [selected, setSelected] = React.useState(darkMode);
  const backgroundColor = useThemeColor({ darkMode }, 'background');

  const radioBtns = React.useMemo(() => ([
    {
      id: 'system',
      label: <ThemedText style={styles.label}>System</ThemedText>,
      value: 'system',
      containerStyle: { paddingVertical: 10 },
    },
    {
      id: 'light',
      label: <ThemedText style={styles.label}>Light</ThemedText>,
      value: 'light',
      containerStyle: { paddingVertical: 10 },
    },
    {
      id: 'dark',
      label: <ThemedText style={styles.label}>Dark</ThemedText>,
      value: 'dark',
      containerStyle: { paddingVertical: 10 },
    },
  ]), []);

  const onSelect = (selectedId: string) => {
    // @ts-ignore
    setDarkMode(selectedId);
    // @ts-ignore
    setSelected(selectedId);
  };

  return (
    <>
      <BottomDrawer
        ref={drawerRef}
        customStyles={{ handleContainer: { backgroundColor, borderTopLeftRadius: 20, borderTopRightRadius: 20 } }}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="subtitle">Dark mode</ThemedText>
          <RadioGroup
            radioButtons={radioBtns}
            onPress={onSelect}
            selectedId={selected}
            layout="column"
            containerStyle={{ paddingVertical: 20, justifyContent: 'flex-start', alignItems: 'flex-start' }} 
          />
        </ThemedView>

      </BottomDrawer>
      <ListItemLink onPress={() => drawerRef.current?.open()} title="Dark mode" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 20,
  },
  label: {
    paddingLeft: 10,
  }
});