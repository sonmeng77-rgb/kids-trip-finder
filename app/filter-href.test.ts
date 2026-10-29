import { expect, test } from "vitest";

import { filterHref, parseView } from "@/app/filter-href";

test("주소의 view 값이 알려진 보기면 그대로 쓰고, 그 밖이면 행사로 본다", () => {
  expect(parseView("cafes")).toBe("cafes");
  expect(parseView("pensions")).toBe("pensions");
  expect(parseView("spots")).toBe("spots");
  expect(parseView("events")).toBe("events");
  expect(parseView("hotel")).toBe("events");
  expect(parseView("toString")).toBe("events");
  expect(parseView(undefined)).toBe("events");
});

test("가볼만한곳 보기는 view=spots로 주소에 담는다", () => {
  expect(filterHref({ view: "spots" })).toBe("/?view=spots");
  expect(filterHref({ regionId: "seoul", month: "2026-11", view: "spots" })).toBe(
    "/?region=seoul&month=2026-11&view=spots",
  );
});

test("아무것도 고르지 않으면 루트 주소를 돌려준다", () => {
  expect(filterHref({})).toBe("/");
});

test("키즈카페 보기는 주소에 담고 행사 보기는 담지 않는다", () => {
  expect(filterHref({ view: "cafes" })).toBe("/?view=cafes");
  expect(filterHref({ view: "events" })).toBe("/");
  expect(filterHref({ regionId: "seoul", month: "2026-11", view: "cafes" })).toBe(
    "/?region=seoul&month=2026-11&view=cafes",
  );
});

test("키즈펜션 보기는 view=pensions로 주소에 담는다", () => {
  expect(filterHref({ view: "pensions" })).toBe("/?view=pensions");
  expect(filterHref({ regionId: "jeju", month: "2026-11", view: "pensions" })).toBe(
    "/?region=jeju&month=2026-11&view=pensions",
  );
});

test("고른 시·도와 월을 주소에 담는다", () => {
  expect(filterHref({ regionId: "seoul" })).toBe("/?region=seoul");
  expect(filterHref({ month: "2026-11" })).toBe("/?month=2026-11");
  expect(filterHref({ regionId: "seoul", month: "2026-11" })).toBe(
    "/?region=seoul&month=2026-11",
  );
});
