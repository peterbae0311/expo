import Link from "next/link";
import type { EventRow } from "@/lib/types";
import { computeStatus, statusLabel, displayVenue, decodeEntities } from "@/lib/types";

export function EventCard({ event }: { event: EventRow }) {
  const status = computeStatus(event.start_date, event.end_date);
  const isIndustry = event.exh_categories?.parent_code === "IND";

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <div className="img-zoom relative aspect-[4/3] bg-line/30">
        {event.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.image_url} alt="" className="h-full w-full object-contain" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-culture/20 to-line" />
        )}
        <span
          className={
            "absolute right-0 top-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white " +
            (isIndustry ? "bg-industry" : "bg-culture")
          }
        >
          {statusLabel(status)}
        </span>
      </div>
      <div className="pt-3">
        {event.exh_categories?.name ? (
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            {event.exh_categories.name}
          </div>
        ) : null}
        <div className="text-[15px] font-extrabold leading-snug tracking-tight line-clamp-2 group-hover:text-culture">
          {decodeEntities(event.title)}
        </div>
        <div className="mt-1 truncate text-[12px] text-ink-muted">{decodeEntities(displayVenue(event))}</div>
      </div>
    </Link>
  );
}
