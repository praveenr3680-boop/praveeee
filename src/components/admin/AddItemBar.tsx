import { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddItemBarProps {
  mealType: 'breakfast' | 'lunch' | 'snacks';
  onAdd: (name: string, description: string) => void;
}

export function AddItemBar({ mealType, onAdd }: AddItemBarProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), description.trim());
      setName('');
      setDescription('');
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 text-gray-600 hover:text-orange-600"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add Item</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item name"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        autoFocus
        required
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors font-medium"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => {
            setName('');
            setDescription('');
            setIsExpanded(false);
          }}
          className="px-4 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
