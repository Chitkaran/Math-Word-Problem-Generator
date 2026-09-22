
import React from 'react';

interface ToggleSwitchProps {
  label?: string;
  icon?: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
  description?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, icon, enabled, onToggle, description }) => {
  return (
    <div
      onClick={onToggle}
      className={`p-1.5 rounded-full cursor-pointer transition-all flex items-center ${
        enabled ? 'bg-green-100' : 'bg-slate-100 hover:bg-slate-200'
      }`}
    >
      <div className="flex items-center gap-3 w-full">
        {icon && <span className={enabled ? 'text-green-600' : 'text-slate-500'}>{icon}</span>}
        {label && <span className={`font-semibold text-sm ${enabled ? 'text-green-800' : 'text-slate-700'}`}>{label}</span>}
        <div className={`relative flex-shrink-0 w-10 h-5 rounded-full flex items-center transition-colors ${enabled ? 'bg-green-500' : 'bg-slate-300'}`}>
          <span
            className={`absolute left-0 inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </div>
      </div>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
  );
};
