// Shared enums used across models, controllers and seed data.

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert'];

// The three "core" meals that determine whether a day is fully completed.
export const CORE_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

export const INGREDIENT_STATUS = ['Available', 'Not Available', 'Need More'];

// Ingredient statuses that should surface on the grocery list.
export const NEEDED_STATUSES = ['Not Available', 'Need More'];

export const DURATIONS = ['Daily', 'Weekly', 'Monthly'];

export const GROCERY_STATUS = ['Need More', 'Not Available', 'Purchased', 'Cannot Find'];

// Saturated, high-contrast colours — the category grid doubles as the app's
// colour story, so no muted greys here.
export const DEFAULT_CATEGORIES = [
  { name: 'Vegetarian', color: '#00C48C', icon: 'Spa' },
  { name: 'Vegan', color: '#22D3A6', icon: 'Grass' },
  { name: 'Eggitarian', color: '#FF9F1A', icon: 'EggAlt' },
  { name: 'Kosher', color: '#4C6FFF', icon: 'Synagogue' },
  { name: 'Seafood', color: '#00C2FF', icon: 'SetMeal' },
  { name: 'Mediterranean', color: '#22B8FF', icon: 'Sailing' },
  { name: 'Keto', color: '#B14BFF', icon: 'Egg' },
  { name: 'Paleo', color: '#FF6A3D', icon: 'Forest' },
  { name: 'Gluten Free', color: '#F4C20D', icon: 'NoMeals' },
  { name: 'Dairy Free', color: '#7C4DFF', icon: 'Icecream' },
  { name: 'High Protein', color: '#FF4D6D', icon: 'FitnessCenter' },
  { name: 'Low Carb', color: '#FF2E93', icon: 'Grain' },
  { name: 'Indian', color: '#FF7A00', icon: 'RiceBowl' },
  { name: 'Italian', color: '#7ED321', icon: 'LocalPizza' },
  { name: 'Mexican', color: '#FFB000', icon: 'LunchDining' },
  { name: 'Asian', color: '#FF3B5C', icon: 'RamenDining' },
  { name: 'Custom', color: '#8E9BFF', icon: 'Tune' },
];
