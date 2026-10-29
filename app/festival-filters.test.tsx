import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { FestivalFilters } from "@/app/festival-filters";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const regions = [
  { value: "seoul", label: "서울" },
  { value: "busan", label: "부산" },
];

const months = [
  { value: "2026-10", label: "2026년 10월" },
  { value: "2026-11", label: "2026년 11월" },
];

describe("FestivalFilters", () => {
  test("아무것도 고르지 않았으면 전국과 전체를 보여준다", () => {
    render(<FestivalFilters regions={regions} months={months} />);

    expect(screen.getByRole("combobox", { name: "시·도" })).toHaveTextContent("전국");
    expect(screen.getByRole("combobox", { name: "월" })).toHaveTextContent("전체");
  });

  test("키즈카페를 보는 동안에는 월 드롭다운을 보여주지 않는다", () => {
    render(<FestivalFilters regions={regions} months={months} view="cafes" />);

    expect(screen.getByRole("combobox", { name: "시·도" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "월" })).toBeNull();
  });

  test("고른 시·도와 월을 보여준다", () => {
    render(
      <FestivalFilters regions={regions} months={months} regionId="busan" month="2026-11" />,
    );

    expect(screen.getByRole("combobox", { name: "시·도" })).toHaveTextContent("부산");
    expect(screen.getByRole("combobox", { name: "월" })).toHaveTextContent("2026년 11월");
  });
});
