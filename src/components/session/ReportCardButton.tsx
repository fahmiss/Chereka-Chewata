import { useState } from 'react';
import type { GameId } from '../../domain/games';
import { reportCard } from '../../storage/contentHistory';
import { color } from '../../theme/tokens';
import { Dialog } from '../ui/Dialog';
import { SecondaryButton } from '../ui/SecondaryButton';

export function ReportCardButton({
  game,
  cardId,
  onReported,
}: {
  game: GameId;
  cardId: string;
  onReported?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SecondaryButton quiet label="Report card" icon="alert" onPress={() => setOpen(true)} />
      <Dialog
        visible={open}
        icon="alert"
        accent={color.dangerUrgency}
        title="Hide this card?"
        message="It won’t appear again on this device. You can reset hidden cards in Settings."
        confirmLabel="Report and hide"
        confirmTone="danger"
        onConfirm={() => {
          reportCard(game, cardId);
          setOpen(false);
          onReported?.();
        }}
        cancelLabel="Cancel"
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
