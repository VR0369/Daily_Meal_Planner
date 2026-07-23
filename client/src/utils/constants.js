export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert'];
export const CORE_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];
export const OPTIONAL_MEAL_TYPES = ['Snacks', 'Dessert'];

export const INGREDIENT_STATUS = ['Available', 'Not Available', 'Need More'];
export const DURATIONS = ['Daily', 'Weekly', 'Monthly'];

export const STATUS_COLOR = {
  Available: 'success',
  'Not Available': 'error',
  'Need More': 'warning',
  Purchased: 'success',
  'Cannot Find': 'default',
};

// Fallback category list used before the API responds.
export const FALLBACK_CATEGORIES = [
  'Vegetarian', 'Vegan', 'Eggitarian', 'Kosher', 'Seafood', 'Mediterranean',
  'Keto', 'Paleo', 'Gluten Free', 'Dairy Free', 'High Protein', 'Low Carb',
  'Indian', 'Italian', 'Mexican', 'Asian', 'Custom',
];

/**
 * Identity of each meal type — colour, gradient, emoji and rough serving hour.
 * Shared by the timeline, planner cards and calendars so a meal looks the same
 * everywhere in the app.
 */
export const MEAL_META = {
  Breakfast: {
    hour: 8, icon: 'FreeBreakfast', emoji: '🍳',
    color: '#FF9F1A', gradient: 'linear-gradient(135deg, #FFC15E 0%, #FF7A00 100%)',
  },
  Lunch: {
    hour: 13, icon: 'LunchDining', emoji: '🥗',
    color: '#00C48C', gradient: 'linear-gradient(135deg, #4BE3B6 0%, #00A87A 100%)',
  },
  Dinner: {
    hour: 20, icon: 'DinnerDining', emoji: '🍝',
    color: '#7C4DFF', gradient: 'linear-gradient(135deg, #A98BFF 0%, #5A21D6 100%)',
  },
  Snacks: {
    hour: 16, icon: 'Cookie', emoji: '🍿',
    color: '#00C2FF', gradient: 'linear-gradient(135deg, #5DDBFF 0%, #0091C4 100%)',
  },
  Dessert: {
    hour: 21, icon: 'Icecream', emoji: '🍨',
    color: '#FF2E93', gradient: 'linear-gradient(135deg, #FF6CB4 0%, #C4006A 100%)',
  },
};

export const FALLBACK_MEAL_META = {
  hour: 12, icon: 'Restaurant', emoji: '🍽️',
  color: '#7C4DFF', gradient: 'linear-gradient(135deg, #A98BFF 0%, #5A21D6 100%)',
};

export const mealMeta = (type) => MEAL_META[type] || FALLBACK_MEAL_META;

export const COMPLETION_LABEL = {
  empty: 'No meals planned',
  partial: 'Some meals planned',
  complete: 'Day complete',
};

// Each destination carries its own hue so the sidebar reads as a colour-coded map.
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'Dashboard', color: '#7C4DFF' },
  { label: 'Daily Planner', path: '/daily', icon: 'Today', color: '#FF9F1A' },
  { label: 'Weekly Planner', path: '/weekly', icon: 'ViewWeek', color: '#00C48C' },
  { label: 'Monthly Planner', path: '/monthly', icon: 'CalendarMonth', color: '#00C2FF' },
  { label: 'Grocery List', path: '/grocery', icon: 'ShoppingCart', color: '#FF2E93' },
  { label: 'Meal Categories', path: '/categories', icon: 'Category', color: '#FF4D6D' },
  { label: 'Settings', path: '/settings', icon: 'Settings', color: '#8E9BFF' },
];
