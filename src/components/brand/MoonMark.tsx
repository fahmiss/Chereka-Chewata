import { useId } from 'react';
import Svg, { Circle, Defs, Mask, RadialGradient, Rect, Stop } from 'react-native-svg';
import { color } from '../../theme/tokens';

type Props = {
  size?: number;
  /** Halo behind the crescent. Off inside dense lists. */
  glow?: boolean;
  /** Faint ring the game dots travel along. */
  orbit?: boolean;
};

/**
 * Crescent moon + three orbiting game dots (brand board, Step 7).
 *
 * The crescent is a real masked subtraction, so the mark keeps its shape on
 * any surface — the previous version punched the bite out with a
 * background-coloured circle and broke wherever it wasn't on the background.
 */
export function MoonMark({ size = 40, glow = true, orbit = false }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const maskId = `moon-mask-${uid}`;
  const glowId = `moon-glow-${uid}`;

  const c = size / 2;
  const moonR = size * 0.34;
  // Bite offset up-right, matching the brand board's waxing crescent.
  const biteR = moonR * 0.9;
  const biteX = c + moonR * 0.52;
  const biteY = c - moonR * 0.34;

  const dots = [
    { r: size * 0.062, fill: color.brandMystery, x: 0.5, y: 0.5, angle: 0.72 },
    { r: size * 0.042, fill: color.success, x: 0.5, y: 0.5, angle: 0.02 },
    { r: size * 0.032, fill: color.dangerUrgency, x: 0.5, y: 0.5, angle: 1.45 },
  ];
  const orbitR = size * 0.44;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <Mask id={maskId}>
          <Rect x={0} y={0} width={size} height={size} fill="black" />
          <Circle cx={c} cy={c} r={moonR} fill="white" />
          <Circle cx={biteX} cy={biteY} r={biteR} fill="black" />
        </Mask>
        <RadialGradient id={glowId} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={color.brandPrimary} stopOpacity={0.4} />
          <Stop offset="0.6" stopColor={color.brandPrimary} stopOpacity={0.1} />
          <Stop offset="1" stopColor={color.brandPrimary} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {glow ? <Circle cx={c} cy={c} r={size * 0.5} fill={`url(#${glowId})`} /> : null}
      {orbit ? (
        <Circle
          cx={c}
          cy={c}
          r={orbitR}
          stroke={color.brandPrimary}
          strokeOpacity={0.18}
          strokeWidth={1}
          fill="none"
        />
      ) : null}

      <Rect
        x={0}
        y={0}
        width={size}
        height={size}
        fill={color.brandPrimary}
        mask={`url(#${maskId})`}
      />

      {dots.map((dot, index) => (
        <Circle
          key={index}
          cx={c + Math.cos(dot.angle * Math.PI * 2) * orbitR}
          cy={c + Math.sin(dot.angle * Math.PI * 2) * orbitR}
          r={dot.r}
          fill={dot.fill}
        />
      ))}
    </Svg>
  );
}
