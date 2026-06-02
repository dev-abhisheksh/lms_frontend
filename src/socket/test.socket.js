import socket from "./index";

export const connectTestSocket = (courseIds, { onPublished, onUnpublished, onUpdated, onDeleted }) => {
  socket.connect();

  socket.emit("join-courses", courseIds); // array of all enrolled course ids

  socket.on("test:published", (data) => {
    console.log("New test published:", data);
    if (onPublished) onPublished(data);
  });

  socket.on("test:unpublished", (data) => {
    console.log("Test unpublished:", data);
    if (onUnpublished) onUnpublished(data);
  });

  socket.on("test:updated", (data) => {
    console.log("Test updated:", data);
    if (onUpdated) onUpdated(data);
  });

  socket.on("test:deleted", (data) => {
    console.log("Test deleted:", data);
    if (onDeleted) onDeleted(data);
  });
};

export const disconnectTestSocket = () => {
  socket.off("test:published");
  socket.off("test:unpublished");
  socket.off("test:updated");
  socket.off("test:deleted");
  socket.disconnect();
};

export const connectSubmissionSocket = (courseIds, { onSubmissionReceived }) => {
  socket.connect()
  socket.emit("join-courses", courseIds)
  socket.on("submission:received", (data) => {
    if (onSubmissionReceived) onSubmissionReceived(data)
  })
}

export const disconnectSubmissionSocket = () => {
  socket.off("submission:received");
  socket.disconnect();
};