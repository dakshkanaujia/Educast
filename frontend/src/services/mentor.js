import api from './api';

export const getMentors = async (search, subject) => {
  const response = await api.get('/api/mentors', { params: { search: search || undefined, subject: subject || undefined } });
  return response.data;
};

export const getMentorProfile = async (mentorId) => {
  const response = await api.get(`/api/mentors/${mentorId}`);
  return response.data;
};
