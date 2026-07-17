import * as MuiIcons from '@mui/icons-material';
import RestaurantIcon from '@mui/icons-material/Restaurant';

/**
 * Renders an MUI icon by name (e.g. "Dashboard", "ShoppingCart").
 * Falls back to a Restaurant icon if the name is unknown. Spaces are stripped so
 * "Set Meal" resolves to SetMeal.
 */
export default function Icon({ name, ...props }) {
  const key = (name || '').replace(/\s+/g, '');
  const Cmp = MuiIcons[key] || RestaurantIcon;
  return <Cmp {...props} />;
}
