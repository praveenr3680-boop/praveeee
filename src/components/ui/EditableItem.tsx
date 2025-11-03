import { useState } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';

interface EditableItemProps {
  name: string;
  description: string;
  onSave: (name: string, description: string) => void;
  onDelete: () => void;
}

export function EditableItem({ name, description, onSave, onDelete }: EditableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editDescription, setEditDescription] = useState(description);

  const handleSave = () => {
    if (editName.trim()) {
      onSave(editName.trim(), editDescription.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(name);
    setEditDescription(description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="border border-orange-200 rounded-lg p-3 bg-orange-50">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Item name"
          autoFocus
        />
        <input
          type="text"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Description (optional)"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
      <div className="flex-1">
        <h4 className="font-medium text-gray-800">{name}</h4>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
