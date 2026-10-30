import { PrimaryButton } from '../ui/PrimaryButton';
import { PassPhoneCard } from './PassPhoneCard';
import { SessionShell } from './SessionShell';

type Props = {
  name: string;
  index: number;
  total: number;
  accent: string;
  eyebrow: string;
  stage?: string;
  stages?: readonly string[];
  note?: string;
  readyLabel?: string;
  onReady: () => void;
  onEndGame?: () => void;
};

/** Shared pass-the-phone identity screen — no secrets. */
export function PassPhoneHandoff({
  name,
  index,
  total,
  accent,
  eyebrow,
  stage = 'reveal',
  stages,
  note,
  readyLabel = "I'm ready",
  onReady,
  onEndGame,
}: Props) {
  return (
    <SessionShell
      eyebrow={eyebrow}
      stage={stage}
      stages={stages}
      accent={accent}
      onEndGame={onEndGame}
      footer={<PrimaryButton label={readyLabel} icon="checkCircle" onPress={onReady} />}
    >
      <PassPhoneCard name={name} index={index} total={total} accent={accent} note={note} />
    </SessionShell>
  );
}
