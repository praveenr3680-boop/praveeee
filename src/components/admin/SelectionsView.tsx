import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { supabase, MealSelection, Profile } from '../../lib/supabase';
import { Users, CheckCircle, XCircle } from 'lucide-react';

interface SelectionWithProfile extends MealSelection {
  profiles?: Profile;
}

interface SelectionsViewProps {
  menuDate: string;
}

export function SelectionsView({ menuDate }: SelectionsViewProps) {
  const [selections, setSelections] = useState<SelectionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSelections();
  }, [menuDate]);

  const loadSelections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meal_selections')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('selection_date', menuDate)
        .eq('is_selected', true);

      if (error) throw error;
      setSelections(data || []);
    } catch (error) {
      console.error('Error loading selections:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSelections = selections.length;

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Employee Selections</h3>
        <p className="text-gray-500 text-center py-8">Loading...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Employee Selections</h3>
        <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-lg">
          <Users className="w-5 h-5 text-orange-600" />
          <span className="font-semibold text-orange-800">{totalSelections} confirmed</span>
        </div>
      </div>

      {selections.length === 0 ? (
        <div className="text-center py-8">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No selections yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {selections.map((selection) => (
            <div key={selection.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">{selection.profiles?.full_name}</p>
                <p className="text-sm text-gray-600">{selection.profiles?.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
