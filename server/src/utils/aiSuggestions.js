/**
 * Lightweight, offline meal-suggestion engine.
 *
 * This provides the "AI Meal Suggestions" feature without an external API key:
 * each category has a curated pool of dishes per meal type, each with a starter
 * ingredient list. Suggestions are picked pseudo-randomly (seeded) so
 * "Regenerate" returns fresh combinations. The interface is intentionally simple
 * so it can later be swapped for a real LLM call (see generateSuggestions).
 */

const ING = (name, quantity = '') => ({ name, quantity, status: 'Need More' });

const POOL = {
  Vegetarian: {
    Breakfast: [
      { mealName: 'Vegetable Upma', ingredients: [ING('Semolina', '1 cup'), ING('Onion', '1'), ING('Carrot', '1'), ING('Green peas', '1/2 cup')] },
      { mealName: 'Paneer Paratha', ingredients: [ING('Whole wheat flour', '2 cups'), ING('Paneer', '150g'), ING('Coriander'), ING('Green chili', '2')] },
      { mealName: 'Masala Oats', ingredients: [ING('Rolled oats', '1 cup'), ING('Mixed vegetables', '1 cup'), ING('Turmeric')] },
    ],
    Lunch: [
      { mealName: 'Paneer Curry', ingredients: [ING('Paneer', '250g'), ING('Tomato', '3'), ING('Onion', '2'), ING('Cream', '1/4 cup')] },
      { mealName: 'Rajma Chawal', ingredients: [ING('Kidney beans', '1 cup'), ING('Rice', '2 cups'), ING('Tomato', '2')] },
      { mealName: 'Vegetable Pulao', ingredients: [ING('Basmati rice', '2 cups'), ING('Mixed vegetables', '2 cups'), ING('Whole spices')] },
    ],
    Dinner: [
      { mealName: 'Vegetable Biryani', ingredients: [ING('Basmati rice', '2 cups'), ING('Mixed vegetables', '2 cups'), ING('Yogurt', '1 cup'), ING('Biryani masala')] },
      { mealName: 'Palak Paneer', ingredients: [ING('Spinach', '400g'), ING('Paneer', '200g'), ING('Garlic', '4 cloves')] },
      { mealName: 'Dal Tadka & Roti', ingredients: [ING('Toor dal', '1 cup'), ING('Wheat flour', '2 cups'), ING('Cumin')] },
    ],
  },
  Vegan: {
    Breakfast: [
      { mealName: 'Tofu Scramble', ingredients: [ING('Firm tofu', '250g'), ING('Turmeric'), ING('Spinach', '1 cup'), ING('Nutritional yeast')] },
      { mealName: 'Overnight Oats', ingredients: [ING('Rolled oats', '1 cup'), ING('Almond milk', '1 cup'), ING('Chia seeds'), ING('Banana', '1')] },
    ],
    Lunch: [
      { mealName: 'Chickpea Buddha Bowl', ingredients: [ING('Chickpeas', '1 can'), ING('Quinoa', '1 cup'), ING('Avocado', '1'), ING('Kale', '2 cups')] },
      { mealName: 'Lentil Soup', ingredients: [ING('Red lentils', '1 cup'), ING('Carrot', '2'), ING('Celery', '2 stalks')] },
    ],
    Dinner: [
      { mealName: 'Vegan Stir Fry', ingredients: [ING('Tofu', '250g'), ING('Broccoli', '1 head'), ING('Bell pepper', '2'), ING('Soy sauce')] },
      { mealName: 'Chana Masala', ingredients: [ING('Chickpeas', '2 cups'), ING('Tomato', '3'), ING('Onion', '2')] },
    ],
  },
  Eggitarian: {
    Breakfast: [
      { mealName: 'Vegetable Omelette', ingredients: [ING('Eggs', '3'), ING('Onion', '1'), ING('Tomato', '1'), ING('Bell pepper', '1')] },
      { mealName: 'Egg Bhurji', ingredients: [ING('Eggs', '4'), ING('Onion', '2'), ING('Green chili', '2')] },
    ],
    Lunch: [
      { mealName: 'Egg Curry', ingredients: [ING('Boiled eggs', '4'), ING('Onion', '2'), ING('Tomato', '2'), ING('Coconut milk', '1 cup')] },
    ],
    Dinner: [
      { mealName: 'Egg Fried Rice', ingredients: [ING('Rice', '2 cups'), ING('Eggs', '3'), ING('Spring onion'), ING('Soy sauce')] },
    ],
  },
  Seafood: {
    Breakfast: [{ mealName: 'Smoked Salmon Toast', ingredients: [ING('Smoked salmon', '100g'), ING('Sourdough bread', '2 slices'), ING('Cream cheese')] }],
    Lunch: [{ mealName: 'Grilled Shrimp Salad', ingredients: [ING('Shrimp', '300g'), ING('Mixed greens', '4 cups'), ING('Lemon', '1')] }],
    Dinner: [{ mealName: 'Baked Salmon', ingredients: [ING('Salmon fillet', '2'), ING('Asparagus', '1 bunch'), ING('Garlic butter')] }],
  },
  Keto: {
    Breakfast: [{ mealName: 'Avocado & Eggs', ingredients: [ING('Avocado', '2'), ING('Eggs', '3'), ING('Butter')] }],
    Lunch: [{ mealName: 'Chicken Caesar (no croutons)', ingredients: [ING('Chicken breast', '300g'), ING('Romaine', '2 heads'), ING('Parmesan')] }],
    Dinner: [{ mealName: 'Zucchini Noodles & Meatballs', ingredients: [ING('Zucchini', '3'), ING('Ground beef', '400g'), ING('Marinara (no sugar)')] }],
  },
  Indian: {
    Breakfast: [{ mealName: 'Masala Dosa', ingredients: [ING('Dosa batter', '2 cups'), ING('Potato', '3'), ING('Onion', '2')] }],
    Lunch: [{ mealName: 'Chole Bhature', ingredients: [ING('Chickpeas', '2 cups'), ING('Flour', '2 cups'), ING('Onion', '2')] }],
    Dinner: [{ mealName: 'Butter Chicken', ingredients: [ING('Chicken', '500g'), ING('Tomato', '4'), ING('Cream', '1 cup'), ING('Butter')] }],
  },
  Italian: {
    Breakfast: [{ mealName: 'Frittata', ingredients: [ING('Eggs', '5'), ING('Zucchini', '1'), ING('Parmesan')] }],
    Lunch: [{ mealName: 'Caprese Panini', ingredients: [ING('Ciabatta', '2'), ING('Mozzarella', '150g'), ING('Tomato', '2'), ING('Basil')] }],
    Dinner: [{ mealName: 'Spaghetti Aglio e Olio', ingredients: [ING('Spaghetti', '400g'), ING('Garlic', '6 cloves'), ING('Olive oil'), ING('Chili flakes')] }],
  },
  Mexican: {
    Breakfast: [{ mealName: 'Breakfast Burrito', ingredients: [ING('Tortilla', '3'), ING('Eggs', '4'), ING('Black beans', '1 cup'), ING('Cheese')] }],
    Lunch: [{ mealName: 'Chicken Tacos', ingredients: [ING('Chicken', '400g'), ING('Corn tortilla', '8'), ING('Salsa'), ING('Avocado', '1')] }],
    Dinner: [{ mealName: 'Veggie Enchiladas', ingredients: [ING('Tortilla', '6'), ING('Beans', '2 cups'), ING('Enchilada sauce'), ING('Cheese')] }],
  },
  Asian: {
    Breakfast: [{ mealName: 'Congee', ingredients: [ING('Rice', '1 cup'), ING('Ginger'), ING('Spring onion')] }],
    Lunch: [{ mealName: 'Pad Thai', ingredients: [ING('Rice noodles', '250g'), ING('Tofu', '200g'), ING('Peanuts'), ING('Bean sprouts')] }],
    Dinner: [{ mealName: 'Vegetable Ramen', ingredients: [ING('Ramen noodles', '2'), ING('Miso paste'), ING('Bok choy', '2'), ING('Mushroom', '1 cup')] }],
  },
};

// Generic fallback used for categories without a curated pool.
const GENERIC = {
  Breakfast: [{ mealName: 'Seasonal Fruit Bowl', ingredients: [ING('Mixed fruit', '3 cups'), ING('Yogurt', '1 cup'), ING('Granola')] }],
  Lunch: [{ mealName: 'Garden Salad Bowl', ingredients: [ING('Mixed greens', '4 cups'), ING('Cucumber', '1'), ING('Cherry tomato', '1 cup')] }],
  Dinner: [{ mealName: 'Grilled Veg Platter', ingredients: [ING('Bell pepper', '2'), ING('Zucchini', '2'), ING('Eggplant', '1')] }],
};

function pick(arr, seed) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.abs(seed) % arr.length];
}

/**
 * Generate a suggestion set for a category.
 * @param {string} category
 * @param {string[]} mealTypes  which meals to suggest (default core 3)
 * @param {number} seed         change to regenerate
 */
export function generateSuggestions(category, mealTypes = ['Breakfast', 'Lunch', 'Dinner'], seed = Date.now()) {
  const pool = POOL[category] || {};
  return mealTypes.map((type, i) => {
    const options = pool[type] || GENERIC[type] || [];
    const chosen = pick(options, seed + i * 7) || { mealName: '', ingredients: [] };
    return {
      mealType: type,
      mealName: chosen.mealName,
      // Deep clone so callers can freely mutate.
      ingredients: chosen.ingredients.map((ing) => ({ ...ing })),
    };
  });
}
