import {io} from "socket.io-client";

const socketEndpoint = import.meta.env.VITE_WS;

export const connectToWs = (onConnect, onDisconnect) => {
  const socket = io(socketEndpoint, {
    transports: ["websocket"],
    withCredentials: true,
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log("Connected to socket server");
    onConnect(socket);
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected from socket server", reason);
    onDisconnect(reason);
  });

  socket.on("reconnect", () => {
    console.log("Reconnected to socket server");
    onConnect(socket);
  });
}

export const streamCollectTransactions = (socket, token, withheldAuthority, handleNewCollectTx) => {
  if (token && withheldAuthority) {
    console.log("Emitting collect for token and withheldAuthority:", token, withheldAuthority);
    socket.emit("collect", token, withheldAuthority);
    socket.on(withheldAuthority, handleNewCollectTx);
  }

  return () => {
    socket.off("collect", handleNewCollectTx);
  }
}
