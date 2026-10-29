import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ViewTabs } from "@/app/view-tabs";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ViewTabs", () => {
  test("행사와 키즈카페 전환을 보여주고 기본은 행사다", () => {
    render(<ViewTabs view="events" />);

    expect(screen.getByRole("tab", { name: "행사" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "키즈카페" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  test("키즈카페 보기면 키즈카페 탭이 선택되어 있다", () => {
    render(<ViewTabs view="cafes" />);

    expect(screen.getByRole("tab", { name: "키즈카페" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
