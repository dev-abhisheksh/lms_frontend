import { io } from "socket.io-client";

const SOCKET_URL = "https://lms-67ch.onrender.com";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: false,
});

export default socket;