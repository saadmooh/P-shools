import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[var(--tg-theme-section-header-text-color)] text-sm font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md bg-[var(--tg-theme-secondary-bg-color)] px-3 py-2 text-sm ring-offset-[var(--tg-theme-bg-color)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--tg-theme-hint-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tg-theme-button-color)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-none transition-all',
            error && 'ring-2 ring-[var(--tg-theme-destructive-text-color)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[var(--tg-theme-destructive-text-color)] text-xs font-medium mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
