"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

declare global {
  interface Window {
    kakao: any;
  }
}

let kakaoSdkPromise: Promise<void> | null = null;

/** 카카오맵 JS SDK는 페이지당 한 번만 로드하면 되므로 모듈 스코프에 프라미스를 캐싱한다 */
function loadKakaoMapsSdk(): Promise<void> {
  if (kakaoSdkPromise) return kakaoSdkPromise;
  kakaoSdkPromise = new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&libraries=services&autoload=false`;
    script.onload = () => window.kakao.maps.load(() => resolve());
    script.onerror = () => reject(new Error("카카오맵 SDK 로드에 실패했습니다."));
    document.head.appendChild(script);
  });
  return kakaoSdkPromise;
}

/**
 * 장소명 텍스트를 버튼으로 감싸 클릭 시 위치 팝업을 띄운다.
 * EventCard 안에서는 카드 전체가 상세 페이지로 가는 Link이므로,
 * 클릭 이벤트가 그 Link로 버블링/기본 네비게이션되지 않도록 막는다.
 */
export function VenuePlaceButton({ venueName, className }: { venueName: string; className?: string }) {
  const [open, setOpen] = useState(false);

  if (!venueName || venueName === "장소 미정" || !process.env.NEXT_PUBLIC_KAKAO_JS_KEY) {
    return <span className={`${className ?? ""} block truncate`}>{venueName}</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={`${className ?? ""} inline-flex max-w-full items-center gap-1 text-left hover:underline`}
      >
        <PinIcon className="h-3 w-3 shrink-0 text-culture" />
        <span className="truncate">{venueName}</span>
      </button>
      {open ? <VenueMapModal venueName={venueName} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/** 장소 텍스트가 지도 팝업을 열는 기능임을 호버 없이도 바로 알 수 있게 하는 위치 아이콘 */
function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

type SearchStatus = "loading" | "found" | "not-found" | "error";

function VenueMapModal({ venueName, onClose }: { venueName: string; onClose: () => void }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<SearchStatus>("loading");
  const [place, setPlace] = useState<{ lat: number; lng: number; address: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadKakaoMapsSdk()
      .then(() => {
        if (cancelled) return;
        const places = new window.kakao.maps.services.Places();
        places.keywordSearch(venueName, (data: Array<{ x: string; y: string; road_address_name: string; address_name: string }>, resultStatus: string) => {
          if (cancelled) return;
          if (resultStatus === window.kakao.maps.services.Status.OK && data.length > 0) {
            const first = data[0];
            setPlace({
              lat: parseFloat(first.y),
              lng: parseFloat(first.x),
              address: first.road_address_name || first.address_name,
            });
            setStatus("found");
          } else {
            setStatus("not-found");
          }
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [venueName]);

  useEffect(() => {
    if (status !== "found" || !place || !mapContainerRef.current) return;
    const center = new window.kakao.maps.LatLng(place.lat, place.lng);
    const map = new window.kakao.maps.Map(mapContainerRef.current, { center, level: 4 });
    new window.kakao.maps.Marker({ position: center, map });
  }, [status, place]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const directionsHref = place
    ? `https://map.kakao.com/link/to/${encodeURIComponent(venueName)},${place.lat},${place.lng}`
    : `https://map.kakao.com/?q=${encodeURIComponent(venueName)}`;
  const mapHref = place ? `https://map.kakao.com/link/map/${encodeURIComponent(venueName)},${place.lat},${place.lng}` : directionsHref;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div className="flex h-[700px] w-full max-w-[1100px] flex-col bg-paper p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex shrink-0 items-start justify-between gap-4">
          <h3 className="text-base font-black leading-snug">{venueName}</h3>
          <button type="button" onClick={onClose} aria-label="닫기" className="shrink-0 text-ink-muted hover:text-ink">
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1">
          {status === "loading" ? (
            <div className="flex h-full items-center justify-center text-xs text-ink-muted">위치 검색 중...</div>
          ) : status === "found" && place ? (
            <div ref={mapContainerRef} className="h-full w-full border border-line" />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-xs text-ink-muted">
              {status === "error" ? "지도를 불러오지 못했습니다." : "정확한 위치를 찾을 수 없습니다. 카카오맵에서 직접 검색해보세요."}
            </div>
          )}
        </div>

        {status === "found" && place ? <div className="mt-2 shrink-0 text-xs text-ink-muted">{place.address}</div> : null}

        <div className="mt-4 flex shrink-0 gap-2">
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-ink px-4 py-2.5 text-center text-xs font-bold text-paper hover:opacity-80"
          >
            길찾기 ↗
          </a>
          <a
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-line-strong px-4 py-2.5 text-center text-xs font-bold text-ink-muted hover:text-ink"
          >
            카카오맵에서 보기 ↗
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
