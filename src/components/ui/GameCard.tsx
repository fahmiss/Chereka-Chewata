import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import type { GameCatalogEntry, GameId } from '../../domain/games';
import { useEnterAnimation } from '../../theme/motion';
import { alpha, color, glow, mix, overlay, radius, space } from '../../theme/tokens';
import { family } from '../../theme/typography';
import { GAME_ART } from '../brand/gameArt';
import { GAME_MOON_EXPRESSION } from '../brand/gameMoonExpression';
import { MoonFace } from '../brand/MoonFace';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

type Props = {
  game: GameCatalogEntry;
  /** Wide spans the row with art on the right; half stacks title over art. */
  variant: 'wide' | 'half';
  /** Small label above the title, e.g. "Tonight's pick". */
  eyebrow?: string;
  /** Stagger position for the enter animation. */
  index?: number;
  onPress: () => void;
};

const WIDE_HEIGHT = 150;
const HALF_HEIGHT = 204;
/** Half cards keep a clear band for the title; the art starts below it. */
const HALF_ART_TOP = 40;
/** How far into the art the title band's shade reaches — short, so faces near the top stay clear. */
const HALF_SCRIM_FADE = 28;
/** Cap on the wide art's left fade, so 16:9 scenes keep the faces on their left third. */
const WIDE_FADE_MAX = 72;

/**
 * Bomb's art is already the loudest red on the page, so its card ground is
 * smoky rather than lit — keeps it from merging with Who's the Liar.
 */
const TINT_STRENGTH: Partial<Record<GameId, number>> = { bomb: 0.45 };

/**
 * Home catalog card. Dark ground tinted by the game colour, the game's
 * illustrated moment on the art side, brush title in a zone the art never
 * covers, and real player / length stats. Lit by a coloured glow and a warm
 * top hairline instead of a bright outline.
 */
export function GameCard({ game, variant, eyebrow, index = 0, onPress }: Props) {
  const enter = useEnterAnimation(index, 14);
  const [width, setWidth] = useState(0);
  const accent = game.accent;
  const wide = variant === 'wide';
  const height = wide ? WIDE_HEIGHT : HALF_HEIGHT;
  const ground = mix(color.background, accent, 0.16 * (TINT_STRENGTH[game.id] ?? 1));
  const locked = !game.playable;

  // Half cards have ~150pt for both chips; the icons already say "players"
  // and the tilde, so the short forms keep them on one row.
  const players = wide
    ? game.playerCountLabel
    : game.playerCountLabel.replace(/\s*players?$/, '');
  const length = wide ? game.sessionLengthLabel : game.sessionLengthLabel.replace(/^~/, '');

  return (
    <Animated.View
      style={[styles.shell, !wide && styles.half, glow(accent, 0.22, 18), enter]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={[
          eyebrow,
          game.name,
          game.tagline,
          locked ? 'Coming soon' : `${game.playerCountLabel}, ${game.sessionLengthLabel}`,
        ]
          .filter(Boolean)
          .join('. ')}
        onPress={onPress}
        haptic="medium"
        scaleTo={0.97}
        style={[styles.card, { height, backgroundColor: ground }, locked && styles.locked]}
      >
        {wide ? (
          <WideArt game={game} height={height} ground={ground} />
        ) : (
          <HalfArt game={game} width={width} height={height} ground={ground} />
        )}

        <View style={[styles.content, wide ? styles.wideContent : styles.halfContent]}>
          <View style={wide ? styles.wideTitleBlock : null}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text
              style={[styles.title, wide ? styles.wideTitle : styles.halfTitle]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {game.name}
            </Text>
          </View>

          <View style={styles.chips}>
            {locked ? (
              <StatChip icon="lock" label="Soon" />
            ) : (
              <>
                <StatChip icon="users" label={players} />
                <StatChip icon="clock" label={length} />
              </>
            )}
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

type ArtProps = {
  game: GameCatalogEntry;
  height: number;
  ground: string;
};

/** Art pinned right at full card height, its left edge dissolving into the ground. */
function WideArt({ game, height, ground }: ArtProps) {
  const set = GAME_ART[game.id];
  const art = set?.wide ?? set?.half;

  if (!art) {
    return (
      <View style={[styles.wideMascot, { height }]}>
        <View style={[styles.halo, { backgroundColor: alpha(game.accent, 0.2) }]} />
        <MoonFace expression={GAME_MOON_EXPRESSION[game.id]} size={112} />
      </View>
    );
  }

  const artWidth = height * art.aspect;
  return (
    <View style={[styles.wideArt, { width: artWidth }]}>
      <Image source={art.source} style={styles.fill} resizeMode="cover" />
      {/* Scrim before fade, so the fade also swallows the scrim's left edge. */}
      <LinearGradient
        colors={[alpha(color.void, 0), alpha(color.void, 0.55)]}
        style={styles.bottomScrim}
      />
      <LinearGradient
        colors={[ground, alpha(ground, 0)]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.wideFade, { width: Math.min(artWidth * 0.42, WIDE_FADE_MAX) }]}
      />
    </View>
  );
}

/**
 * Art covers the window below the title band, top-aligned and centred
 * horizontally; scrims keep both ends legible.
 */
function HalfArt({ game, width, height, ground }: ArtProps & { width: number }) {
  const set = GAME_ART[game.id];
  const art = set?.half ?? set?.wide;
  const windowHeight = height - HALF_ART_TOP;
  const imageWidth = art ? Math.max(width, windowHeight * art.aspect) : 0;

  return (
    <>
      {art ? (
        width > 0 ? (
          <Image
            source={art.source}
            style={[
              styles.halfImage,
              {
                width: imageWidth,
                height: imageWidth / art.aspect,
                left: (width - imageWidth) / 2,
              },
            ]}
            resizeMode="cover"
          />
        ) : null
      ) : (
        <View style={styles.halfMascot}>
          <View style={[styles.halo, { backgroundColor: alpha(game.accent, 0.2) }]} />
          <MoonFace expression={GAME_MOON_EXPRESSION[game.id]} size={112} />
        </View>
      )}
      <LinearGradient
        colors={[ground, ground, alpha(ground, 0)]}
        locations={[0, HALF_ART_TOP / (HALF_ART_TOP + HALF_SCRIM_FADE), 1]}
        style={styles.topScrim}
      />
      <LinearGradient
        colors={[alpha(color.void, 0), alpha(color.void, 0.7)]}
        style={styles.bottomScrim}
      />
    </>
  );
}

function StatChip({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.chip}>
      <Icon name={icon} size={13} color={color.textSecondary} strokeWidth={2.2} />
      <Text style={styles.chipText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.medium,
  },
  half: {
    flex: 1,
  },
  card: {
    borderRadius: radius.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: overlay.hairline,
    borderTopColor: overlay.hairlineTop,
  },
  locked: {
    opacity: 0.72,
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  wideArt: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
  },
  wideFade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  wideMascot: {
    position: 'absolute',
    right: space[3],
    top: 0,
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halfImage: {
    position: 'absolute',
    top: HALF_ART_TOP,
  },
  /** Centred between the title band and the chip row. */
  halfMascot: {
    position: 'absolute',
    top: HALF_ART_TOP + 8,
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: radius.pill,
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HALF_ART_TOP + HALF_SCRIM_FADE,
  },
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  wideContent: {
    padding: space[4],
  },
  halfContent: {
    paddingHorizontal: space[3],
    paddingTop: space[3],
    paddingBottom: space[3],
  },
  wideTitleBlock: {
    maxWidth: '58%',
  },
  eyebrow: {
    color: color.brandPrimary,
    fontFamily: family.grotesque.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    color: color.textPrimary,
    fontFamily: family.brush.regular,
    textTransform: 'uppercase',
    // Knewave leans right; the slack keeps the last glyph from clipping.
    paddingRight: 4,
    textShadowColor: alpha(color.void, 0.6),
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  wideTitle: {
    fontSize: 30,
    lineHeight: 34,
  },
  halfTitle: {
    fontSize: 21,
    lineHeight: 25,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: overlay.hairline,
    backgroundColor: alpha(color.void, 0.62),
  },
  chipText: {
    color: color.textPrimary,
    fontFamily: family.grotesque.medium,
    fontSize: 12,
    lineHeight: 16,
  },
});
