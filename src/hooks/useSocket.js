import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://homix.host/";

export default function useSocket(userId, onNotification) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      auth: {
        token: JSON.parse(localStorage.getItem("user"))?.token,
      },
    });

    socket.emit("subscribe", { userId });

    socket.on("notifications", onNotification);

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [userId, onNotification]);

  return socketRef.current;
}
