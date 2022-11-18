import {Modal, Note} from '@geist-ui/react';
import { BetMessage } from '../backend/src/serverTypes';

type BetModalProps = {
    isOpen: boolean;
    onClose: () => void;
    betMessages: BetMessage[];
}

function BetModal({isOpen, onClose, betMessages}: BetModalProps): JSX.Element {

    return (<Modal visible={isOpen} onClose={onClose}>
        <Modal.Title>New Live Bets</Modal.Title>
        <Modal.Content>
          {betMessages.map((message) => {
            return <Note key={message.messageTimestamp}>{JSON.stringify(message.bet)}</Note>
          })}
        </Modal.Content>
        <Modal.Action passive onClick={() => onClose()}>Close</Modal.Action>
        {/* <Modal.Action>Submit</Modal.Action> */}
      </Modal>)
}

export default BetModal;