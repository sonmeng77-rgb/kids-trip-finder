import type { RegionId } from "@/features/region";

/** 고른 시·도와 월이 담긴 홈 주소. 고르지 않은 값은 주소에 넣지 않는다. */
export function filterHref({
  regionId,
  month,
}: {
  regionId?: RegionId;
  month?: string;
}): string {
  const params = new URLSearchParams();
  if (regionId) params.set("region", regionId);
  if (month) params.set("month", month);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
