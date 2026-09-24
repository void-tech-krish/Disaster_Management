import React, { useState } from 'react';

const Preparedness = () => {
  const [familyMembers, setFamilyMembers] = useState([{ name: '', age: '', medical: '' }]);
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'First Aid Kit', checked: false },
    { id: 2, text: '3 Days of Water', checked: false },
    { id: 3, text: 'Flashlight & Batteries', checked: false },
    { id: 4, text: 'Important Documents in Waterproof Bag', checked: false },
    { id: 5, text: 'Emergency Contacts Written Down', checked: false }
  ]);
  const [planGenerated, setPlanGenerated] = useState(false);

  const toggleCheck = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: '', age: '', medical: '' }]);
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const generatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setPlanGenerated(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold mb-2">Family Preparedness Planner</h1>
        <p className="text-gray-400">Create a customized emergency plan for your household.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Col: Checklist */}
        <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-warning">Survival Kit Checklist</h2>
          <div className="space-y-3">
            {checklist.map(item => (
              <label key={item.id} className="flex items-center space-x-3 cursor-pointer group p-2 hover:bg-charcoal rounded transition-colors">
                <input 
                  type="checkbox" 
                  checked={item.checked}
                  onChange={() => toggleCheck(item.id)}
                  className="w-5 h-5 accent-warning cursor-pointer"
                />
                <span className={`text-sm ${item.checked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400 uppercase">Kit Readiness</span>
              <span className="text-xs font-bold text-success">
                {Math.round((checklist.filter(i => i.checked).length / checklist.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-charcoal rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(checklist.filter(i => i.checked).length / checklist.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Col: Family Plan */}
        <div className="bg-darkslate p-6 rounded-xl border border-gray-700 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-warning">Household Details</h2>
          <form onSubmit={generatePlan} className="space-y-4">
            {familyMembers.map((m, idx) => (
              <div key={idx} className="bg-charcoal p-3 rounded border border-gray-600 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-bold">Member {idx + 1}</span>
                  {idx > 0 && (
                    <button type="button" onClick={() => setFamilyMembers(familyMembers.filter((_, i) => i !== idx))} className="text-xs text-danger hover:underline">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Name" value={m.name} onChange={e => handleMemberChange(idx, 'name', e.target.value)} className="col-span-2 bg-darkslate border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-warning outline-none" required />
                  <input type="number" placeholder="Age" value={m.age} onChange={e => handleMemberChange(idx, 'age', e.target.value)} className="bg-darkslate border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-warning outline-none" required />
                </div>
                <input type="text" placeholder="Medical Notes (e.g. Asthma, Needs Insulin)" value={m.medical} onChange={e => handleMemberChange(idx, 'medical', e.target.value)} className="w-full bg-darkslate border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-warning outline-none" />
              </div>
            ))}
            
            <button type="button" onClick={addFamilyMember} className="w-full border border-dashed border-gray-500 text-gray-400 py-2 rounded hover:text-white hover:border-gray-400 transition-colors text-sm">
              + Add Family Member
            </button>
            
            <button type="submit" className="w-full bg-warning text-darkslate font-bold py-2 rounded hover:bg-yellow-500 transition-colors">
              Generate PDF Action Plan
            </button>
          </form>

          {planGenerated && (
            <div className="mt-4 p-3 bg-success/10 border border-success text-success rounded text-sm flex items-center justify-between animate-pulse">
              <span>Plan Generated Successfully!</span>
              <button onClick={() => alert('Downloading Mock PDF...')} className="underline font-bold">Download</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preparedness;
