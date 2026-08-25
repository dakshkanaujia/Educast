import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useAuth } from './AuthContext';
import { WS_BASE_URL } from '../services/config';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token]);

  const connect = () => {
    try {
      const wsUrl = `${WS_BASE_URL}/ws?token=${token}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message:', message);
          setMessages((prev) => [...prev, message]);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);

        // Attempt to reconnect after 3 seconds
        if (isAuthenticated) {
          reconnectTimeout.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setConnected(false);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        messages,
        clearMessages,
        sendMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};
