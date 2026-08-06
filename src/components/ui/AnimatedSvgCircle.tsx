import { Animated } from 'react-native';
import { Circle, type CircleProps } from 'react-native-svg';

/**
 * Animated SVG circle that strips React Native host props (`collapsable`, etc.)
 * before they reach the DOM. Plain `Animated.createAnimatedComponent(Circle)`
 * leaks those on web and triggers React console errors during hold-to-reveal.
 */
function SvgCircleHost(props: CircleProps & { collapsable?: boolean }) {
  const { collapsable: _collapsable, ...rest } = props;
  return <Circle {...rest} />;
}

export const AnimatedSvgCircle = Animated.createAnimatedComponent(SvgCircleHost);
