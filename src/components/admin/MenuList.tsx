import { Card } from '../ui/Card';
import { EditableItem } from '../ui/EditableItem';
import { AddItemBar } from './AddItemBar';
import { MenuItem } from '../../lib/supabase';
import { MEAL_TYPE_LABELS } from '../../utils/constants';

interface MenuListProps {
  mealType: 'breakfast' | 'lunch' | 'snacks';
  items: MenuItem[];
  onAdd: (name: string, description: string) => void;
  onUpdate: (itemId: string, name: string, description: string) => void;
  onDelete: (itemId: string) => void;
}

export function MenuList({ mealType, items, onAdd, onUpdate, onDelete }: MenuListProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{MEAL_TYPE_LABELS[mealType]}</h3>

      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <EditableItem
            key={item.id}
            name={item.name}
            description={item.description}
            onSave={(name, description) => onUpdate(item.id, name, description)}
            onDelete={() => onDelete(item.id)}
          />
        ))}
        {items.length === 0 && (
          <p className="text-gray-500 text-center py-4">No items added yet</p>
        )}
      </div>

      <AddItemBar mealType={mealType} onAdd={onAdd} />
    </Card>
  );
}
