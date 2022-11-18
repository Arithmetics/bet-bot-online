import { Modal, Note } from "@geist-ui/react";
import { BetMessage } from "../backend/src/serverTypes";

type BetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  betMessage: BetMessage | null;
};

function BetModal({ isOpen, onClose, betMessage }: BetModalProps): JSX.Element {
  return (
    <Modal visible={isOpen} onClose={onClose}>
      <Modal.Title>New Live Bets</Modal.Title>
      <Modal.Subtitle>{betMessage?.messageTimestamp}</Modal.Subtitle>
      <Modal.Content>
        {betMessage?.bets?.map((bet) => {
          return <Note key={JSON.stringify(bet)}>{bet}</Note>;
        })}
      </Modal.Content>
      <Modal.Action passive onClick={() => onClose()}>
        Close
      </Modal.Action>
    </Modal>
  );
}

export default BetModal;
