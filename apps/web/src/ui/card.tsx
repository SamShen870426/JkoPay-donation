import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn.js';

const donationCardShellVariants = cva(
  'flex w-full shrink-0 gap-3 rounded-[12px] py-[9px] pl-[9px] pr-[12px] bg-white',
  {
    variants: {
      interactive: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      interactive: false,
    },
  },
);

export type DonationCardShellProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof donationCardShellVariants>;

export function DonationCardShell({ className, interactive, ...props }: DonationCardShellProps) {
  return (
    <div
      className={cn(donationCardShellVariants({ interactive }), 'h-[82px]', className)}
      {...props}
    />
  );
}

export { donationCardShellVariants };
