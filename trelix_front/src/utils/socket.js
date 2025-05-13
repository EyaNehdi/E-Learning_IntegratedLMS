import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_PROXY, {
  reconnection: true,
});

export default socket;
