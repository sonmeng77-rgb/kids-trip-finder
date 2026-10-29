import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  KidsPlaceList,
  KidsPlaceRegionPrompt,
  type KidsPlace,
} from "@/features/kids-place";

const place = (overrides: Partial<KidsPlace> = {}): KidsPlace => ({
  id: "1",
  name: "서울형키즈카페 망우본동점",
  address: "서울 중랑구 용마산로 670",
  phone: "02-123-4567",
  url: "http://place.map.kakao.com/1",
  ...overrides,
});

const emptyTitle = "이 지역에서 찾은 키즈펜션이 없습니다";

describe("KidsPlaceList", () => {
  test("항목마다 이름, 주소, 전화번호와 카카오맵 링크를 보여준다", () => {
    render(<KidsPlaceList places={[place()]} truncated={false} emptyTitle={emptyTitle} />);

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
    render(
      <KidsPlaceList
        places={[place({ phone: undefined })]}
        truncated={false}
        emptyTitle={emptyTitle}
      />,
    );

    expect(screen.queryByText(/\d{2,3}-\d{3,4}-\d{4}/)).toBeNull();
  });

  test("일부만 가져왔을 때만 일부만 보여요 안내를 붙인다", () => {
    const { rerender } = render(
      <KidsPlaceList places={[place()]} truncated emptyTitle={emptyTitle} />,
    );
    expect(screen.getByText(/일부만 보여요/)).toBeInTheDocument();

    rerender(<KidsPlaceList places={[place()]} truncated={false} emptyTitle={emptyTitle} />);
    expect(screen.queryByText(/일부만 보여요/)).toBeNull();
  });

  test("장소가 없으면 오류가 아닌 받은 문구로 없음 안내를 보여준다", () => {
    render(<KidsPlaceList places={[]} truncated={false} emptyTitle={emptyTitle} />);

    expect(screen.getByText("이 지역에서 찾은 키즈펜션이 없습니다")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("KidsPlaceRegionPrompt", () => {
  test("시·도를 선택하라는 안내를 보여준다", () => {
    render(<KidsPlaceRegionPrompt />);

    expect(screen.getByText("시·도를 선택해 주세요")).toBeInTheDocument();
  });
});
