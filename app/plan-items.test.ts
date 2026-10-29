import { expect, test } from "vitest";

import { festivalToPlanItem, placeToPlanItem } from "@/app/plan-items";

test("행사를 이름, 개최 기간, 장소가 담긴 계획 항목으로 바꾼다", () => {
  expect(
    festivalToPlanItem({
      id: "9",
      title: "시흥 갯골 축제",
      startDate: "20261030",
      endDate: "20261101",
      place: "경기도 시흥시 동서로 287 갯골생태공원",
      address: "경기도 시흥시 동서로 287",
      sidoCode: "41",
      lat: 37.3,
      lng: 126.8,
    }),
  ).toEqual({
    kind: "events",
    id: "9",
    kindLabel: "행사",
    name: "시흥 갯골 축제",
    period: "2026.10.30 ~ 2026.11.01",
    address: "경기도 시흥시 동서로 287 갯골생태공원",
    lat: 37.3,
    lng: 126.8,
  });
});

test("하루짜리 행사의 기간은 날짜를 한 번만 담는다", () => {
  const item = festivalToPlanItem({
    id: "1",
    title: "하루 축제",
    startDate: "20261110",
    endDate: "20261110",
    place: "서울",
    address: "서울",
    sidoCode: "11",
  });

  expect(item.period).toBe("2026.11.10");
});

test("장소를 보기의 이름표와 함께 계획 항목으로 바꾼다", () => {
  const place = {
    id: "5",
    name: "제주하늘키즈펜션",
    address: "제주특별자치도 제주시 1",
    phone: "064-111-2222",
    url: "http://place.map.kakao.com/5",
    lat: 33.45,
    lng: 126.57,
  };

  expect(placeToPlanItem(place, "pensions")).toEqual({
    kind: "pensions",
    id: "5",
    kindLabel: "키즈펜션",
    name: "제주하늘키즈펜션",
    address: "제주특별자치도 제주시 1",
    phone: "064-111-2222",
    url: "http://place.map.kakao.com/5",
    lat: 33.45,
    lng: 126.57,
  });
  expect(placeToPlanItem(place, "spots").kindLabel).toBe("가볼만한곳");
  expect(placeToPlanItem(place, "cafes").kindLabel).toBe("키즈카페");
});

test("전화번호가 없는 장소는 전화번호 없이 담는다", () => {
  const item = placeToPlanItem(
    { id: "6", name: "이름", address: "주소", url: "http://x" },
    "cafes",
  );

  expect(item.phone).toBeUndefined();
});
