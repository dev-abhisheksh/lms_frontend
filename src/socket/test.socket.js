import socket from "./index";

export const connectTestSocket = (courseIds, { onPublished }) => {
  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("join-courses", courseIds);

  // Listen for newly published tests
  socket.on("test:published", (data) => {
    console.log("New Test published:", data);
    if (onPublished) onPublished(data);
  });
};

export const disconnectTestSocket = () => {
  socket.off("test:published");
};