import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import {
  createPlanStore,
  PlanPanel,
  PlanProvider,
  type KakaoMapsApi,
  type PlanItem,
} from "@/features/trip-plan";

const cafe: PlanItem = {
  kind: "cafes",
  id: "1",
  kindLabel: "키즈카페",
  name: "서울형키즈카페 망우본동점",
  address: "서울 중랑구 용마산로 670",
  phone: "02-123-4567",
  url: "http://place.map.kakao.com/1",
};

const festival: PlanItem = {
  kind: "events",
  id: "9",
  kindLabel: "행사",
  name: "시흥 갯골 축제",
  address: "경기도 시흥시 동서로 287",
  period: "2026.10.30 ~ 2026.11.01",
};

const memory = () => {
  const data: Record<string, string> = {};
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
};

function renderPanel(
  items: PlanItem[] = [],
  props: { kakaoAppKey?: string; loadMaps?: (key: string) => Promise<KakaoMapsApi> } = {},
) {
  const store = createPlanStore(memory());
  items.forEach((item) => store.toggle(item));
  render(
    <PlanProvider store={store}>
      <PlanPanel {...props} />
    </PlanProvider>,
  );
  return store;
}

describe("PlanPanel", () => {
  test("내 계획 버튼에 담은 개수를 보여준다", () => {
    renderPanel([cafe, festival]);

    expect(screen.getByRole("button", { name: /내 계획/ })).toHaveTextContent("2");
  });

  test("비어 있으면 열었을 때 담은 곳이 없다는 안내를 보여준다", () => {
    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: /내 계획/ }));

    expect(screen.getByText("아직 담은 곳이 없어요")).toBeInTheDocument();
  });

  test("열면 담은 곳을 담은 순서대로, 종류 이름표와 정보와 함께 보여준다", () => {
    renderPanel([festival, cafe]);

    fireEvent.click(screen.getByRole("button", { name: /내 계획/ }));

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);

    expect(within(items[0]).getByText("행사")).toBeInTheDocument();
    expect(within(items[0]).getByText("시흥 갯골 축제")).toBeInTheDocument();
    expect(within(items[0]).getByText("2026.10.30 ~ 2026.11.01")).toBeInTheDocument();
    expect(within(items[0]).getByText("경기도 시흥시 동서로 287")).toBeInTheDocument();

    expect(within(items[1]).getByText("키즈카페")).toBeInTheDocument();
    expect(within(items[1]).getByText("02-123-4567")).toBeInTheDocument();
    const link = within(items[1]).getByRole("link", { name: /카카오맵에서 보기/ });
    expect(link).toHaveAttribute("href", "http://place.map.kakao.com/1");
    expect(link).toHaveAttribute("target", "_blank");
  });

  test("빼기를 누르면 그 항목이 사라지고 개수가 줄어든다", () => {
    const store = renderPanel([festival, cafe]);

    fireEvent.click(screen.getByRole("button", { name: /내 계획/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "서울형키즈카페 망우본동점 계획에서 빼기" }),
    );

    expect(store.getSnapshot().map((entry) => entry.name)).toEqual(["시흥 갯골 축제"]);
    expect(screen.queryByText("서울형키즈카페 망우본동점")).toBeNull();
    expect(screen.getByRole("heading", { name: "내 계획 (1)" })).toBeInTheDocument();
  });

  test("계획이 이 브라우저에만 저장된다는 것을 알려준다", () => {
    renderPanel([cafe]);

    fireEvent.click(screen.getByRole("button", { name: /내 계획/ }));

    expect(screen.getByText(/이 브라우저에만 저장/)).toBeInTheDocument();
  });
});

const located = (id: string, name: string, lat: number, lng: number): PlanItem => ({
  kind: "spots",
  id,
  kindLabel: "가볼만한곳",
  name,
  address: "주소 " + name,
  lat,
  lng,
});

const seoulHall = located("s", "서울시청", 37.5663, 126.9779);
const busanHall = located("b", "부산시청", 35.1796, 129.0756);
const noLocation: PlanItem = {
  kind: "cafes",
  id: "n",
  kindLabel: "키즈카페",
  name: "위치 없는 카페",
  address: "옛날에 담은 주소",
};

const open = () => fireEvent.click(screen.getByRole("button", { name: /내 계획/ }));
const neverLoads = () => new Promise<KakaoMapsApi>(() => {});

describe("PlanPanel 순서와 거리", () => {
  test("항목마다 담은 순서의 번호를 보여준다", () => {
    renderPanel([seoulHall, noLocation, busanHall], { loadMaps: neverLoads, kakaoAppKey: "k" });
    open();

    const items = screen.getAllByRole("listitem");
    expect(within(items[0]).getByText("1")).toBeInTheDocument();
    expect(within(items[1]).getByText("2")).toBeInTheDocument();
    expect(within(items[2]).getByText("3")).toBeInTheDocument();
  });

  test("맨 위 항목의 위 버튼과 맨 아래 항목의 아래 버튼은 눌리지 않는다", () => {
    renderPanel([seoulHall, busanHall], { loadMaps: neverLoads, kakaoAppKey: "k" });
    open();

    expect(screen.getByRole("button", { name: "서울시청 위로" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "서울시청 아래로" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "부산시청 아래로" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "부산시청 위로" })).toBeEnabled();
  });

  test("아래로 버튼을 누르면 순서와 번호가 바뀐다", () => {
    const store = renderPanel([seoulHall, busanHall], { loadMaps: neverLoads, kakaoAppKey: "k" });
    open();

    fireEvent.click(screen.getByRole("button", { name: "서울시청 아래로" }));

    expect(store.getSnapshot().map((entry) => entry.name)).toEqual(["부산시청", "서울시청"]);
    const items = screen.getAllByRole("listitem");
    expect(within(items[0]).getByText("부산시청")).toBeInTheDocument();
    expect(within(items[0]).getByText("1")).toBeInTheDocument();
    expect(within(items[1]).getByText("서울시청")).toBeInTheDocument();
  });

  test("이웃한 두 곳 사이의 직선거리와 총거리, 직선거리 기준 안내를 보여준다", () => {
    renderPanel([seoulHall, busanHall], { loadMaps: neverLoads, kakaoAppKey: "k" });
    open();

    const items = screen.getAllByRole("listitem");
    expect(within(items[1]).getByText(/1번에서 직선거리 325.1km/)).toBeInTheDocument();
    expect(screen.getByText(/총 직선거리 325.1km/)).toBeInTheDocument();
    expect(screen.getByText(/직선거리 기준/)).toBeInTheDocument();
  });

  test("좌표가 없는 항목은 거리에서 빠지고 좌표가 있는 이웃끼리 이어지며, 지도에 없다고 알려준다", () => {
    const store = renderPanel([seoulHall, noLocation, busanHall], {
      loadMaps: neverLoads,
      kakaoAppKey: "k",
    });
    open();

    const items = screen.getAllByRole("listitem");
    expect(within(items[1]).getByText("위치 정보가 없어 지도에 표시되지 않아요")).toBeInTheDocument();
    expect(within(items[2]).getByText(/1번에서 직선거리 325.1km/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "위치 없는 카페 아래로" }));
    expect(store.getSnapshot().map((entry) => entry.name)).toEqual(["서울시청", "부산시청", "위치 없는 카페"]);
  });

  test("좌표가 있는 곳이 하나뿐이면 거리를 보여주지 않는다", () => {
    renderPanel([seoulHall, noLocation], { loadMaps: neverLoads, kakaoAppKey: "k" });
    open();

    expect(screen.queryByText(/총 직선거리/)).toBeNull();
    expect(screen.queryByText(/에서 직선거리/)).toBeNull();
  });

  test("좌표가 있는 곳이 하나도 없으면 지도를 불러오지 않고 안내만 보여준다", () => {
    const loadMaps = vi.fn();
    renderPanel([noLocation], { loadMaps, kakaoAppKey: "k" });
    open();

    expect(screen.getByText("지도에 표시할 곳이 아직 없어요")).toBeInTheDocument();
    expect(loadMaps).not.toHaveBeenCalled();
  });

  test("좌표가 있는 곳이 있으면 키와 함께 지도를 불러온다", () => {
    const loadMaps = vi.fn(neverLoads);
    renderPanel([seoulHall], { loadMaps, kakaoAppKey: "the-key" });
    open();

    expect(loadMaps).toHaveBeenCalledWith("the-key");
  });

  test("지도 불러오기에 실패해도 목록과 순서 바꾸기는 쓸 수 있다", async () => {
    const store = renderPanel([seoulHall, busanHall], {
      loadMaps: () => Promise.reject(new Error("blocked")),
      kakaoAppKey: "k",
    });
    open();

    expect(await screen.findByText(/지도를 불러오지 못했어요/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "서울시청 아래로" }));
    expect(store.getSnapshot().map((entry) => entry.name)).toEqual(["부산시청", "서울시청"]);
  });
});
