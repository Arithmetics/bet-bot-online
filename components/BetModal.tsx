import { Modal, Note } from "@geist-ui/react";
import { BetMessage } from "../backend/src/serverTypes";

type BetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  betMessage: BetMessage | null;
};

function BetModal({ isOpen, onClose, betMessage }: BetModalProps): JSX.Element {
  const betTime = new Date(
    betMessage?.messageTimestamp || Date.now()
  ).toLocaleDateString();
  return (
    <Modal visible={isOpen} onClose={onClose}>
      <Modal.Title>New Live Bets</Modal.Title>
      <Modal.Subtitle>{betTime}</Modal.Subtitle>
      <Modal.Content>
        {betMessage?.bets?.map((bet) => {
          return (
            <Note key={JSON.stringify(bet)} label={false}>
              {bet}
            </Note>
          );
        })}
      </Modal.Content>
      <Modal.Action passive onClick={() => onClose()}>
        Close
      </Modal.Action>
    </Modal>
  );
}

export default BetModal;
