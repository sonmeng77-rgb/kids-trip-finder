import { expect, test } from "vitest";

import { todayInSeoul } from "@/features/festival";

test("한국 시간 기준 날짜를 YYYYMMDD로 돌려준다", () => {
  // UTC로는 아직 10월 28일 16:00이지만 한국에서는 이미 10월 29일 새벽 1시다.
  expect(todayInSeoul(new Date("2026-10-28T16:00:00Z"))).toBe("20261029");
  expect(todayInSeoul(new Date("2026-10-28T14:59:00Z"))).toBe("20261028");
});
