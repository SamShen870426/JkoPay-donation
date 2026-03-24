import { cva, type VariantProps } from 'class-variance-authority';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn.js';
import {
  SEARCH_FIELD_CARET_AND_LINK,
  SEARCH_FIELD_HEIGHT_PX,
  SEARCH_FIELD_ICON_PX,
  SEARCH_FIELD_INNER_GAP_PX,
  SEARCH_FIELD_PADDING_X_PX,
  SEARCH_FIELD_PADDING_Y_PX,
  SEARCH_FIELD_RADIUS_PX,
} from '../constants/theme.js';

const searchFieldShellVariants = cva(
  'flex min-h-0 min-w-0 flex-1 items-center border-0 bg-black/5 text-[14px] text-neutral-900 shadow-none outline-none ring-0 focus-within:border-0 focus-within:ring-0',
  {
    variants: {
      tone: {
        default: '',
      },
    },
    defaultVariants: { tone: 'default' },
  },
);

export type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> &
  VariantProps<typeof searchFieldShellVariants> & {
    /** 左側 magnifier，預設與 Figma 展開態一致 */
    iconSize?: number;
  };

/**
 * 展開搜尋：外框 focus 無色；caret #2E7DD9
 * Figma Search field：40 高、radius 20、black/5、內距 9/12、gap 9；magnifier 18×18 #757575。
 */
export function SearchField({
  className,
  tone,
  iconSize = SEARCH_FIELD_ICON_PX,
  ...inputProps
}: SearchFieldProps) {
  const h = SEARCH_FIELD_HEIGHT_PX;
  const r = SEARCH_FIELD_RADIUS_PX;
  const py = SEARCH_FIELD_PADDING_Y_PX;
  const px = SEARCH_FIELD_PADDING_X_PX;
  const g = SEARCH_FIELD_INNER_GAP_PX;

  return (
    <div
      className={cn(searchFieldShellVariants({ tone }), className)}
      style={{
        minHeight: h,
        height: h,
        borderRadius: r,
        paddingTop: py,
        paddingBottom: py,
        paddingLeft: px,
        paddingRight: px,
        gap: g,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0 text-[#757575]"
        aria-hidden
      >
        <path
          d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M16 16 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        className="min-w-0 flex-1 border-0 bg-transparent text-[14px] leading-[22px] shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-[#B2B2B2]"
        style={{ caretColor: SEARCH_FIELD_CARET_AND_LINK }}
        {...inputProps}
      />
    </div>
  );
}

export { searchFieldShellVariants };
