import socket from "./index";

export const connectTestSocket = (courseId, { onPublished }) => {
  socket.connect();

  socket.emit("join-courses", [courseId]);

  socket.on("test:published", (data) => {
    console.log("New test published:", data)
    if (onPublished) onPublished(data)
  })
}

export const disconnectTestSocket = () => {
  socket.off("test:published");
  socket.disconnect();
};