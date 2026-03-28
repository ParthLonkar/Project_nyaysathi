import React from 'react';

const STARTERS = [
  'Water issue',
  'Electricity issue',
  'Garbage issue',
  'Road damage',
  'Harassment',
  'Property issue',
];

export default function StarterChips({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {STARTERS.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className="px-3 py-1.5 rounded-full border border-blue-200 bg-white text-blue-800 text-sm font-semibold hover:bg-blue-50 transition-colors"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
