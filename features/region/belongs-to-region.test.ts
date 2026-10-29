import { describe, expect, test } from "vitest";

import { belongsToRegion } from "@/features/region";

describe("belongsToRegion", () => {
  test("주소의 첫 단어가 약칭이든 공식 이름이든 그 시·도로 본다", () => {
    expect(belongsToRegion("seoul", "서울 중랑구 용마산로 670")).toBe(true);
    expect(belongsToRegion("seoul", "서울특별시 중랑구 용마산로 670")).toBe(true);
    expect(belongsToRegion("jeju", "제주특별자치도 제주시 애월읍 월각로 929")).toBe(true);
    expect(belongsToRegion("north-chungcheong", "충북 청주시 흥덕구 1")).toBe(true);
    expect(belongsToRegion("north-chungcheong", "충청북도 청주시 흥덕구 1")).toBe(true);
    expect(belongsToRegion("south-gyeongsang", "경상남도 창원시 성산구 1")).toBe(true);
  });

  test("다른 시·도의 주소는 속하지 않는다", () => {
    expect(belongsToRegion("seoul", "경기 부천시 원미구 석천로 188")).toBe(false);
    expect(belongsToRegion("busan", "서울 강남구 언주로107길 4")).toBe(false);
  });

  test("경기 광주시는 광주가 아니라 경기에 속한다", () => {
    expect(belongsToRegion("gwangju", "경기 광주시 경안로 1")).toBe(false);
    expect(belongsToRegion("gyeonggi", "경기 광주시 경안로 1")).toBe(true);
    expect(belongsToRegion("gwangju", "광주 광산구 첨단과기로 123")).toBe(true);
  });

  test("합쳐진 전남광주통합특별시 주소는 구로 끝나는 시·군·구면 광주, 아니면 전남이다", () => {
    expect(belongsToRegion("gwangju", "전남광주통합특별시 광산구 첨단과기로 123")).toBe(true);
    expect(belongsToRegion("south-jeolla", "전남광주통합특별시 광산구 첨단과기로 123")).toBe(false);
    expect(belongsToRegion("south-jeolla", "전남광주통합특별시 순천시 정원길 1")).toBe(true);
    expect(belongsToRegion("gwangju", "전남광주통합특별시 순천시 정원길 1")).toBe(false);
  });

  test("빈 주소는 어느 시·도에도 속하지 않는다", () => {
    expect(belongsToRegion("seoul", "")).toBe(false);
  });
});
