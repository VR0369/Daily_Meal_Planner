// Shared enums used across models, controllers and seed data.

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert'];

// The three "core" meals that determine whether a day is fully completed.
export const CORE_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

export const INGREDIENT_STATUS = ['Available', 'Not Available', 'Need More'];

// Ingredient statuses that should surface on the grocery list.
export const NEEDED_STATUSES = ['Not Available', 'Need More'];

export const DURATIONS = ['Daily', 'Weekly', 'Monthly'];

export const GROCERY_STATUS = ['Need More', 'Not Available', 'Purchased', 'Cannot Find'];

export const DEFAULT_CATEGORIES = [
  { name: 'Vegetarian', color: '#66bb6a', icon: 'Spa' },
  { name: 'Vegan', color: '#43a047', icon: 'Grass' },
  { name: 'Eggitarian', color: '#ffa726', icon: 'EggAlt' },
  { name: 'Kosher', color: '#5c6bc0', icon: 'Synagogue' },
  { name: 'Seafood', color: '#26c6da', icon: 'SetMeal' },
  { name: 'Mediterranean', color: '#29b6f6', icon: 'Sailing' },
  { name: 'Keto', color: '#ab47bc', icon: 'Egg' },
  { name: 'Paleo', color: '#8d6e63', icon: 'Forest' },
  { name: 'Gluten Free', color: '#d4a017', icon: 'NoMeals' },
  { name: 'Dairy Free', color: '#78909c', icon: 'Icecream' },
  { name: 'High Protein', color: '#ef5350', icon: 'FitnessCenter' },
  { name: 'Low Carb', color: '#ec407a', icon: 'Grain' },
  { name: 'Indian', color: '#ff7043', icon: 'RiceBowl' },
  { name: 'Italian', color: '#9ccc65', icon: 'LocalPizza' },
  { name: 'Mexican', color: '#ffa000', icon: 'LunchDining' },
  { name: 'Asian', color: '#ff5252', icon: 'RamenDining' },
  { name: 'Custom', color: '#90a4ae', icon: 'Tune' },
];
