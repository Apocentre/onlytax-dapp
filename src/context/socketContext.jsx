import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import { Socket, io } from "socket.io-client";

const socketEndpoint = import.meta.env.VITE_WS;
const SocketContext = createContext(undefined);

export const SocketProvider= ({children}) => {
  const [token, setToken] = useState(null);
  const [withheldAuthority, setWithheldAuthority] = useState(null);
  const [newCollectTx, setNewCollectTx] = useSyncExternalStore(null);
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
      if (token && withheldAuthority) {
        console.log("Emitting collect for token and withheldAuthority:", token, withheldAuthority);
        newSocket.emit("collect", tokenId, withheldAuthority);
        newSocket.on(withheldAuthority, handleNewCollectTx);
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from socket server", reason);
    });

    newSocket.on("reconnect", () => {
      console.log("Reconnected to socket server");

      if (tokenId) {
        console.log("Re-emitting collect for token and withheldAuthority:", token, withheldAuthority);
        newSocket.emit("collect", tokenId);
        newSocket.on(withheldAuthority, handleNewCollectTx);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.off("collect", handleNewToken);
      newSocket.disconnect();
      console.log("Cleanup");
    };
  }, [token, withheldAuthority, handleNewCollectTx]);

  useEffect(() => {
    const cleanup = setupSocket();
    return cleanup;
  }, [setupSocket]);

  const updateToken = useCallback((t) => {
    setToken(t);
  }, []);

  const updateWithheldAuthority = useCallback((authority) => {
    setWithheldAuthority(authority);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        updateToken,
        updateWithheldAuthority,
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
