import { Utensils } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
        <Utensils className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-800">Smart Canteen</h1>
        <p className="text-xs text-gray-500">Karmic Solutions</p>
      </div>
    </div>
  );
}
