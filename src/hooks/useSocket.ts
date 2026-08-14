import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_API_URL;

export default function useSocket(userId, onNotification, onNavigationCountsChanged) {
  const socketRef = useRef(null);
  const handlerRef = useRef(onNotification);
  const navigationCountsHandlerRef = useRef(onNavigationCountsChanged);

  // Keep the latest callback in a ref so the socket always invokes the
  // current closure (e.g. up-to-date isUserInteracted) without forcing a
  // reconnect on every render.
  useEffect(() => {
    handlerRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    navigationCountsHandlerRef.current = onNavigationCountsChanged;
  }, [onNavigationCountsChanged]);

  useEffect(() => {
    if (!userId) return undefined;

    const socket = io(SOCKET_URL, {
      auth: {
        token: JSON.parse(localStorage.getItem("user"))?.token,
      },
    });

    // Re-subscribe on every (re)connection so notifications keep flowing
    // after a network drop, not just on the first connect.
    const subscribe = () => {
      socket.emit("subscribe", { userId });
      // A reconnect may have missed mutations while the socket was offline.
      navigationCountsHandlerRef.current?.();
    };
    socket.on("connect", subscribe);

    socket.on("notification", (data) => handlerRef.current?.(data));
    socket.on("navigationCountsChanged", () => navigationCountsHandlerRef.current?.());

    socketRef.current = socket;

    return () => {
      socket.off("connect", subscribe);
      socket.off("navigationCountsChanged");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  return socketRef.current;
}
