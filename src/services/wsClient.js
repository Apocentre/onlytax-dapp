import {io} from "socket.io-client";
import {Observable} from 'rxjs';

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

export const streamCollectTransactions = (
  socket,
  token,
  withheldAuthority,
) => {
  if (token && withheldAuthority) {
    console.log("Emitting collect for token and withheldAuthority:", token, withheldAuthority);

    return new Observable((subscriber) => {
      socket.emit("collect", token, withheldAuthority);
      socket.on(withheldAuthority, (tx) => {
        if(!tx.data) {
          subscriber.complete();
          return;
        }

        subscriber.next(tx);
      });
    });
  }

  return () => {
    socket.off("collect", handleNewCollectTx);
  }
}
