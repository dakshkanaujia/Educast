import { useEffect, useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

// Derives a live { bountyId: viewerCount } map from 'bounty_presence_update'
// events already flowing through the socket — no extra subscription needed,
// any screen can read the current count for any bounty it cares about.
export const useBountyPresenceMap = () => {
  const { messages } = useWebSocket();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const next = {};
    for (const msg of messages) {
      if (msg.type === 'bounty_presence_update' && msg.payload) {
        next[msg.payload.bounty_id] = msg.payload.count;
      }
    }
    setCounts(next);
  }, [messages]);

  return counts;
};

export const useBountyPresence = (bountyId) => {
  const counts = useBountyPresenceMap();
  return counts[bountyId] || 0;
};

// Sends a 'viewing' presence ping for a bounty while the calling screen is
// mounted, and automatically signals 'left' on unmount — used by the Place
// Bid screen so students see "N mentors bidding" in real time.
export const useAnnounceBountyPresence = (bountyId, studentId) => {
  const { sendMessage } = useWebSocket();

  useEffect(() => {
    if (!bountyId || !studentId) return;

    sendMessage({
      type: 'bounty_presence',
      target_id: studentId,
      payload: { bounty_id: bountyId, viewing: true },
    });

    return () => {
      sendMessage({
        type: 'bounty_presence',
        target_id: studentId,
        payload: { bounty_id: bountyId, viewing: false },
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bountyId, studentId]);
};
