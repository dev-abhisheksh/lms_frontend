import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: false,
});

export default socket;