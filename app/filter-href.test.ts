import { expect, test } from "vitest";

import { filterHref } from "@/app/filter-href";

test("아무것도 고르지 않으면 루트 주소를 돌려준다", () => {
  expect(filterHref({})).toBe("/");
});

test("고른 시·도와 월을 주소에 담는다", () => {
  expect(filterHref({ regionId: "seoul" })).toBe("/?region=seoul");
  expect(filterHref({ month: "2026-11" })).toBe("/?month=2026-11");
  expect(filterHref({ regionId: "seoul", month: "2026-11" })).toBe(
    "/?region=seoul&month=2026-11",
  );
});
