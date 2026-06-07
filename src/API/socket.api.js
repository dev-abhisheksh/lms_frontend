// src/API/socket.api.js
import { io } from "socket.io-client";

// Get socket URL from environment or default to localhost
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  // ─── Initialize socket connection ──────────────────────────────────
  connect(token) {
    // Prevent multiple connections
    if (this.socket?.connected) {
      console.log("⚠️ Socket already connected");
      return;
    }

    console.log("🔌 Connecting to socket server...");

    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ["websocket", "polling"]
    });

    // ─── Connection successful ────────────────────────────────────────
    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("✅ Connected to server");
    });

    // ─── Disconnected ──────────────────────────────────────────────────
    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      console.log("❌ Disconnected from server:", reason);
    });

    // ─── Connection errors ────────────────────────────────────────────
    this.socket.on("connect_error", (error) => {
      console.error("⚠️ Connection error:", error);
    });
  }

  // ─── Join a course room ────────────────────────────────────────────
  joinCourse(courseId, userId) {
    if (!this.socket) {
      console.warn("⚠️ Socket not connected");
      return;
    }

    this.socket.emit("joinCourse", { courseId, userId });
    console.log(`📌 Joining course: ${courseId}`);
  }

  // ─── Join multiple courses ────────────────────────────────────────
  joinCourses(courseIds) {
    if (!this.socket || !Array.isArray(courseIds)) return;
    
    this.socket.emit("join-courses", courseIds);
    console.log(`📌 Joining ${courseIds.length} courses`);
  }

  // ─── Join personal room for direct notifications ──────────────────
  joinPersonal(userId) {
    if (!this.socket || !userId) return;
    
    this.socket.emit("join-personal", userId);
    console.log(`👤 Joining personal room: user-${userId}`);
  }

  // ─── Leave a course room ──────────────────────────────────────────
  leaveCourse(courseId, userId) {
    if (!this.socket) return;

    this.socket.emit("leaveCourse", { courseId, userId });
    console.log(`🚪 Leaving course: ${courseId}`);
  }

  // ─── Listen to events ──────────────────────────────────────────────
  on(event, callback) {
    if (!this.socket) {
      console.warn("⚠️ Socket not connected");
      return;
    }

    // Store listener for later cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    this.socket.on(event, callback);
    console.log(`📡 Listening to event: ${event}`);
  }

  // ─── Remove specific listener ──────────────────────────────────────
  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  // ─── Remove all listeners for an event ────────────────────────────
  removeAllListeners(event) {
    if (!this.socket) return;
    this.socket.removeAllListeners(event);
    this.listeners.delete(event);
  }

  // ─── Emit event to server ──────────────────────────────────────────
  emit(event, data) {
    if (!this.socket) {
      console.warn("⚠️ Socket not connected");
      return;
    }
    this.socket.emit(event, data);
  }

  // ─── Heartbeat / Keep-alive ────────────────────────────────────────
  ping() {
    if (!this.socket) return;
    this.socket.emit("ping");
  }

  // ─── Disconnect and cleanup ────────────────────────────────────────
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log("🔌 Socket disconnected");
    }
  }

  // ─── Get connection status ──────────────────────────────────────────
  getStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
