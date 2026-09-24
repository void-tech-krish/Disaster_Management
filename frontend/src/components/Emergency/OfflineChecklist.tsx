import React, { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: '1', label: 'Drinking water (3 days supply)', checked: false },
  { id: '2', label: 'First-aid kit & medicines', checked: false },
  { id: '3', label: 'Flashlight & batteries', checked: false },
  { id: '4', label: 'Power bank & charging cables', checked: false },
  { id: '5', label: 'Non-perishable food', checked: false },
  { id: '6', label: 'Important documents (ID, Insurance)', checked: false },
  { id: '7', label: 'Emergency contacts list', checked: false },
  { id: '8', label: 'Battery/hand-crank radio', checked: false },
];

const OfflineChecklist: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('disasterguard_checklist');
    if (saved) {
      try {
         return JSON.parse(saved);
      } catch(e) { return DEFAULT_ITEMS; }
    }
    return DEFAULT_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem('disasterguard_checklist', JSON.stringify(items));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  return (
    <div className="bg-darkslate p-4 rounded-xl border border-gray-700 shadow-md">
      <h3 className="text-xl font-bold mb-4 text-warning">Emergency Checklist</h3>
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className="flex items-center space-x-3 bg-charcoal p-3 rounded-lg border border-gray-700">
            <input 
              type="checkbox" 
              checked={item.checked} 
              onChange={() => toggleItem(item.id)}
              className="w-5 h-5 accent-warning cursor-pointer"
            />
            <span className={`${item.checked ? 'line-through text-gray-500' : 'text-gray-200'} cursor-pointer`} onClick={() => toggleItem(item.id)}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-xs text-gray-500 italic">
        Data saved locally on your device.
      </div>
    </div>
  );
};

export default OfflineChecklist;
