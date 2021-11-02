import React, { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {useToasts} from '@geist-ui/react';

type XMessage = {
  data: string;
};

export const WSTest = () => {
  const [_, setToast] = useToasts();

  const [messageHistory, setMessageHistory] = useState<XMessage[]>([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    "ws://localhost:8999"
  );

  useEffect(() => {
    if (lastMessage !== null) {
      if (typeof lastMessage === "string") {
        setMessageHistory((prev) => prev.concat(lastMessage));
      }
    }
  }, [lastMessage, setMessageHistory]);

  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
      setToast({
        text: 'Lost connection with server. Refresh and try again.',
        type: 'error',
      })
    }
  }, [readyState])

  const handleClickSendMessage = () => sendMessage(`${Date.now()}`);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  console.log(readyState, connectionStatus)

  return (
    <div>

      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
      <ul>
        {messageHistory.map((message, idx) => (
          <span key={idx}>{message ? message.data : null}</span>
        ))}
      </ul>
    </div>
  );
};
