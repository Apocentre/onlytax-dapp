import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Socket, io } from "socket.io-client";

const socketEndpoint = import.meta.env.VITE_WS;
const SocketContext = createContext(undefined);

export const SocketProvider = ({children}) => {
  const [newCollectTx, setNewCollectTx] = useState(null);
  const [socket, setSocket] = useState();

  const handleNewCollectTx = useCallback((msg) => {
    console.log("New Collect Transaction received", msg);
    setNewCollectTx(msg);
  }, []);
  
  const setupSocket = useCallback(() => {
    const newSocket = io(socketEndpoint, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from socket server", reason);
    });

    newSocket.on("reconnect", () => {
      console.log("Reconnected to socket server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.off("collect", handleNewCollectTx);
      newSocket.disconnect();
      console.log("Cleanup");
    };
  }, [handleNewCollectTx]);

  useEffect(() => {
    const cleanup = setupSocket();
    return cleanup;
  }, [setupSocket]);

  const collect = useCallback(
    (token, withheldAuthority) => {
      if (token && withheldAuthority) {
        console.log("Emitting collect for token and withheldAuthority:", token, withheldAuthority);
        newSocket.emit("collect", token, withheldAuthority);
        newSocket.on(withheldAuthority, handleNewCollectTx);
      }
    },
    [],
  );

  return (
    <SocketContext.Provider
      value={{
        collect,
        socket,
        newCollectTx,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};
