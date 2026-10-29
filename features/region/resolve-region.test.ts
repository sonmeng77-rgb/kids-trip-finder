import { describe, expect, test } from "vitest";

import { resolveRegion } from "@/features/region";

describe("resolveRegion", () => {
  test("시·도 코드로 지도의 시·도를 찾는다", () => {
    expect(
      resolveRegion({ sidoCode: "26", address: "부산광역시 해운대구 APEC로 30 (우동)" }),
    ).toBe("busan");
    expect(
      resolveRegion({ sidoCode: "41", address: "경기도 양주시 광적면 삼일로 52" }),
    ).toBe("gyeonggi");
    expect(
      resolveRegion({ sidoCode: "51", address: "강원특별자치도 원주시 지정면 소금산길 12" }),
    ).toBe("gangwon");
  });

  test("세종처럼 5자리로 오는 코드는 앞 두 자리로 시·도를 찾는다", () => {
    expect(
      resolveRegion({ sidoCode: "36110", address: "세종특별자치시 중앙공원로 60 (세종동)" }),
    ).toBe("sejong");
  });

  test("광주와 전남이 합쳐진 코드는 주소의 시·군·구가 구로 끝나면 광주로 본다", () => {
    expect(
      resolveRegion({ sidoCode: "12", address: "전남광주통합특별시 광산구 첨단과기로 123" }),
    ).toBe("gwangju");
  });

  test("광주와 전남이 합쳐진 코드는 그 밖의 시·군이면 전남으로 본다", () => {
    expect(
      resolveRegion({ sidoCode: "12", address: "전남광주통합특별시 고흥군 풍양면 한동리" }),
    ).toBe("south-jeolla");
    expect(
      resolveRegion({ sidoCode: "12", address: "전남광주통합특별시 순천시 정원길 1" }),
    ).toBe("south-jeolla");
  });

  test("알 수 없는 코드나 빈 코드는 어느 시·도에도 속하지 않는다", () => {
    expect(resolveRegion({ sidoCode: "99", address: "어딘가" })).toBeNull();
    expect(resolveRegion({ sidoCode: "", address: "" })).toBeNull();
  });
});
