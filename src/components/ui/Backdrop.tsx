import { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { color } from '../../theme/tokens';

type Props = {
  /** Tints the lower bloom — pass the active game accent on session screens. */
  accent?: string;
  /** Dial the whole atmosphere down behind dense, text-heavy content. */
  intensity?: number;
};

/**
 * The room the app is played in: void-to-midnight ground, a lamp bloom
 * overhead and a restrained accent bloom low and left.
 *
 * Rendered once per screen, statically — no animation, no per-frame cost.
 */
export function Backdrop({ accent = color.brandMystery, intensity = 1 }: Props) {
  // Measure the space actually filled rather than trusting the window size:
  // an iOS home-screen web app reports a window shorter than the screen.
  const window = useWindowDimensions();
  const [size, setSize] = useState({ width: window.width, height: window.height });
  const { width, height } = size;

  // Deterministic dust — a fixed seed keeps stars from jumping between renders.
  const stars = useMemo(() => {
    let seed = 0x2f6e2b1;
    const random = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    return Array.from({ length: 12 }, () => ({
      x: random(),
      y: random(),
      r: 0.5 + random() * 1.3,
      o: 0.12 + random() * 0.35,
    }));
  }, []);

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(event) => {
        const { width: w, height: h } = event.nativeEvent.layout;
        if (w !== width || h !== height) setSize({ width: w, height: h });
      }}
    >
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color.background} />
            <Stop offset="0.55" stopColor={color.background} />
            <Stop offset="1" stopColor={color.void} />
          </LinearGradient>

          <RadialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={color.brandPrimary} stopOpacity={0.14 * intensity} />
            <Stop offset="0.55" stopColor={color.brandPrimary} stopOpacity={0.035 * intensity} />
            <Stop offset="1" stopColor={color.brandPrimary} stopOpacity={0} />
          </RadialGradient>

          <RadialGradient id="accent" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={accent} stopOpacity={0.12 * intensity} />
            <Stop offset="0.6" stopColor={accent} stopOpacity={0.03 * intensity} />
            <Stop offset="1" stopColor={accent} stopOpacity={0} />
          </RadialGradient>

          {/* Corners fall off so content always sits in the lit centre. */}
          <RadialGradient id="vignette" cx="0.5" cy="0.5" r="0.72">
            <Stop offset="0.55" stopColor={color.void} stopOpacity={0} />
            <Stop offset="1" stopColor={color.void} stopOpacity={0.4} />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={width} height={height} fill="url(#ground)" />

        <Ellipse
          cx={width * 0.78}
          cy={height * -0.02}
          rx={width * 0.85}
          ry={height * 0.32}
          fill="url(#lamp)"
        />
        <Ellipse
          cx={width * 0.08}
          cy={height * 0.74}
          rx={width * 0.8}
          ry={height * 0.38}
          fill="url(#accent)"
        />

        {stars.map((star, index) => (
          <Circle
            key={index}
            cx={star.x * width}
            cy={star.y * height}
            r={star.r}
            fill={color.textPrimary}
            opacity={star.o * intensity}
          />
        ))}

        <Rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
      </Svg>
    </View>
  );
}
