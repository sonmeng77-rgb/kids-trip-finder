import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  KidsCafeList,
  KidsCafeRegionPrompt,
  type KidsCafe,
} from "@/features/kids-cafe";

const cafe = (overrides: Partial<KidsCafe> = {}): KidsCafe => ({
  id: "1",
  name: "서울형키즈카페 망우본동점",
  address: "서울 중랑구 용마산로 670",
  phone: "02-123-4567",
  url: "http://place.map.kakao.com/1",
  ...overrides,
});

describe("KidsCafeList", () => {
  test("항목마다 이름, 주소, 전화번호와 카카오맵 링크를 보여준다", () => {
    render(<KidsCafeList cafes={[cafe()]} truncated={false} />);

    const item = screen.getByRole("listitem");
    expect(within(item).getByText("서울형키즈카페 망우본동점")).toBeInTheDocument();
    expect(within(item).getByText("서울 중랑구 용마산로 670")).toBeInTheDocument();
    expect(within(item).getByText("02-123-4567")).toBeInTheDocument();

    const link = within(item).getByRole("link", { name: /카카오맵에서 보기/ });
    expect(link).toHaveAttribute("href", "http://place.map.kakao.com/1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  test("전화번호가 없으면 전화번호 줄을 보여주지 않는다", () => {
    render(<KidsCafeList cafes={[cafe({ phone: undefined })]} truncated={false} />);

    expect(screen.queryByText(/\d{2,3}-\d{3,4}-\d{4}/)).toBeNull();
  });

  test("일부만 가져왔을 때만 일부만 보여요 안내를 붙인다", () => {
    const { rerender } = render(<KidsCafeList cafes={[cafe()]} truncated />);
    expect(screen.getByText(/일부만 보여요/)).toBeInTheDocument();

    rerender(<KidsCafeList cafes={[cafe()]} truncated={false} />);
    expect(screen.queryByText(/일부만 보여요/)).toBeNull();
  });

  test("키즈카페가 없으면 오류가 아닌 키즈카페 없음 안내를 보여준다", () => {
    render(<KidsCafeList cafes={[]} truncated={false} />);

    expect(screen.getByText("이 지역에서 찾은 키즈카페가 없습니다")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("KidsCafeRegionPrompt", () => {
  test("시·도를 선택하라는 안내를 보여준다", () => {
    render(<KidsCafeRegionPrompt />);

    expect(screen.getByText("시·도를 선택해 주세요")).toBeInTheDocument();
  });
});
