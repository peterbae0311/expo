"use client";

import { useState } from "react";

/** image_url이 없거나(깨진 링크 등으로) 로드에 실패하면 동일한 샘플 플레이스홀더로 대체한다 */
export function EventImage({
  src,
  alt,
  imgClassName,
  fallbackClassName,
}: {
  src: string | null;
  alt: string;
  imgClassName: string;
  fallbackClassName: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return <div className={fallbackClassName} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={imgClassName} onError={() => setBroken(true)} />
  );
}
