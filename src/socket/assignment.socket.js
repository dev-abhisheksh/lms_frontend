import socket from "./index";

export const connectAssignmentSocket = (courseIds, { onCreated, onUpdated, onDeleted }) => {
  socket.connect();

  socket.emit("join-courses", courseIds);

  // Listen for newly published assignments
  socket.on("assignment:created", (assignment) => {
    console.log("New Assignment received:", assignment);
    if (onCreated) onCreated(assignment);
  });

  // Listen for toggled (published/unpublished) assignments
  socket.on("assignment:updated", (assignment) => {
    console.log("Assignment updated:", assignment);
    if (onUpdated) onUpdated(assignment);
  });

  // Listen for deleted assignments
  socket.on("assignment:deleted", (data) => {
    console.log("Assignment deleted:", data);
    if (onDeleted) onDeleted(data);
  });
};

export const disconnectAssignmentSocket = () => {
  socket.off("assignment:created");
  socket.off("assignment:updated");
  socket.off("assignment:deleted");
  socket.disconnect();
};