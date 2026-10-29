import type { RegionId } from "@/features/region";

import { PLACE_VIEWS, type PlaceView } from "./place-views";

export type View = "events" | PlaceView;

/** 주소의 view 값을 보기로 바꾼다. 알려진 보기가 아니면 행사로 본다. */
export function parseView(value: string | undefined): View {
  return value !== undefined && Object.hasOwn(PLACE_VIEWS, value)
    ? (value as PlaceView)
    : "events";
}

/** 고른 시·도, 월, 보기(행사, 키즈카페, 키즈펜션, 가볼만한곳)가 담긴 홈 주소. 기본값인 선택 안 함과 행사 보기는 주소에 넣지 않는다. */
export function filterHref({
  regionId,
  month,
  view,
}: {
  regionId?: RegionId;
  month?: string;
  view?: View;
}): string {
  const params = new URLSearchParams();
  if (regionId) params.set("region", regionId);
  if (month) params.set("month", month);
  if (view && view !== "events") params.set("view", view);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
