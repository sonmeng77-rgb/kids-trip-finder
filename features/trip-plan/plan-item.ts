/** 계획에 담은 곳. 담은 때의 모습 그대로 보관하므로 다시 가져오지 않고 보여 줄 수 있다. */
export type PlanItem = {
  /** 어디서 담았는지(예: cafes). 종류와 id가 같으면 같은 곳이다. */
  kind: string;
  id: string;
  /** 종류 이름표(예: 키즈카페) */
  kindLabel: string;
  name: string;
  address: string;
  /** 행사의 개최 기간 */
  period?: string;
  phone?: string;
  url?: string;
  /** 위도·경도. 없으면 지도에 표시하지 않는다. */
  lat?: number;
  lng?: number;
};

export function planItemKey(item: Pick<PlanItem, "kind" | "id">): string {
  return `${item.kind}:${item.id}`;
}

export function isPlanItem(value: unknown): value is PlanItem {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.kind === "string" &&
    typeof candidate.id === "string" &&
    typeof candidate.kindLabel === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.address === "string" &&
    (candidate.period === undefined || typeof candidate.period === "string") &&
    (candidate.phone === undefined || typeof candidate.phone === "string") &&
    (candidate.url === undefined || typeof candidate.url === "string") &&
    (candidate.lat === undefined || typeof candidate.lat === "number") &&
    (candidate.lng === undefined || typeof candidate.lng === "number")
  );
}
