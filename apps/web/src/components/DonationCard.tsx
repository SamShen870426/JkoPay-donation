import type { DonationListItem } from '@jkopay/contracts';
import { DonationCardShell } from '../ui/card.js';

type Props = { item: DonationListItem };

/** Figma charity card：CVA shell + 內容區 */
export function DonationCard({ item }: Props) {
  return (
    <DonationCardShell>
      <div className="relative h-[56px] w-[56px] shrink-0 self-center overflow-hidden rounded-lg bg-neutral-100">
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5"
          aria-hidden
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center">
        <h2 className="line-clamp-2 text-[16px] font-semibold leading-snug text-neutral-900">
          {item.title}
        </h2>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-neutral-500">
          {item.description}
        </p>
      </div>
    </DonationCardShell>
  );
}
