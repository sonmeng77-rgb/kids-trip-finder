import { describe, expect, test } from "vitest";

import { overlapsMonth, selectableMonths, type Festival } from "@/features/festival";

const festival = (startDate: string, endDate: string): Festival => ({
  id: "1",
  title: "축제",
  startDate,
  endDate,
  place: "서울",
  address: "서울",
  sidoCode: "11",
});

describe("selectableMonths", () => {
  test("오늘이 속한 달부터 12개월을 돌려준다", () => {
    const months = selectableMonths("20261029");

    expect(months).toHaveLength(12);
    expect(months[0]).toEqual({ value: "2026-10", label: "2026년 10월" });
    expect(months[2]).toEqual({ value: "2026-12", label: "2026년 12월" });
  });

  test("해가 바뀌어도 이어서 센다", () => {
    const months = selectableMonths("20261029");

    expect(months[3]).toEqual({ value: "2027-01", label: "2027년 1월" });
    expect(months[11]).toEqual({ value: "2027-09", label: "2027년 9월" });
  });
});

describe("overlapsMonth", () => {
  test("개최 기간이 그 달 안에 있으면 겹친다", () => {
    expect(overlapsMonth(festival("20261105", "20261107"), "2026-11")).toBe(true);
  });

  test("달 중간에 시작해 다음 달에 끝나는 행사는 두 달 모두와 겹친다", () => {
    const f = festival("20261120", "20261205");

    expect(overlapsMonth(f, "2026-11")).toBe(true);
    expect(overlapsMonth(f, "2026-12")).toBe(true);
  });

  test("몇 달에 걸친 장기 행사는 사이의 모든 달과 겹친다", () => {
    const f = festival("20260310", "20261130");

    expect(overlapsMonth(f, "2026-04")).toBe(true);
    expect(overlapsMonth(f, "2026-10")).toBe(true);
    expect(overlapsMonth(f, "2026-12")).toBe(false);
  });

  test("달의 첫날과 마지막 날에 걸친 행사도 겹친다", () => {
    expect(overlapsMonth(festival("20261031", "20261031"), "2026-10")).toBe(true);
    expect(overlapsMonth(festival("20261101", "20261101"), "2026-11")).toBe(true);
    expect(overlapsMonth(festival("20261031", "20261031"), "2026-11")).toBe(false);
  });
});
