import api from './api';

export const createBounty = async (title, description, subjectTag, budget) => {
  const response = await api.post('/api/bounties', {
    title,
    description,
    subject_tag: subjectTag,
    budget: parseFloat(budget),
  });
  return response.data;
};

export const getBounties = async () => {
  const response = await api.get('/api/bounties');
  return response.data;
};

export const getBountyById = async (id) => {
  const response = await api.get(`/api/bounties/${id}`);
  return response.data;
};

export const completeBounty = async (id, rating, comment) => {
  const response = await api.post(`/api/bounties/${id}/complete`, {
    rating: parseInt(rating),
    comment: comment || '',
  });
  return response.data;
};

export const getBidsForBounty = async (id) => {
  const response = await api.get(`/api/bounties/${id}/bids`);
  return response.data;
};
