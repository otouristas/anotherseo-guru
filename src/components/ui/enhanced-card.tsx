import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface EnhancedCardProps {
  title: string;
  description?: string;
  value?: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onClick?: () => void;
}

export function EnhancedCard({
  title,
  description,
  value,
  change,
  icon,
  actions,
  loading = false,
  className,
  children,
  variant = 'default',
  size = 'md',
  clickable = false,
  onClick,
}: EnhancedCardProps) {
  const variants = {
    default: 'border-border bg-card hover:bg-card/80',
    success: 'border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:bg-green-950',
    warning: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950',
    danger: 'border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-950',
    info: 'border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950',
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <div className={sizes[size]}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className={cn('rounded', iconSizes[size])} />
          </div>
          <div className="mt-4">
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </Card>
    );
  }

  const cardContent = (
    <Card className={cn(
      'transition-all duration-200',
      variants[variant],
      sizes[size],
      clickable && 'cursor-pointer hover:shadow-md active:scale-[0.98]',
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className={cn(
              'text-muted-foreground',
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
            )}>
              {title}
            </CardTitle>
            {description && (
              <CardDescription className={cn(
                size === 'sm' ? 'text-xs' : 'text-sm'
              )}>
                {description}
              </CardDescription>
            )}
          </div>
          {icon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                'rounded-lg flex items-center justify-center',
                variant === 'success' && 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
                variant === 'warning' && 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
                variant === 'danger' && 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
                variant === 'info' && 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
                variant === 'default' && 'bg-primary/10 text-primary',
                iconSizes[size]
              )}
            >
              {icon}
            </motion.div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {value !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <div className={cn(
              'font-bold',
              size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'
            )}>
              {value}
            </div>
            {change && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge
                  variant={
                    change.type === 'increase' ? 'default' :
                    change.type === 'decrease' ? 'destructive' : 'secondary'
                  }
                  className={cn(
                    'text-xs font-medium',
                    change.type === 'increase' && 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200',
                    change.type === 'decrease' && 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200',
                    change.type === 'neutral' && 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200'
                  )}
                >
                  {change.type === 'increase' ? '↗' : change.type === 'decrease' ? '↘' : '→'}
                  {Math.abs(change.value)}%
                </Badge>
              </motion.div>
            )}
          </motion.div>
        )}
        
        {children && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4"
          >
            {children}
          </motion.div>
        )}
        
        {actions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex justify-end space-x-2"
          >
            {actions}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );

  if (clickable && onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

// Specialized card variants
export function MetricCard({
  title,
  value,
  change,
  icon,
  loading,
  className,
}: Omit<EnhancedCardProps, 'children' | 'actions'>) {
  return (
    <EnhancedCard
      title={title}
      value={value}
      change={change}
      icon={icon}
      loading={loading}
      className={className}
      variant="default"
      size="md"
    />
  );
}

export function AlertCard({
  title,
  description,
  variant = 'warning',
  actions,
  className,
}: Pick<EnhancedCardProps, 'title' | 'description' | 'variant' | 'actions' | 'className'>) {
  return (
    <EnhancedCard
      title={title}
      description={description}
      variant={variant}
      actions={actions}
      className={className}
      size="sm"
    />
  );
}

export function StatCard({
  title,
  value,
  icon,
  loading,
  className,
}: Pick<EnhancedCardProps, 'title' | 'value' | 'icon' | 'loading' | 'className'>) {
  return (
    <EnhancedCard
      title={title}
      value={value}
      icon={icon}
      loading={loading}
      className={className}
      size="lg"
      variant="info"
    />
  );
}
