import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn.js';

const skeletonVariants = cva('animate-pulse rounded-md bg-neutral-200/90', {
  variants: {
    shape: {
      line: 'h-3 w-full',
      title: 'h-4 w-[85%]',
      circle: 'rounded-full',
      rect: 'rounded-lg',
    },
  },
  defaultVariants: {
    shape: 'line',
  },
});

export type SkeletonProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof skeletonVariants> & {
    /** circle / rect 時需指定寬高 class，例如 h-14 w-14 */
  };

export function Skeleton({ className, shape, ...props }: SkeletonProps) {
  return <div className={cn(skeletonVariants({ shape }), className)} {...props} />;
}

export { skeletonVariants };
