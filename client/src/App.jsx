import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DailyPlanner from './pages/DailyPlanner.jsx';
import WeeklyPlanner from './pages/WeeklyPlanner.jsx';
import MonthlyPlanner from './pages/MonthlyPlanner.jsx';
import GroceryList from './pages/GroceryList.jsx';
import Categories from './pages/Categories.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/daily" element={<DailyPlanner />} />
        <Route path="/weekly" element={<WeeklyPlanner />} />
        <Route path="/monthly" element={<MonthlyPlanner />} />
        <Route path="/grocery" element={<GroceryList />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
