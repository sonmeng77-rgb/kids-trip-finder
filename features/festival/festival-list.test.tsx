import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { FestivalList, type Festival } from "@/features/festival";

const festival = (overrides: Partial<Festival>): Festival => ({
  id: "1",
  title: "시흥 갯골 축제",
  startDate: "20261030",
  endDate: "20261101",
  place: "경기도 시흥시 동서로 287 갯골생태공원",
  address: "경기도 시흥시 동서로 287",
  sidoCode: "41",
  ...overrides,
});

describe("FestivalList", () => {
  test("항목마다 축제명, 개최 기간, 장소를 보여준다", () => {
    render(<FestivalList festivals={[festival({})]} />);

    const item = screen.getByRole("listitem");
    expect(within(item).getByText("시흥 갯골 축제")).toBeInTheDocument();
    expect(within(item).getByText("2026.10.30 ~ 2026.11.01")).toBeInTheDocument();
    expect(
      within(item).getByText("경기도 시흥시 동서로 287 갯골생태공원"),
    ).toBeInTheDocument();
  });

  test("하루짜리 행사는 날짜를 한 번만 보여준다", () => {
    render(
      <FestivalList
        festivals={[festival({ startDate: "20261110", endDate: "20261110" })]}
      />,
    );

    expect(screen.getByText("2026.11.10")).toBeInTheDocument();
  });

  test("받은 순서 그대로 보여준다", () => {
    render(
      <FestivalList
        festivals={[
          festival({ id: "1", title: "먼저 열리는 축제" }),
          festival({ id: "2", title: "나중에 열리는 축제" }),
        ]}
      />,
    );

    const titles = screen.getAllByRole("listitem").map((item) => item.textContent);
    expect(titles[0]).toContain("먼저 열리는 축제");
    expect(titles[1]).toContain("나중에 열리는 축제");
  });

  test("항목마다 바깥에서 받은 동작을 그 항목으로 그려준다", () => {
    render(
      <FestivalList
        festivals={[festival({ id: "1", title: "첫째" }), festival({ id: "2", title: "둘째" })]}
        renderAction={(item) => <button type="button">담기 {item.title}</button>}
      />,
    );

    const items = screen.getAllByRole("listitem");
    expect(within(items[0]).getByRole("button", { name: "담기 첫째" })).toBeInTheDocument();
    expect(within(items[1]).getByRole("button", { name: "담기 둘째" })).toBeInTheDocument();
  });

  test("행사가 없으면 오류가 아닌 행사 없음 안내를 보여준다", () => {
    render(<FestivalList festivals={[]} />);

    expect(screen.getByText("진행 중이거나 예정된 행사가 없습니다")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
