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
      <header className="border-b border-dg-border pb-4">
        <h1 className="text-3xl font-extrabold text-dg-navy mb-2">Family Preparedness Planner</h1>
        <p className="text-dg-muted font-medium">Create a customized emergency plan for your household.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Col: Checklist */}
        <div className="bg-dg-surface p-6 rounded-[18px] border border-dg-border shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-dg-navy">Survival Kit Checklist</h2>
          <div className="space-y-3">
            {checklist.map(item => (
              <label key={item.id} className="flex items-center space-x-3 cursor-pointer group p-2 hover:bg-slate-50 rounded transition-colors">
                <input 
                  type="checkbox" 
                  checked={item.checked}
                  onChange={() => toggleCheck(item.id)}
                  className="w-5 h-5 accent-dg-primary cursor-pointer"
                />
                <span className={`text-sm ${item.checked ? 'text-slate-400 line-through' : 'text-dg-navy font-medium'}`}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-dg-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-dg-muted uppercase tracking-wider">Kit Readiness</span>
              <span className="text-xs font-bold text-dg-primary">
                {Math.round((checklist.filter(i => i.checked).length / checklist.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-dg-primary h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(checklist.filter(i => i.checked).length / checklist.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Col: Family Plan */}
        <div className="bg-dg-surface p-6 rounded-[18px] border border-dg-border shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-dg-navy">Household Details</h2>
          <form onSubmit={generatePlan} className="space-y-4">
            {familyMembers.map((m, idx) => (
              <div key={idx} className="bg-dg-bg p-3 rounded-lg border border-dg-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-dg-muted font-bold uppercase tracking-wider">Member {idx + 1}</span>
                  {idx > 0 && (
                    <button type="button" onClick={() => setFamilyMembers(familyMembers.filter((_, i) => i !== idx))} className="text-xs font-bold text-dg-danger hover:underline">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Name" value={m.name} onChange={e => handleMemberChange(idx, 'name', e.target.value)} className="col-span-2 bg-white border border-dg-border rounded px-3 py-2 text-sm text-dg-navy focus:border-dg-primary outline-none" required />
                  <input type="number" placeholder="Age" value={m.age} onChange={e => handleMemberChange(idx, 'age', e.target.value)} className="bg-white border border-dg-border rounded px-3 py-2 text-sm text-dg-navy focus:border-dg-primary outline-none" required />
                </div>
                <input type="text" placeholder="Medical Notes (e.g. Asthma, Needs Insulin)" value={m.medical} onChange={e => handleMemberChange(idx, 'medical', e.target.value)} className="w-full bg-white border border-dg-border rounded px-3 py-2 text-sm text-dg-navy focus:border-dg-primary outline-none" />
              </div>
            ))}
            
            <button type="button" onClick={addFamilyMember} className="w-full border-2 border-dashed border-slate-300 text-slate-500 font-bold py-2 rounded-lg hover:border-dg-primary hover:text-dg-primary transition-colors text-sm">
              + Add Family Member
            </button>
            
            <button type="submit" className="w-full bg-dg-primary text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-sm">
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
