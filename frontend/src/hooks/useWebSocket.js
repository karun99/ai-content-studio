import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function useWebSocket(url, events = []) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState({});

  useEffect(() => {
    const socketInstance = io(url || import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => setIsConnected(true));
    socketInstance.on('disconnect', () => setIsConnected(false));

    events.forEach((event) => {
      socketInstance.on(event, (payload) => {
        setData((prev) => ({ ...prev, [event]: payload }));
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  return { socket, isConnected, data };
}
