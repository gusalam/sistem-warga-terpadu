import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconClassName,
}) => {
  return (
    <div className={cn(
      'bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-card-foreground">{value}</p>
          {description && (
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground font-normal">dari bulan lalu</span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg',
          iconClassName || 'bg-primary/10 text-primary'
        )}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};
