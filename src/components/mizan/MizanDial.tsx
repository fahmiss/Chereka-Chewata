import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { MIZAN_BANDS } from '../../domain/mizan/types';
import { alpha, color } from '../../theme/tokens';
import { family } from '../../theme/typography';

type Props = {
  accent: string;
  /** Hidden target, 0–100. Omit to keep it hidden. */
  target?: number;
  /** Needle position, 0–100. Omit to hide the needle. */
  needle?: number;
  /** When set, dragging anywhere on the dial moves the needle. */
  onChange?: (value: number) => void;
};

const PAD = 14;

/** Value 0 sits at the left end, 100 at the right, over the top of the arc. */
function angleFor(value: number): number {
  return Math.PI * (1 - value / 100);
}

function pointAt(cx: number, cy: number, r: number, value: number) {
  const angle = angleFor(value);
  return { x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle) };
}

function bandPath(cx: number, cy: number, inner: number, outer: number, from: number, to: number) {
  const a = pointAt(cx, cy, outer, from);
  const b = pointAt(cx, cy, outer, to);
  const c = pointAt(cx, cy, inner, to);
  const d = pointAt(cx, cy, inner, from);
  return `M${a.x} ${a.y} A${outer} ${outer} 0 0 1 ${b.x} ${b.y} L${c.x} ${c.y} A${inner} ${inner} 0 0 0 ${d.x} ${d.y} Z`;
}

/** Scoring wedges around the target, clipped to the dial. */
function targetBands(target: number) {
  const bands: { from: number; to: number; points: number }[] = [];
  let previous = 0;
  for (const band of MIZAN_BANDS) {
    const left = { from: target - band.within, to: target - previous };
    const right = { from: target + previous, to: target + band.within };
    for (const side of previous === 0 ? [{ from: left.from, to: right.to }] : [left, right]) {
      const from = Math.max(0, side.from);
      const to = Math.min(100, side.to);
      if (to > from) bands.push({ from, to, points: band.points });
    }
    previous = band.within;
  }
  return bands;
}

export function MizanDial({ accent, target, needle, onChange }: Props) {
  const [width, setWidth] = useState(0);
  const wrapRef = useRef<View>(null);
  const origin = useRef({ x: 0, y: 0 });
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const radius = Math.max(60, Math.min(width / 2 - PAD, 190));
  const cx = width / 2;
  const cy = radius + PAD;
  const height = cy + PAD + 6;
  const inner = radius * 0.32;
  const geometry = useRef({ cx, cy });
  geometry.current = { cx, cy };

  const measure = () => {
    wrapRef.current?.measureInWindow((x, y) => {
      origin.current = { x, y };
    });
  };

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
    measure();
  };

  const responder = useMemo(() => {
    const update = (pageX: number, pageY: number) => {
      const handler = onChangeRef.current;
      if (!handler) return;
      const dx = pageX - (origin.current.x + geometry.current.cx);
      const dy = origin.current.y + geometry.current.cy - pageY;
      let angle = Math.atan2(dy, dx);
      if (dy < 0) angle = dx < 0 ? Math.PI : 0;
      handler(100 * (1 - angle / Math.PI));
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !!onChangeRef.current,
      onMoveShouldSetPanResponder: () => !!onChangeRef.current,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        measure();
        update(event.nativeEvent.pageX, event.nativeEvent.pageY);
      },
      onPanResponderMove: (event) => update(event.nativeEvent.pageX, event.nativeEvent.pageY),
    });
  }, []);

  const needlePoint = needle === undefined ? null : pointAt(cx, cy, radius - 6, needle);

  return (
    <View
      ref={wrapRef}
      onLayout={onLayout}
      style={[styles.wrap, { height: width ? height : 220 }]}
      {...(onChange ? responder.panHandlers : null)}
    >
      {width > 0 ? (
        <Svg width={width} height={height} pointerEvents="none">
          <Path
            d={bandPath(cx, cy, inner, radius, 0, 100)}
            fill={alpha(color.textPrimary, 0.05)}
            stroke={alpha(color.textPrimary, 0.14)}
            strokeWidth={1}
          />
          {target !== undefined ? (
            <G>
              {targetBands(target).map((band) => (
                <Path
                  key={`${band.from}-${band.to}`}
                  d={bandPath(cx, cy, inner, radius, band.from, band.to)}
                  fill={alpha(accent, band.points === 4 ? 0.95 : band.points === 3 ? 0.6 : 0.32)}
                />
              ))}
              {targetBands(target).map((band) => {
                const label = pointAt(cx, cy, radius - 18, (band.from + band.to) / 2);
                return band.to - band.from >= 4 ? (
                  <SvgText
                    key={`label-${band.from}`}
                    x={label.x}
                    y={label.y + 5}
                    fill={band.points === 4 ? color.void : color.textPrimary}
                    fontSize={14}
                    fontFamily={family.grotesque.bold}
                    textAnchor="middle"
                  >
                    {band.points}
                  </SvgText>
                ) : null;
              })}
            </G>
          ) : null}
          {needlePoint ? (
            <G>
              <Line
                x1={cx}
                y1={cy}
                x2={needlePoint.x}
                y2={needlePoint.y}
                stroke={color.textPrimary}
                strokeWidth={4}
                strokeLinecap="round"
              />
              <Circle cx={needlePoint.x} cy={needlePoint.y} r={9} fill={accent} />
            </G>
          ) : null}
          <Circle cx={cx} cy={cy} r={12} fill={color.surfaceRaised} stroke={alpha(accent, 0.6)} />
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
});
