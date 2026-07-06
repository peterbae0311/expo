export type EventStatus = "upcoming" | "ongoing" | "ended";
export type FilterStatus = EventStatus | "all";

const HTML_ENTITIES: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/**
 * 일부 소스(문화공공데이터광장 등)는 원본 XML 자체가 이중 이스케이프되어 있어
 * 파서가 한 번 디코딩해도 "&lt;제목&gt;" 같은 literal 엔티티가 남는다. 표시 직전에 한 번 더 푼다.
 */
export function decodeEntities(value: string): string {
  return value.replace(/&(lt|gt|amp|quot|#39|apos|nbsp);/g, (m) => HTML_ENTITIES[m] ?? m);
}

/** 원본 텍스트에 <br> 태그가 그대로 들어있는 경우(예: EVENT_PERIOD) 줄바꿈 문자로 바꾼다. white-space:pre-line과 함께 쓴다. */
export function toMultiline(value: string): string {
  return decodeEntities(value).replace(/<br\s*\/?>/gi, "\n");
}

export interface CategoryRow {
  code: string;
  parent_code: string | null;
  name: string;
  level: number;
  sort_order: number;
}

export interface VenueRef {
  name: string | null;
  region_sido: string | null;
  region_sigungu: string | null;
}

export interface CategoryRef {
  code: string;
  name: string;
  parent_code: string | null;
}

export interface EventRow {
  id: string;
  title: string;
  category_code: string | null;
  region_sido: string | null;
  region_sigungu: string | null;
  start_date: string;
  end_date: string | null;
  event_time: string | null;
  price_info: string | null;
  image_url: string | null;
  source_url: string | null;
  exh_venues: VenueRef | null;
  exh_categories: CategoryRef | null;
}

const STATUS_LABEL: Record<EventStatus, string> = {
  upcoming: "예정",
  ongoing: "진행중",
  ended: "종료",
};

export function statusLabel(status: EventStatus): string {
  return STATUS_LABEL[status];
}

/** YYYY-MM-DD 문자열 기준으로 예정/진행중/종료를 계산한다 (exh_events_status 뷰와 동일한 규칙). */
export function computeStatus(startDate: string, endDate: string | null): EventStatus {
  const today = new Date().toISOString().slice(0, 10);
  if (today < startDate) return "upcoming";
  const effectiveEnd = endDate ?? startDate;
  if (today > effectiveEnd) return "ended";
  return "ongoing";
}

export function displayVenue(row: EventRow): string {
  return row.exh_venues?.name ?? row.region_sido ?? "장소 미정";
}

export function displayRegion(row: EventRow): string | null {
  return row.region_sido ?? row.exh_venues?.region_sido ?? null;
}
