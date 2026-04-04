import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl bg-[var(--tg-theme-section-bg-color)] text-[var(--tg-theme-text-color)] border border-slate-100 transition-all duration-300',
          'shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1 p-5', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-base font-bold tracking-tight text-slate-900', className)} {...props} />
);

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-xs text-slate-500 font-medium', className)} {...props} />
);

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5 pt-0', className)} {...props} />
);

export const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center p-5 pt-0', className)} {...props} />
);

Card.displayName = 'Card';

export default Card;
