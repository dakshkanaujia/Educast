import api from './api';

export const createBid = async (bountyId, priceOffer, note) => {
  const response = await api.post(`/api/bounties/${bountyId}/bids`, {
    price_offer: parseFloat(priceOffer),
    note,
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
