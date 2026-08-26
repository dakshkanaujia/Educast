import { useEffect, useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

// Tracks the most recent 'platform_activity' broadcast — a real, live count
// of who's currently connected, not a vanity number.
export const usePlatformActivity = () => {
  const { messages } = useWebSocket();
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === 'platform_activity') {
        setActivity(messages[i].payload);
        return;
      }
    }
  }, [messages]);

  return activity;
};
