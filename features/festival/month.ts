import type { Festival } from "./festival";

export type MonthOption = {
  /** YYYY-MM */
  value: string;
  /** 2026년 11월 */
  label: string;
};

/** today(YYYYMMDD)가 속한 달부터 count개월의 선택지 */
export function selectableMonths(today: string, count = 12): MonthOption[] {
  const startYear = Number(today.slice(0, 4));
  const startMonth = Number(today.slice(4, 6));

  return Array.from({ length: count }, (_, offset) => {
    const index = startMonth - 1 + offset;
    const year = startYear + Math.floor(index / 12);
    const month = (index % 12) + 1;
    return {
      value: `${year}-${String(month).padStart(2, "0")}`,
      label: `${year}년 ${month}월`,
    };
  });
}

/** 개최 기간이 month(YYYY-MM)와 하루라도 겹치는지 */
export function overlapsMonth(festival: Festival, month: string): boolean {
  const yyyymm = month.replace("-", "");
  return festival.startDate <= `${yyyymm}31` && festival.endDate >= `${yyyymm}01`;
}
