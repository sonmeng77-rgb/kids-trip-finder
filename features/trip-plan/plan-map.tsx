"use client";

import { useEffect, useRef, useState } from "react";
import { MapPinOffIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { loadKakaoMaps, type KakaoMapsApi } from "./kakao-maps";

export type Pin = { lat: number; lng: number; number: number };

type Loaded = { status: "loading" } | { status: "ready"; api: KakaoMapsApi } | { status: "error" };

/** 담은 곳을 번호 핀과, 담은 순서대로 이은 선으로 보여 주는 카카오 지도 */
export function PlanMap({
  pins,
  appKey,
  loadMaps = loadKakaoMaps,
}: {
  pins: Pin[];
  /** 카카오 JavaScript 키. 없으면 지도를 불러올 수 없다. */
  appKey?: string;
  loadMaps?: (appKey: string) => Promise<KakaoMapsApi>;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<InstanceType<KakaoMapsApi["maps"]["Map"]> | null>(null);
  const [loaded, setLoaded] = useState<Loaded>({ status: "loading" });

  useEffect(() => {
    if (!appKey) return;
    let cancelled = false;
    loadMaps(appKey)
      .then((api) => !cancelled && setLoaded({ status: "ready", api }))
      .catch(() => !cancelled && setLoaded({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [appKey, loadMaps]);

  const api = loaded.status === "ready" ? loaded.api : null;

  useEffect(() => {
    if (!api || !container.current || pins.length === 0) return;
    const { maps } = api;

    const points = pins.map((pin) => new maps.LatLng(pin.lat, pin.lng));
    // 지도는 한 번만 만들고, 핀이 바뀔 때마다 핀, 선, 범위만 다시 그린다.
    const map = (mapRef.current ??= new maps.Map(container.current, {
      center: points[0],
      level: 7,
    }));
    const bounds = new maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point));
    // 가장자리의 핀이 잘리지 않도록 사방에 여백을 둔다.
    map.setBounds(bounds, 40, 40, 40, 40);

    const overlays = pins.map((pin, index) => {
      const content = document.createElement("div");
      content.className =
        "flex size-7 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-semibold text-primary-foreground shadow";
      content.textContent = String(pin.number);
      const overlay = new maps.CustomOverlay({ position: points[index], content, yAnchor: 0.5 });
      overlay.setMap(map);
      return overlay;
    });

    const line =
      points.length > 1
        ? new maps.Polyline({
            path: points,
            strokeWeight: 4,
            strokeColor: "#2563eb",
            strokeOpacity: 0.8,
            strokeStyle: "solid",
          })
        : null;
    line?.setMap(map);

    return () => {
      overlays.forEach((overlay) => overlay.setMap(null));
      line?.setMap(null);
    };
  }, [api, pins]);

  if (!appKey || loaded.status === "error") {
    return (
      <div
        role="alert"
        className="flex items-center gap-2 rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
      >
        <MapPinOffIcon className="size-4 shrink-0" />
        지도를 불러오지 못했어요. 아래 목록은 그대로 쓸 수 있어요.
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg border">
      <div ref={container} className="size-full" />
      {loaded.status === "loading" && (
        <Skeleton
          role="status"
          aria-label="지도를 불러오는 중"
          className="absolute inset-0 rounded-none"
        />
      )}
    </div>
  );
}
