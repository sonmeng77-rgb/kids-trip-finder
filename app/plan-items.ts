import { formatFestivalPeriod, type Festival } from "@/features/festival";
import type { KidsPlace } from "@/features/kids-place";
import type { PlanItem } from "@/features/trip-plan";

import { PLACE_VIEWS, type PlaceView } from "./place-views";

/** 행사를 계획에 담을 항목으로 바꾼다. 담은 때의 모습 그대로 보관한다. */
export function festivalToPlanItem(festival: Festival): PlanItem {
  return {
    kind: "events",
    id: festival.id,
    kindLabel: "행사",
    name: festival.title,
    period: formatFestivalPeriod(festival),
    address: festival.place,
    lat: festival.lat,
    lng: festival.lng,
  };
}

/** 키즈카페, 키즈펜션, 가볼만한곳의 장소를 계획에 담을 항목으로 바꾼다. */
export function placeToPlanItem(place: KidsPlace, view: PlaceView): PlanItem {
  return {
    kind: view,
    id: place.id,
    kindLabel: PLACE_VIEWS[view].subject,
    name: place.name,
    address: place.address,
    phone: place.phone,
    url: place.url,
    lat: place.lat,
    lng: place.lng,
  };
}
