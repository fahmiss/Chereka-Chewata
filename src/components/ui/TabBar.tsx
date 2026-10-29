import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { MessageKey } from '../../i18n';
import { useT } from '../../i18n';
import { alpha, color, elevation, overlay, radius, space } from '../../theme/tokens';
import { family } from '../../theme/typography';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

const BAR_HEIGHT = 64;
const SIDE_INSET = space[5];

const TABS: Record<string, { icon: IconName; label: MessageKey }> = {
  home: { icon: 'home', label: 'tabs.home' },
  players: { icon: 'users', label: 'tabs.players' },
  settings: { icon: 'settings', label: 'common.settings' },
};

/** Distance from the screen bottom to the top of the bar, for scroll padding. */
export function useTabBarClearance() {
  const insets = useSafeAreaInsets();
  return barBottom(insets.bottom) + BAR_HEIGHT + space[4];
}

function barBottom(safeBottom: number) {
  return Math.max(safeBottom, space[3]);
}

/**
 * Floating pill over the content — warm midnight with a honey top edge, the
 * same light logic as the game cards. The active tab is honey and wears a
 * small crescent, the brand mark, instead of a generic dot.
 */
export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { t, uiFont } = useT();
  const bottom = barBottom(insets.bottom);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Content dissolves under the bar instead of being cut off by it. */}
      <LinearGradient
        pointerEvents="none"
        colors={[alpha(color.void, 0), alpha(color.void, 0.9)]}
        style={[styles.fade, { height: bottom + BAR_HEIGHT + space[8] }]}
      />
      <View style={[styles.bar, { bottom }]}>
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          const label = t(tab.label);
          const tint = focused ? color.brandPrimary : color.textMuted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          // PressableScale applies `style` to its inner view, so the flex
          // share lives on a wrapper.
          return (
            <View key={route.key} style={styles.item}>
              <PressableScale
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={
                  descriptors[route.key]?.options.tabBarAccessibilityLabel ?? label
                }
                onPress={onPress}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                haptic="selection"
                scaleTo={0.92}
                style={styles.itemPress}
              >
                <View style={[styles.itemInner, focused && styles.itemActive]}>
                  <View style={styles.crescentSlot}>{focused ? <Crescent /> : null}</View>
                  <Icon name={tab.icon} size={21} color={tint} strokeWidth={focused ? 2.3 : 2} />
                  <Text
                    style={[styles.label, { color: tint }, uiFont ? { fontFamily: uiFont } : null]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </View>
              </PressableScale>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Crescent() {
  return (
    <Svg width={9} height={9} viewBox="0 0 24 24">
      <Path d="M12 3a9 9 0 1 0 9 9 7 7 0 1 1-9-9z" fill={color.brandPrimary} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bar: {
    position: 'absolute',
    left: SIDE_INSET,
    right: SIDE_INSET,
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[2],
    borderRadius: radius.pill,
    backgroundColor: alpha(color.surface, 0.96),
    borderWidth: 1,
    borderColor: overlay.hairline,
    borderTopColor: alpha(color.brandPrimary, 0.28),
    ...elevation.raised,
  },
  item: {
    flex: 1,
    height: BAR_HEIGHT - space[3],
  },
  itemPress: {
    height: BAR_HEIGHT - space[3],
  },
  itemInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    gap: 2,
  },
  itemActive: {
    backgroundColor: alpha(color.brandPrimary, 0.1),
  },
  crescentSlot: {
    height: 9,
    marginTop: -6,
    marginBottom: 1,
  },
  label: {
    fontFamily: family.grotesque.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
});
