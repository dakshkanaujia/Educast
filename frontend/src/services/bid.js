import api from './api';

export const createBid = async (bountyId, priceOffer, note, durationMinutes, preferredTime) => {
  const response = await api.post(`/api/bounties/${bountyId}/bids`, {
    price_offer: parseFloat(priceOffer),
    note,
    duration_minutes: durationMinutes ?? null,
    preferred_time: preferredTime || '',
  });
  return response.data;
};

export const acceptBid = async (bidId) => {
  const response = await api.post(`/api/bids/${bidId}/accept`);
  return response.data;
};

export const getMyBids = async () => {
  const response = await api.get('/api/my-bids');
  return response.data;
};

export const counterBid = async (bidId, price, note) => {
  const response = await api.post(`/api/bids/${bidId}/counter`, {
    price: parseFloat(price),
    note: note || '',
  });
  return response.data;
};

export const acceptCounter = async (bidId) => {
  const response = await api.post(`/api/bids/${bidId}/counter/accept`);
  return response.data;
};

export const declineCounter = async (bidId) => {
  const response = await api.post(`/api/bids/${bidId}/counter/decline`);
  return response.data;
};

export const getPriceInsight = async (subject) => {
  const response = await api.get('/api/price-insight', { params: { subject } });
  return response.data;
};
