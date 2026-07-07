import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/data";
import { computeStatus, statusLabel, displayVenue, displayRegion, displayDateRange, decodeEntities, toMultiline } from "@/lib/types";
import { EventImage } from "@/components/EventImage";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const status = computeStatus(event.start_date, event.end_date);
  const isIndustry = event.exh_categories?.parent_code === "IND";
  const domainLabel = isIndustry ? "산업" : "문화";
  const categoryLabel = event.exh_categories?.name ?? "기타";
  const region = displayRegion(event);
  const hasCoords = false; // 좌표 필드는 exh_venues에 있으나 목록 select에는 포함하지 않음

  return (
    <div className="content-shell py-10">
      <div className="mb-6 text-xs font-bold uppercase tracking-wide text-ink-muted">
        <Link href="/" className="underline-grow hover:text-ink">
          목록
        </Link>{" "}
        / {categoryLabel}
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[340px_1fr]">
        <div className="aspect-[3/4] w-full bg-line/30">
          <EventImage
            src={event.image_url}
            alt=""
            imgClassName="h-full w-full object-contain"
            fallbackClassName="h-full w-full bg-gradient-to-br from-culture/30 to-line"
          />
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className={"px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white " + (isIndustry ? "bg-industry" : "bg-culture")}>
              {domainLabel} · {categoryLabel}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{statusLabel(status)}</span>
          </div>

          <h1 className="mb-8 text-3xl font-black leading-tight tracking-tight md:text-4xl">
            {decodeEntities(event.title)}
          </h1>

          <dl className="border-t border-ink/50 text-sm">
            <Row k="기간" v={displayDateRange(event)} />
            {event.event_time ? <Row k="시간" v={toMultiline(event.event_time)} pre /> : null}
            <Row k="장소" v={decodeEntities(displayVenue(event))} />
            {region ? <Row k="지역" v={region} /> : null}
            {event.price_info ? <Row k="요금" v={decodeEntities(event.price_info)} /> : null}
          </dl>

          {hasCoords ? (
            <div className="mt-4 flex h-40 items-center justify-center border border-line text-xs text-ink-muted">지도</div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {event.source_url ? (
              <a
                href={event.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-ink px-6 py-3 text-center text-sm font-bold text-paper transition-opacity hover:opacity-80"
              >
                원문에서 보기 ↗
              </a>
            ) : null}
            <Link href="/" className="border border-line-strong px-6 py-3 text-center text-sm font-bold text-ink-muted hover:border-ink/60 hover:text-ink">
              ← 목록으로
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, pre }: { k: string; v: string; pre?: boolean }) {
  return (
    <div className="flex gap-6 border-b border-line py-4">
      <dt className="w-16 shrink-0 pt-0.5 text-xs font-bold uppercase tracking-wide text-ink-muted">{k}</dt>
      <dd className={pre ? "whitespace-pre-line" : undefined}>{v}</dd>
    </div>
  );
}
