import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, MenuItem, MealSelection } from '../lib/supabase';
import { Header } from '../components/common/Header';
import { Countdown } from '../components/ui/Countdown';
import { MealCard } from '../components/employee/MealCard';
import { MenuList } from '../components/admin/MenuList';
import { SelectionsView } from '../components/admin/SelectionsView';
import { formatDateYMD, getTomorrowDate, formatDate, isCutoffPassed } from '../utils/dateUtils';
import { AlertCircle, Calendar } from 'lucide-react';

export function UnifiedDashboard() {
  const { profile, user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selections, setSelections] = useState<MealSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tomorrowDate = formatDateYMD(getTomorrowDate());
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    loadMenuItems();
    if (!isAdmin) {
      loadSelections();
    }
  }, [isAdmin]);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('menu_date', tomorrowDate)
        .order('meal_type');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const loadSelections = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('meal_selections')
        .select('*')
        .eq('user_id', user.id)
        .eq('selection_date', tomorrowDate);

      if (error) throw error;
      setSelections(data || []);
    } catch (err) {
      console.error('Error loading selections:', err);
    }
  };

  const handleToggleSelection = async (menuItemId: string, currentValue: boolean) => {
    if (isCutoffPassed() || !user) return;

    try {
      const existingSelection = selections.find(s => s.menu_item_id === menuItemId);

      if (existingSelection) {
        const { error } = await supabase
          .from('meal_selections')
          .update({ is_selected: !currentValue, updated_at: new Date().toISOString() })
          .eq('id', existingSelection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('meal_selections')
          .insert({
            user_id: user.id,
            menu_item_id: menuItemId,
            selection_date: tomorrowDate,
            is_selected: true,
          });

        if (error) throw error;
      }

      await loadSelections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update selection');
    }
  };

  const handleAddMenuItem = async (mealType: 'breakfast' | 'lunch' | 'snacks', name: string, description: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('menu_items')
        .insert({
          name,
          description,
          meal_type: mealType,
          menu_date: tomorrowDate,
          created_by: user.id,
        });

      if (error) throw error;
      await loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  const handleUpdateMenuItem = async (itemId: string, name: string, description: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ name, description })
        .eq('id', itemId);

      if (error) throw error;
      await loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const getItemsByMealType = (mealType: 'breakfast' | 'lunch' | 'snacks') => {
    return menuItems.filter(item => item.meal_type === mealType);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {isAdmin ? 'Manage Tomorrow\'s Menu' : 'Tomorrow\'s Menu'}
            </h2>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <p className="text-lg">{formatDate(tomorrowDate)}</p>
            </div>
          </div>
          {!isAdmin && <Countdown />}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {isAdmin ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <MenuList
                mealType="breakfast"
                items={getItemsByMealType('breakfast')}
                onAdd={(name, desc) => handleAddMenuItem('breakfast', name, desc)}
                onUpdate={handleUpdateMenuItem}
                onDelete={handleDeleteMenuItem}
              />
              <MenuList
                mealType="lunch"
                items={getItemsByMealType('lunch')}
                onAdd={(name, desc) => handleAddMenuItem('lunch', name, desc)}
                onUpdate={handleUpdateMenuItem}
                onDelete={handleDeleteMenuItem}
              />
              <MenuList
                mealType="snacks"
                items={getItemsByMealType('snacks')}
                onAdd={(name, desc) => handleAddMenuItem('snacks', name, desc)}
                onUpdate={handleUpdateMenuItem}
                onDelete={handleDeleteMenuItem}
              />
            </div>
            <SelectionsView menuDate={tomorrowDate} />
          </>
        ) : (
          <>
            {isCutoffPassed() && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-center font-medium">
                  Selection time has ended. Your current selections are locked.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MealCard
                mealType="breakfast"
                items={getItemsByMealType('breakfast')}
                selections={selections}
                onToggleSelection={handleToggleSelection}
                disabled={isCutoffPassed()}
              />
              <MealCard
                mealType="lunch"
                items={getItemsByMealType('lunch')}
                selections={selections}
                onToggleSelection={handleToggleSelection}
                disabled={isCutoffPassed()}
              />
              <MealCard
                mealType="snacks"
                items={getItemsByMealType('snacks')}
                selections={selections}
                onToggleSelection={handleToggleSelection}
                disabled={isCutoffPassed()}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
