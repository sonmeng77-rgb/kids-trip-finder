import type { RegionId } from "@/features/region";

export type View = "events" | "cafes";

/** 고른 시·도, 월, 보기(행사/키즈카페)가 담긴 홈 주소. 기본값인 선택 안 함과 행사 보기는 주소에 넣지 않는다. */
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
  if (view === "cafes") params.set("view", "cafes");
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
