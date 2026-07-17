import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '../api/endpoints.js';
import { MEAL_TYPES } from '../utils/constants.js';
import useDebouncedCallback from './useDebouncedCallback.js';

/**
 * Loads the plan for a given ISO date and exposes auto-saving editors.
 *
 * saveStatus: 'idle' | 'saving' | 'saved' | 'error' — surfaced in the UI so the
 * user knows changes persist without a Save button.
 */
export default function usePlanEditor(dateISO, { autoSave = true } = {}) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle');
  const planRef = useRef(null);
  planRef.current = plan;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.getPlanByDate(dateISO);
      setPlan(data);
    } finally {
      setLoading(false);
    }
  }, [dateISO]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(
    async (nextPlan) => {
      setSaveStatus('saving');
      try {
        const { data } = await api.upsertPlan({
          date: dateISO,
          category: nextPlan.category,
          duration: nextPlan.duration,
          meals: nextPlan.meals,
          notes: nextPlan.notes,
        });
        setPlan(data);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
      } catch {
        setSaveStatus('error');
      }
    },
    [dateISO]
  );

  const { debounced: debouncedPersist, flush } = useDebouncedCallback(persist, 700);

  // Apply a local mutation and schedule a save.
  const mutate = useCallback(
    (updater) => {
      setPlan((prev) => {
        const base = prev || { date: dateISO, category: '', duration: 'Daily', meals: [], notes: '' };
        const next = updater(structuredClone(base));
        if (autoSave) debouncedPersist(next);
        return next;
      });
    },
    [autoSave, dateISO, debouncedPersist]
  );

  const createPlan = useCallback(
    async ({ category, duration, mealTypes }) => {
      const { data } = await api.createPlan({ date: dateISO, category, duration, mealTypes });
      setPlan(data);
      return data;
    },
    [dateISO]
  );

  const setMealName = useCallback(
    (mealType, mealName) =>
      mutate((p) => {
        const meal = ensureMeal(p, mealType);
        meal.mealName = mealName;
        return p;
      }),
    [mutate]
  );

  const setMealNotes = useCallback(
    (mealType, notes) =>
      mutate((p) => {
        ensureMeal(p, mealType).notes = notes;
        return p;
      }),
    [mutate]
  );

  const setIngredients = useCallback(
    (mealType, ingredients) =>
      mutate((p) => {
        ensureMeal(p, mealType).ingredients = ingredients;
        return p;
      }),
    [mutate]
  );

  const applySuggestions = useCallback(
    (suggestions) =>
      mutate((p) => {
        suggestions.forEach((s) => {
          const meal = ensureMeal(p, s.mealType);
          meal.mealName = s.mealName;
          meal.ingredients = s.ingredients.map((i) => ({ ...i }));
        });
        return p;
      }),
    [mutate]
  );

  const setNotes = useCallback((notes) => mutate((p) => ({ ...p, notes })), [mutate]);
  const setCategory = useCallback((category) => mutate((p) => ({ ...p, category })), [mutate]);

  const addMealType = useCallback(
    (mealType) =>
      mutate((p) => {
        ensureMeal(p, mealType);
        return p;
      }),
    [mutate]
  );

  return {
    plan,
    loading,
    saveStatus,
    reload: load,
    createPlan,
    setMealName,
    setMealNotes,
    setIngredients,
    setNotes,
    setCategory,
    addMealType,
    applySuggestions,
    saveNow: () => planRef.current && flush(planRef.current),
  };
}

function ensureMeal(plan, mealType) {
  if (!plan.meals) plan.meals = [];
  let meal = plan.meals.find((m) => m.mealType === mealType);
  if (!meal) {
    meal = { mealType, mealName: '', ingredients: [], notes: '' };
    // keep canonical order
    plan.meals.push(meal);
    plan.meals.sort((a, b) => MEAL_TYPES.indexOf(a.mealType) - MEAL_TYPES.indexOf(b.mealType));
    meal = plan.meals.find((m) => m.mealType === mealType);
  }
  return meal;
}
