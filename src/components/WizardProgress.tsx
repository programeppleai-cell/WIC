import React from 'react';
import { 
  Check, 
  FileText, 
  AlignLeft, 
  User, 
  Target, 
  ListTree, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

export const WIZARD_STEPS = [
  { id: 1, label: 'Judul', icon: FileText },
  { id: 2, label: 'Deskripsi', icon: AlignLeft },
  { id: 3, label: 'Penulis', icon: User },
  { id: 4, label: 'Target & Tujuan', icon: Target },
  { id: 5, label: 'Bab', icon: ListTree },
  { id: 6, label: 'Gaya', icon: Sparkles },
  { id: 7, label: 'Review', icon: CheckCircle2 },
];

interface WizardProgressProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  maxReachedStep: number;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  onSelectStep,
  maxReachedStep,
}) => {
  return (
    <div className="w-full bg-white border-b border-gray-200/80 py-3.5 px-4 sm:px-6 mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
      <div className="max-w-4xl mx-auto flex items-center justify-between min-w-[620px] sm:min-w-0">
        {WIZARD_STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isClickable = step.id <= Math.max(maxReachedStep, currentStep);
          const IconComponent = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle & Label */}
              <button
                type="button"
                onClick={() => isClickable && onSelectStep(step.id)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-1.5 transition-all text-center group ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isActive
                      ? 'bg-emerald-700 text-white ring-4 ring-emerald-100 scale-105'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>

                <span
                  className={`text-[11px] font-semibold tracking-tight whitespace-nowrap ${
                    isActive
                      ? 'text-emerald-900 font-bold'
                      : isCompleted
                      ? 'text-gray-800'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {/* Connecting Line between steps */}
              {idx < WIZARD_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded transition-colors ${
                    step.id < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
