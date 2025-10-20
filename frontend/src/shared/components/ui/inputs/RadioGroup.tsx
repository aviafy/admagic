/**
 * RadioGroup component - Radio button group
 */

'use client';

import { InputHTMLAttributes } from 'react';

export interface RadioOption {
  value: string;
  label: string;
  icon?: string;
}

export interface RadioGroupProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  layout?: 'horizontal' | 'vertical';
  variant?: 'default' | 'button';
}

export function RadioGroup({
  label,
  options,
  value,
  onChange,
  error,
  layout = 'horizontal',
  variant = 'default',
  name,
  disabled,
}: RadioGroupProps) {
  if (variant === 'button') {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={`
                flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
                ${
                  value === option.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div
        className={`flex ${
          layout === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-2'
        }`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center ${
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
