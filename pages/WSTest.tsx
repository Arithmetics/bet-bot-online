import React, { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

type XMessage = {
  data: string;
};

export const WSTest = () => {
  //Public API that will echo messages sent to it back to the client
  const [messageHistory, setMessageHistory] = useState<XMessage[]>([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    "ws://localhost:8999"
  );

  useEffect(() => {
    console.log(lastMessage);
    if (lastMessage !== null) {
      if (typeof lastMessage === "string") {
        setMessageHistory((prev) => prev.concat(lastMessage));
      }
    }
  }, [lastMessage, setMessageHistory]);

  const handleClickSendMessage = () => sendMessage(`${Date.now()}`);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <div>
      <button
        onClick={handleClickSendMessage}
        disabled={readyState !== ReadyState.OPEN}
      >
        Click Me to send Hello
      </button>
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
