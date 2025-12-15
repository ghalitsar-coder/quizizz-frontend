"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  reconnecting: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  reconnecting: false,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

    const socketInstance = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    // Connection events
    socketInstance.on("connect", () => {
      console.log("Connected to socket server with ID:", socketInstance.id);
      setIsConnected(true);
      setReconnecting(false);
      toast.success("Terhubung ke server");
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Disconnected from socket server:", reason);
      setIsConnected(false);
      toast.error("Koneksi terputus");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setReconnecting(true);
      toast.error("Mencoba menghubungkan kembali...");
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      setReconnecting(false);
      toast.success("Berhasil terhubung kembali");
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("Reconnection failed");
      setReconnecting(false);
      toast.error("Gagal menghubungkan ke server");
    });

    // Error handling from server
    socketInstance.on("error_message", (data: { msg: string }) => {
      toast.error(data.msg);
    });

    // Set socket in a separate tick to avoid cascading renders
    Promise.resolve().then(() => {
      setSocket(socketInstance);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, reconnecting }}>
      {children}
    </SocketContext.Provider>
  );
};
