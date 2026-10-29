import type { PlanItem } from "./plan-item";
import type { Pin } from "./plan-map";

const EARTH_RADIUS_METERS = 6_371_008.8;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

type Point = { lat: number; lng: number };

/** 두 좌표 사이의 직선거리(미터). 지구 표면을 따라 잰 구면 거리다. */
export function distanceMeters(a: Point, b: Point): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** 1km 미만은 미터(640m), 이상은 킬로미터 소수 첫째 자리(3.2km)로 읽기 쉽게 보여 준다. */
export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
}

export type RouteStop = { number: number; item: PlanItem; located: boolean };
export type RouteLeg = { fromNumber: number; toNumber: number; meters: number };

/**
 * 담은 순서대로 번호를 붙이고, 좌표가 있는 곳만 핀과 거리 구간으로 만든다.
 * 좌표가 없는 곳은 건너뛰고 좌표가 있는 이웃끼리 잇는다.
 */
export function summarizeRoute(items: readonly PlanItem[]) {
  const stops: RouteStop[] = items.map((item, index) => ({
    number: index + 1,
    item,
    located: item.lat !== undefined && item.lng !== undefined,
  }));

  const pins: Pin[] = stops.flatMap((stop) =>
    stop.located ? [{ lat: stop.item.lat!, lng: stop.item.lng!, number: stop.number }] : [],
  );

  const legs: RouteLeg[] = pins.slice(1).map((pin, index) => ({
    fromNumber: pins[index].number,
    toNumber: pin.number,
    meters: distanceMeters(pins[index], pin),
  }));

  return {
    stops,
    pins,
    legs,
    totalMeters: legs.reduce((sum, leg) => sum + leg.meters, 0),
  };
}
