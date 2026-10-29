import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  AddToPlanButton,
  createPlanStore,
  PlanProvider,
  type PlanItem,
} from "@/features/trip-plan";

const item: PlanItem = {
  kind: "cafes",
  id: "1",
  kindLabel: "키즈카페",
  name: "서울형키즈카페 망우본동점",
  address: "서울 중랑구 용마산로 670",
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

describe("AddToPlanButton", () => {
  test("처음에는 계획에 담기 상태다", () => {
    render(
      <PlanProvider store={createPlanStore(memory())}>
        <AddToPlanButton item={item} />
      </PlanProvider>,
    );

    const button = screen.getByRole("button", { name: /계획에 담기/ });
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  test("누르면 담았어요 상태가 되고, 다시 누르면 담기 전으로 돌아간다", () => {
    render(
      <PlanProvider store={createPlanStore(memory())}>
        <AddToPlanButton item={item} />
      </PlanProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /계획에 담기/ }));
    const added = screen.getByRole("button", { name: /담았어요/ });
    expect(added).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(added);
    expect(screen.getByRole("button", { name: /계획에 담기/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("이미 계획에 있는 곳이면 처음부터 담았어요 상태로 보인다", () => {
    const store = createPlanStore(memory());
    store.toggle(item);

    render(
      <PlanProvider store={store}>
        <AddToPlanButton item={item} />
      </PlanProvider>,
    );

    expect(screen.getByRole("button", { name: /담았어요/ })).toBeInTheDocument();
  });

  test("버튼을 어느 곳에 눌렀는지 이름으로 알 수 있다", () => {
    render(
      <PlanProvider store={createPlanStore(memory())}>
        <AddToPlanButton item={item} />
      </PlanProvider>,
    );

    expect(screen.getByRole("button", { name: /서울형키즈카페 망우본동점/ })).toBeInTheDocument();
  });
});
