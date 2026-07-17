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

export const COMPLETION_LABEL = {
  empty: 'No meals planned',
  partial: 'Some meals planned',
  complete: 'Day complete',
};

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'Dashboard' },
  { label: 'Daily Planner', path: '/daily', icon: 'Today' },
  { label: 'Weekly Planner', path: '/weekly', icon: 'ViewWeek' },
  { label: 'Monthly Planner', path: '/monthly', icon: 'CalendarMonth' },
  { label: 'Grocery List', path: '/grocery', icon: 'ShoppingCart' },
  { label: 'Meal Categories', path: '/categories', icon: 'Category' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
];
