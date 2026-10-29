import { Tabs } from 'expo-router/js-tabs';
import { TabBar } from '../../src/components/ui/TabBar';
import { color } from '../../src/theme/tokens';

/**
 * Top-level destinations only. Game details, setup and live sessions push
 * over this on the root stack, so the bar never offers a one-tap exit from a
 * secret reveal (spec §14.2).
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: color.background },
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="players" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
