import client from './client.js';

// --- Meal plans ---
export const getActiveDay = () => client.get('/mealplans/active');
export const getPlanByDate = (date) => client.get('/mealplans', { params: { date } });
export const getWeek = (date, weekStartsOn) =>
  client.get('/mealplans/week', { params: { date, weekStartsOn } });
export const getMonth = (date) => client.get('/mealplans/month', { params: { date } });
export const getRange = (start, end) => client.get('/mealplans/range', { params: { start, end } });
export const createPlan = (payload) => client.post('/mealplans', payload);
export const upsertPlan = (payload) => client.put('/mealplans', payload);
export const upsertMeal = (planId, meal) => client.put(`/mealplans/${planId}/meal`, meal);
export const deletePlan = (planId) => client.delete(`/mealplans/${planId}`);
export const copyDay = (from, to, mode = 'copy') => client.post('/mealplans/copy', { from, to, mode });
export const copyWeek = (fromWeekOf, toWeekOf, weekStartsOn) =>
  client.post('/mealplans/copy-week', { fromWeekOf, toWeekOf, weekStartsOn });

// --- Categories ---
export const getCategories = () => client.get('/categories');
export const createCategory = (payload) => client.post('/categories', payload);
export const deleteCategory = (id) => client.delete(`/categories/${id}`);

// --- Grocery ---
export const getGrocery = () => client.get('/grocery');
export const refreshGrocery = () => client.post('/grocery/refresh');
export const markPurchased = (id) => client.post(`/grocery/${id}/purchased`);
export const markCannotFind = (id, replacement) =>
  client.post(`/grocery/${id}/cannot-find`, { replacement });
export const updateGrocery = (id, payload) => client.patch(`/grocery/${id}`, payload);

// --- Dashboard / search ---
export const getStats = () => client.get('/dashboard/stats');
export const search = (q) => client.get('/search', { params: { q } });

// --- Suggestions ---
export const getSuggestions = (category, mealTypes, seed) =>
  client.post('/suggestions', { category, mealTypes, seed });

// --- Settings ---
export const getSettings = () => client.get('/settings');
export const updateSettings = (payload) => client.put('/settings', payload);

// --- Auth ---
export const register = (payload) => client.post('/auth/register', payload);
export const login = (payload) => client.post('/auth/login', payload);
