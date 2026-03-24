import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9191D]/30 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        ghost: 'rounded-full text-current active:bg-black/5',
        icon: 'rounded-full text-neutral-600 active:bg-black/5',
        /** Figma：search bar / icon button — palette/gray/100 底、圓角 20 */
        searchMagnifier:
          'rounded-[20px] bg-[#EDEDF1] text-neutral-700 active:brightness-[0.97]',
        text: 'rounded-md px-1 py-2 text-[15px]',
        /** Figma cancel：16/24、py-6 px-12 左、theme/text-link */
        link: 'rounded-md py-1.5 pl-3 pr-0 text-[16px] leading-6 font-normal text-[#2E7DD9] active:opacity-80',
        'icon-ghost': 'rounded-full text-white active:bg-white/10',
      },
      size: {
        default: 'h-10 min-w-10 px-3',
        icon: 'h-9 w-9 shrink-0',
        iconLg: 'h-10 w-10 shrink-0',
        /** Figma：外框 34×34、內距 8（內容區 18×18 放 magnifier） */
        searchTrigger: 'box-border h-[34px] w-[34px] min-h-[34px] min-w-[34px] shrink-0 p-[8px]',
        text: 'min-h-0 px-1 py-2',
        /** 搭配 variant link，避免 default 的 h-10 壓過連結樣式 */
        link: 'h-auto min-h-0 w-auto shrink-0 p-0',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default',
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
