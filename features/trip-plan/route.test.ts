import { describe, expect, test } from "vitest";

import { distanceMeters, formatDistance, summarizeRoute, type PlanItem } from "@/features/trip-plan";

const item = (id: string, overrides: Partial<PlanItem> = {}): PlanItem => ({
  kind: "cafes",
  id,
  kindLabel: "키즈카페",
  name: `장소 ${id}`,
  address: "주소",
  ...overrides,
});

const within = (actual: number, expected: number, ratio = 0.01) =>
  Math.abs(actual - expected) <= expected * ratio;

describe("distanceMeters", () => {
  test("서울시청과 부산시청 사이는 알려진 직선거리와 1% 이내로 맞는다", () => {
    // 구면 코사인 법칙으로 따로 계산한 값(약 325km)
    const meters = distanceMeters(
      { lat: 37.5663, lng: 126.9779 },
      { lat: 35.1796, lng: 129.0756 },
    );

    expect(within(meters, 325_000)).toBe(true);
  });

  test("위도 1도 차이는 약 111km다", () => {
    expect(within(distanceMeters({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }), 111_195)).toBe(true);
  });

  test("같은 지점이면 0이고, 방향을 바꿔도 같다", () => {
    const a = { lat: 37.5, lng: 127 };
    const b = { lat: 37.6, lng: 127.1 };

    expect(distanceMeters(a, a)).toBe(0);
    expect(distanceMeters(a, b)).toBeCloseTo(distanceMeters(b, a), 6);
  });
});

describe("formatDistance", () => {
  test("1km 미만은 미터로, 이상은 킬로미터 소수 첫째 자리로 보여준다", () => {
    expect(formatDistance(640)).toBe("640m");
    expect(formatDistance(999.4)).toBe("999m");
    expect(formatDistance(1000)).toBe("1.0km");
    expect(formatDistance(3249)).toBe("3.2km");
    expect(formatDistance(325_400)).toBe("325.4km");
  });
});

describe("summarizeRoute", () => {
  const seoul = { lat: 37.5663, lng: 126.9779 };
  const busan = { lat: 35.1796, lng: 129.0756 };

  test("좌표가 있는 곳에 담은 순서의 번호를 붙여 핀으로 돌려준다", () => {
    const { pins } = summarizeRoute([
      item("a", seoul),
      item("b", busan),
    ]);

    expect(pins).toEqual([
      { ...seoul, number: 1 },
      { ...busan, number: 2 },
    ]);
  });

  test("이웃한 두 곳마다 거리를 구하고 총거리는 그 합이다", () => {
    const daegu = { lat: 35.8714, lng: 128.6014 };
    const { legs, totalMeters } = summarizeRoute([
      item("a", seoul),
      item("b", daegu),
      item("c", busan),
    ]);

    expect(legs.map((leg) => [leg.fromNumber, leg.toNumber])).toEqual([
      [1, 2],
      [2, 3],
    ]);
    expect(totalMeters).toBeCloseTo(legs[0].meters + legs[1].meters, 6);
  });

  test("좌표가 없는 곳은 지도와 거리에서 빠지고, 좌표가 있는 이웃끼리 이어진다", () => {
    const { pins, legs, stops } = summarizeRoute([
      item("a", seoul),
      item("no-location"),
      item("c", busan),
    ]);

    expect(pins.map((pin) => pin.number)).toEqual([1, 3]);
    expect(legs).toHaveLength(1);
    expect(legs[0]).toMatchObject({ fromNumber: 1, toNumber: 3 });
    expect(stops.map((stop) => [stop.number, stop.located])).toEqual([
      [1, true],
      [2, false],
      [3, true],
    ]);
  });

  test("좌표가 있는 곳이 하나뿐이면 거리 구간이 없다", () => {
    const { pins, legs, totalMeters } = summarizeRoute([item("a", seoul), item("b")]);

    expect(pins).toHaveLength(1);
    expect(legs).toEqual([]);
    expect(totalMeters).toBe(0);
  });

  test("비어 있으면 핀도 구간도 없다", () => {
    expect(summarizeRoute([])).toEqual({ stops: [], pins: [], legs: [], totalMeters: 0 });
  });
});
