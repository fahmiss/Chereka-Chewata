import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { color as palette } from '../../theme/tokens';

/**
 * Line-icon set on a 24×24 grid (Lucide geometry, ISC).
 * Replaces the emoji/glyph placeholders — emoji render differently per
 * platform and never match the type, which is what made the UI read as
 * unbranded.
 */
const ICONS = {
  sliders: (s) => (
    <>
      <Path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3" stroke={s} />
      <Circle cx={12} cy={4} r={2} stroke={s} />
      <Circle cx={10} cy={12} r={2} stroke={s} />
      <Circle cx={14} cy={20} r={2} stroke={s} />
    </>
  ),
  arrowLeft: (s) => <Path d="m12 19-7-7 7-7M19 12H5" stroke={s} />,
  check: (s) => <Path d="M20 6 9 17l-5-5" stroke={s} />,
  checkCircle: (s) => (
    <>
      <Circle cx={12} cy={12} r={10} stroke={s} />
      <Path d="m9 12 2 2 4-4" stroke={s} />
    </>
  ),
  chevronUp: (s) => <Path d="m18 15-6-6-6 6" stroke={s} />,
  chevronDown: (s) => <Path d="m6 9 6 6 6-6" stroke={s} />,
  chevronRight: (s) => <Path d="m9 18 6-6-6-6" stroke={s} />,
  close: (s) => <Path d="M18 6 6 18M6 6l12 12" stroke={s} />,
  plus: (s) => <Path d="M5 12h14M12 5v14" stroke={s} />,
  users: (s) => (
    <>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={s} />
      <Circle cx={9} cy={7} r={4} stroke={s} />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={s} />
    </>
  ),
  clock: (s) => (
    <>
      <Circle cx={12} cy={12} r={10} stroke={s} />
      <Path d="M12 6v6l4 2" stroke={s} />
    </>
  ),
  lock: (s) => (
    <>
      <Rect x={3} y={11} width={18} height={11} rx={2} stroke={s} />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={s} />
    </>
  ),
  eye: (s) => (
    <>
      <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" stroke={s} />
      <Circle cx={12} cy={12} r={3} stroke={s} />
    </>
  ),
  trophy: (s) => (
    <>
      <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16" stroke={s} />
      <Path
        d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
        stroke={s}
      />
      <Path d="M18 2H6v7a6 6 0 0 0 12 0Z" stroke={s} />
    </>
  ),
  refresh: (s) => (
    <Path
      d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"
      stroke={s}
    />
  ),
  shuffle: (s) => (
    <Path
      d="m18 14 4 4-4 4M18 2l4 4-4 4M2 18h2a4 4 0 0 0 3.3-1.7l5.4-8.6A4 4 0 0 1 16 6h6M2 6h2a4 4 0 0 1 3.6 2.2M22 18h-6a4 4 0 0 1-3.3-1.8l-.36-.45"
      stroke={s}
    />
  ),
  alert: (s) => (
    <>
      <Path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z" stroke={s} />
      <Path d="M12 9v4M12 17h.01" stroke={s} />
    </>
  ),
  pencil: (s) => (
    <Path
      d="M21.2 6.8a1 1 0 0 0-4-4L3.8 16.2a2 2 0 0 0-.5.8l-1.3 4.4a.5.5 0 0 0 .6.6l4.4-1.3a2 2 0 0 0 .8-.5zM15 5l4 4"
      stroke={s}
    />
  ),
  home: (s) => <Path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10" stroke={s} />,
  flame: (s) => (
    <Path
      d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5Z"
      stroke={s}
    />
  ),
  layers: (s) => (
    <Path
      d="M12.8 2.2a2 2 0 0 0-1.6 0L2.6 6.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.6 0l8.6-3.9a1 1 0 0 0 0-1.8ZM6 12l-3.4 1.6a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.6 0l8.6-3.9a1 1 0 0 0 0-1.8L18 12"
      stroke={s}
    />
  ),
  megaphone: (s) => (
    <Path d="m3 11 18-5v12L3 14ZM11.6 16.8a3 3 0 1 1-5.8-1.6" stroke={s} />
  ),
  phone: (s) => (
    <>
      <Rect x={5} y={2} width={14} height={20} rx={2.5} stroke={s} />
      <Path d="M12 18h.01" stroke={s} />
    </>
  ),
  target: (s) => (
    <>
      <Circle cx={12} cy={12} r={10} stroke={s} />
      <Circle cx={12} cy={12} r={6} stroke={s} />
      <Circle cx={12} cy={12} r={2} stroke={s} />
    </>
  ),
  box: (s) => (
    <Path
      d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16ZM3.3 7 12 12l8.7-5M12 22V12"
      stroke={s}
    />
  ),
  utensils: (s) => (
    <Path
      d="M3 2v7a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V2M6 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3Zm0 0v7"
      stroke={s}
    />
  ),
  mapPin: (s) => (
    <>
      <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke={s} />
      <Circle cx={12} cy={10} r={3} stroke={s} />
    </>
  ),
  film: (s) => (
    <>
      <Rect x={2} y={2} width={20} height={20} rx={2.2} stroke={s} />
      <Path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" stroke={s} />
    </>
  ),
  book: (s) => (
    <Path
      d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1 0-5H20"
      stroke={s}
    />
  ),
  smile: (s) => (
    <>
      <Circle cx={12} cy={12} r={10} stroke={s} />
      <Path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke={s} />
    </>
  ),
  mask: (s) => (
    <>
      <Path d="M4 6.5C4 5 5 4.4 6.2 4.7L12 6l5.8-1.3C19 4.4 20 5 20 6.5c0 5.8-3.6 12.8-8 12.8S4 12.3 4 6.5Z" stroke={s} />
      <Path d="M9 10.5h1.5M13.5 10.5H15" stroke={s} />
    </>
  ),
  bomb: (s) => (
    <>
      <Circle cx={11} cy={13} r={8} stroke={s} />
      <Path d="m16.5 7.5 2-2M18.5 5.5h2M18.5 5.5v-2M14.8 5.8l1.7 1.7M8 5h6" stroke={s} />
    </>
  ),
} satisfies Record<string, (stroke: string) => ReactNode>;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({
  name,
  size = 20,
  color = palette.textSecondary,
  strokeWidth = 2,
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name](color)}
    </Svg>
  );
}
