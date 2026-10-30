import { Animated, StyleSheet, Text, View } from 'react-native';
import type { TeamId } from '../../domain/shared/types';
import { teamLabel } from '../../domain/shared/utils';
import { useEnterAnimation } from '../../theme/motion';
import { alpha, color, overlay, radius, space } from '../../theme/tokens';
import { family, type } from '../../theme/typography';

/**
 * Team A vs Team B, with the team on turn lit in the game accent. Pass
 * `members` to list who is on each side under the score.
 */
export function TeamScoreStrip({
  scores,
  activeTeam,
  accent,
  members,
  highlightName,
}: {
  scores: Record<TeamId, number>;
  activeTeam: TeamId | null;
  accent: string;
  members?: Record<TeamId, string[]>;
  /** A name to light up inside the member list (e.g. the current psychic). */
  highlightName?: string;
}) {
  return (
    <View style={styles.strip}>
      <TeamPill
        team="a"
        score={scores.a}
        active={activeTeam === 'a'}
        accent={accent}
        members={members?.a}
        highlightName={highlightName}
      />
      <Text style={[type.mono, styles.vs]}>vs</Text>
      <TeamPill
        team="b"
        score={scores.b}
        active={activeTeam === 'b'}
        accent={accent}
        members={members?.b}
        highlightName={highlightName}
      />
    </View>
  );
}

function TeamPill({
  team,
  score,
  active,
  accent,
  members,
  highlightName,
}: {
  team: TeamId;
  score: number;
  active: boolean;
  accent: string;
  members?: string[];
  highlightName?: string;
}) {
  return (
    <View
      style={[
        styles.pill,
        active && { borderColor: alpha(accent, 0.55), backgroundColor: alpha(accent, 0.16) },
      ]}
    >
      <Text style={[type.eyebrow, { color: active ? accent : color.textMuted }]}>
        {teamLabel(team)}
      </Text>
      <Text style={[type.displayMd, { color: active ? accent : color.textPrimary }]}>{score}</Text>
      {members?.length ? (
        <Text style={[type.bodySm, styles.pillMembers]} numberOfLines={3}>
          {members.map((name, index) => (
            <Text
              key={`${name}-${index}`}
              style={
                active && name === highlightName
                  ? { color: accent, fontFamily: family.body.bold }
                  : null
              }
            >
              {index > 0 ? ', ' : ''}
              {name}
            </Text>
          ))}
        </Text>
      ) : null}
    </View>
  );
}

export type StandingRow = { id: string; name: string; score: number };

/** Ranked list; ties share a rank. */
export function Standings({ rows, accent }: { rows: StandingRow[]; accent: string }) {
  const top = rows[0]?.score ?? 0;
  return (
    <View style={styles.standings}>
      {rows.map((row, index) => {
        const rank = rows.findIndex((other) => other.score === row.score) + 1;
        return (
          <StandingLine
            key={row.id}
            index={index}
            rank={rank}
            name={row.name}
            score={row.score}
            leader={row.score === top && top > 0}
            accent={accent}
          />
        );
      })}
    </View>
  );
}

function StandingLine({
  index,
  rank,
  name,
  score,
  leader,
  accent,
}: {
  index: number;
  rank: number;
  name: string;
  score: number;
  leader: boolean;
  accent: string;
}) {
  const enter = useEnterAnimation(index);
  return (
    <Animated.View
      style={[
        styles.line,
        enter,
        leader && { borderColor: alpha(accent, 0.5), backgroundColor: alpha(accent, 0.1) },
      ]}
    >
      <Text style={[type.numeric, { color: leader ? accent : color.textMuted }]}>
        {String(rank).padStart(2, '0')}
      </Text>
      <Text style={[type.titleMd, styles.lineName]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[type.displayMd, { color: leader ? accent : color.textPrimary }]}>{score}</Text>
    </Animated.View>
  );
}

/** Players sharing the top score, or none when nobody scored. */
export function leaders(rows: StandingRow[]): StandingRow[] {
  const top = rows.reduce((max, row) => Math.max(max, row.score), 0);
  if (top <= 0) return [];
  return rows.filter((row) => row.score === top);
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    // Stretch so both pills match height when their member lists differ.
    alignItems: 'stretch',
    gap: space[3],
  },
  vs: {
    alignSelf: 'center',
    color: color.textMuted,
  },
  pill: {
    flex: 1,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: overlay.glass,
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    gap: 2,
  },
  pillMembers: {
    color: color.textSecondary,
    marginTop: space[1],
  },
  standings: {
    gap: space[2],
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    backgroundColor: overlay.glass,
  },
  lineName: {
    color: color.textPrimary,
    flex: 1,
  },
});
