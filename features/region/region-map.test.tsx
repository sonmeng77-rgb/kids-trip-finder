import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { RegionMap } from "@/features/region";

describe("RegionMap", () => {
  test("17개 시·도를 모두 선택할 수 있는 링크로 보여준다", () => {
    render(<RegionMap />);

    const map = screen.getByRole("navigation", { name: "대한민국 시·도 지도" });
    const links = within(map).getAllByRole("link");

    expect(links).toHaveLength(17);
    expect(within(map).getByRole("link", { name: "서울" })).toHaveAttribute(
      "href",
      "/?region=seoul",
    );
    expect(within(map).getByRole("link", { name: "제주" })).toHaveAttribute(
      "href",
      "/?region=jeju",
    );
  });

  test("각 시·도로 이동하는 주소를 바깥에서 정할 수 있다", () => {
    render(<RegionMap hrefFor={(id) => `/?region=${id}&month=2026-11`} />);

    expect(screen.getByRole("link", { name: "서울" })).toHaveAttribute(
      "href",
      "/?region=seoul&month=2026-11",
    );
  });

  test("처음에는 선택된 시·도가 없다", () => {
    render(<RegionMap />);

    expect(document.querySelector("[aria-current]")).toBeNull();
  });

  test("선택된 시·도만 현재 선택으로 표시한다", () => {
    render(<RegionMap selectedId="busan" />);

    expect(screen.getByRole("link", { name: "부산" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "서울" })).not.toHaveAttribute("aria-current");
  });
});
