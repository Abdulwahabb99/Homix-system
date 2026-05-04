import type { Server } from "socket.io";

declare global {
  // Legacy services still emit through a global socket instance.
  // Keep this typed until the notification side effects are fully migrated.
  // eslint-disable-next-line no-var
  var socketIO: Server;
}

export {};
