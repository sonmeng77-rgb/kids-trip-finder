import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { PlanMap, type KakaoMapsApi } from "@/features/trip-plan";

function fakeKakao() {
  const log = {
    maps: [] as { container: HTMLElement }[],
    boundsPoints: [] as { lat: number; lng: number }[],
    setBounds: vi.fn(),
    overlays: [] as { position: { lat: number; lng: number }; content: HTMLElement; mapSet: unknown[] }[],
    polylines: [] as { path: { lat: number; lng: number }[]; mapSet: unknown[] }[],
  };

  class LatLng {
    constructor(
      public lat: number,
      public lng: number,
    ) {}
  }
  class LatLngBounds {
    extend(point: LatLng) {
      log.boundsPoints.push({ lat: point.lat, lng: point.lng });
    }
  }
  class KakaoMap {
    constructor(container: HTMLElement) {
      log.maps.push({ container });
    }
    setBounds = log.setBounds;
  }
  class Polyline {
    entry: (typeof log.polylines)[number];
    constructor(options: { path: LatLng[] }) {
      this.entry = { path: options.path.map(({ lat, lng }) => ({ lat, lng })), mapSet: [] };
      log.polylines.push(this.entry);
    }
    setMap(map: unknown) {
      this.entry.mapSet.push(map);
    }
  }
  class CustomOverlay {
    entry: (typeof log.overlays)[number];
    constructor(options: { position: LatLng; content: HTMLElement }) {
      this.entry = {
        position: { lat: options.position.lat, lng: options.position.lng },
        content: options.content,
        mapSet: [],
      };
      log.overlays.push(this.entry);
    }
    setMap(map: unknown) {
      this.entry.mapSet.push(map);
    }
  }

  const api = {
    maps: { Map: KakaoMap, LatLng, LatLngBounds, Polyline, CustomOverlay },
  } as unknown as KakaoMapsApi;

  return { api, log };
}

const pins = [
  { lat: 37.5663, lng: 126.9779, number: 1 },
  { lat: 35.1796, lng: 129.0756, number: 3 },
];

describe("PlanMap", () => {
  test("키가 없으면 SDK를 부르지 않고 지도 불러오기 실패 안내를 보여준다", () => {
    const loadMaps = vi.fn();

    render(<PlanMap pins={pins} loadMaps={loadMaps} />);

    expect(screen.getByText(/지도를 불러오지 못했어요/)).toBeInTheDocument();
    expect(loadMaps).not.toHaveBeenCalled();
  });

  test("SDK 불러오기가 실패하면 지도 불러오기 실패 안내를 보여준다", async () => {
    render(
      <PlanMap pins={pins} appKey="k" loadMaps={() => Promise.reject(new Error("blocked"))} />,
    );

    expect(await screen.findByText(/지도를 불러오지 못했어요/)).toBeInTheDocument();
  });

  test("불러오는 동안에는 불러오는 중 표시를 보여준다", () => {
    render(<PlanMap pins={pins} appKey="k" loadMaps={() => new Promise(() => {})} />);

    expect(screen.getByRole("status", { name: /지도를 불러오는 중/ })).toBeInTheDocument();
  });

  test("받은 번호로 번호 핀을 그리고, 담은 순서대로 이은 선과 모든 핀이 보이는 범위를 정한다", async () => {
    const { api, log } = fakeKakao();

    render(<PlanMap pins={pins} appKey="k" loadMaps={() => Promise.resolve(api)} />);

    await waitFor(() => expect(log.overlays).toHaveLength(2));
    expect(log.overlays.map((overlay) => overlay.content.textContent)).toEqual(["1", "3"]);
    expect(log.overlays.map((overlay) => overlay.position)).toEqual([
      { lat: 37.5663, lng: 126.9779 },
      { lat: 35.1796, lng: 129.0756 },
    ]);
    expect(log.polylines).toHaveLength(1);
    expect(log.polylines[0].path).toEqual([
      { lat: 37.5663, lng: 126.9779 },
      { lat: 35.1796, lng: 129.0756 },
    ]);
    expect(log.boundsPoints).toEqual([
      { lat: 37.5663, lng: 126.9779 },
      { lat: 35.1796, lng: 129.0756 },
    ]);
    // 가장자리의 핀이 잘리지 않도록 사방에 여백을 둔다.
    expect(log.setBounds).toHaveBeenCalledWith(expect.anything(), 40, 40, 40, 40);
  });

  test("핀이 하나뿐이면 이은 선을 그리지 않는다", async () => {
    const { api, log } = fakeKakao();

    render(<PlanMap pins={[pins[0]]} appKey="k" loadMaps={() => Promise.resolve(api)} />);

    await waitFor(() => expect(log.overlays).toHaveLength(1));
    expect(log.polylines).toHaveLength(0);
  });

  test("핀이 바뀌어도 지도는 하나만 만들고 다시 쓴다", async () => {
    const { api, log } = fakeKakao();
    const { rerender } = render(
      <PlanMap pins={pins} appKey="k" loadMaps={() => Promise.resolve(api)} />,
    );
    await waitFor(() => expect(log.overlays).toHaveLength(2));

    rerender(
      <PlanMap
        pins={[pins[1], pins[0]]}
        appKey="k"
        loadMaps={() => Promise.resolve(api)}
      />,
    );
    await waitFor(() => expect(log.overlays).toHaveLength(4));
    rerender(
      <PlanMap pins={[pins[0]]} appKey="k" loadMaps={() => Promise.resolve(api)} />,
    );
    await waitFor(() => expect(log.overlays).toHaveLength(5));

    expect(log.maps).toHaveLength(1);
    expect(log.setBounds).toHaveBeenCalledTimes(3);
  });

  test("핀이 바뀌면 이전 핀과 선을 지도에서 지우고 새로 그린다", async () => {
    const { api, log } = fakeKakao();
    const { rerender } = render(
      <PlanMap pins={pins} appKey="k" loadMaps={() => Promise.resolve(api)} />,
    );
    await waitFor(() => expect(log.overlays).toHaveLength(2));

    rerender(
      <PlanMap
        pins={[{ lat: 33.5, lng: 126.5, number: 1 }]}
        appKey="k"
        loadMaps={() => Promise.resolve(api)}
      />,
    );

    await waitFor(() => expect(log.overlays).toHaveLength(3));
    expect(log.overlays[0].mapSet.at(-1)).toBeNull();
    expect(log.overlays[1].mapSet.at(-1)).toBeNull();
    expect(log.polylines[0].mapSet.at(-1)).toBeNull();
    expect(log.overlays[2].content.textContent).toBe("1");
  });
});
