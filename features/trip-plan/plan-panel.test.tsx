import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { createPlanStore, PlanPanel, PlanProvider, type PlanItem } from "@/features/trip-plan";

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

function renderPanel(items: PlanItem[] = []) {
  const store = createPlanStore(memory());
  items.forEach((item) => store.toggle(item));
  render(
    <PlanProvider store={store}>
      <PlanPanel />
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
