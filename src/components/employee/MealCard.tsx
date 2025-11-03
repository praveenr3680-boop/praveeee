import { Card } from '../ui/Card';
import { MenuItem, MealSelection } from '../../lib/supabase';
import { MEAL_TYPE_LABELS } from '../../utils/constants';
import { CheckCircle, Circle } from 'lucide-react';

interface MealCardProps {
  mealType: 'breakfast' | 'lunch' | 'snacks';
  items: MenuItem[];
  selections: MealSelection[];
  onToggleSelection: (menuItemId: string, currentValue: boolean) => void;
  disabled: boolean;
}

export function MealCard({ mealType, items, selections, onToggleSelection, disabled }: MealCardProps) {
  const getSelectionStatus = (itemId: string): boolean => {
    const selection = selections.find(s => s.menu_item_id === itemId);
    return selection?.is_selected ?? false;
  };

  if (items.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{MEAL_TYPE_LABELS[mealType]}</h3>
        <p className="text-gray-500 text-center py-8">No items available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{MEAL_TYPE_LABELS[mealType]}</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const isSelected = getSelectionStatus(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggleSelection(item.id, isSelected)}
              disabled={disabled}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300 bg-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
            >
              <div className="flex items-start gap-3">
                {isSelected ? (
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{item.name}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
