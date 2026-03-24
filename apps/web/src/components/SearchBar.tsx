import {
  CARD_LIST_MARGIN_X_PX,
  FILTER_CHIP_BG,
  LAYOUT_FILTER_ROW_PX,
  SEARCH_FIELD_CANCEL_MIN_HEIGHT_PX,
  SEARCH_FIELD_CANCEL_MIN_WIDTH_PX,
  THEME_PAGE_BG,
} from '../constants/theme.js';
import { Button } from '../ui/button.js';
import { SearchField } from '../ui/search-field.js';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** 收合列左側 chip 顯示文字（例如「全部」「動物保護」） */
  filterChipLabel: string;
  onFilterClick: () => void;
};

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = '搜尋',
  expanded,
  onExpandedChange,
  filterChipLabel,
  onFilterClick,
}: Props) {
  const gutter = { paddingLeft: CARD_LIST_MARGIN_X_PX, paddingRight: CARD_LIST_MARGIN_X_PX };
  const filterRowHeight = { height: LAYOUT_FILTER_ROW_PX, minHeight: LAYOUT_FILTER_ROW_PX };

  if (expanded) {
    return (
      <div className="mx-auto flex h-[40px] w-full max-w-[345px] min-w-0 items-center gap-0">
        <SearchField
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="搜尋捐款項目"
          autoFocus
        />
        <Button
          variant="link"
          size="link"
          className="box-border shrink-0 justify-center"
          style={{
            minWidth: SEARCH_FIELD_CANCEL_MIN_WIDTH_PX,
            minHeight: SEARCH_FIELD_CANCEL_MIN_HEIGHT_PX,
          }}
          type="button"
          onClick={() => {
            onChange('');
            onExpandedChange(false);
          }}
        >
          取消
        </Button>
      </div>
    );
  }

  return (
    <div
      className="box-border flex shrink-0 items-center justify-between"
      style={{ ...gutter, ...filterRowHeight, backgroundColor: THEME_PAGE_BG }}
    >
      <button
        type="button"
        className="box-border flex h-[34px] min-w-[73px] shrink-0 cursor-pointer items-center justify-center gap-[3px] rounded-[6px] py-[6px] pl-[12px] pr-[12px]"
        style={{ backgroundColor: FILTER_CHIP_BG }}
        aria-label="選擇類別"
        aria-haspopup="dialog"
        onClick={onFilterClick}
      >
        <span className="flex items-center gap-[3px] text-[14px] font-medium text-neutral-800">
          {filterChipLabel}
          <ChevronDown className="text-neutral-600" />
        </span>
      </button>
      <Button
        variant="searchMagnifier"
        size="searchTrigger"
        className="gap-[9px]"
        aria-label="開啟搜尋"
        type="button"
        onClick={() => onExpandedChange(true)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M16 16 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Button>
    </div>
  );
}
