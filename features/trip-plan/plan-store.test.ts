import { describe, expect, test, vi } from "vitest";

import { createPlanStore, type PlanItem } from "@/features/trip-plan";

const item = (overrides: Partial<PlanItem> = {}): PlanItem => ({
  kind: "cafes",
  id: "1",
  kindLabel: "키즈카페",
  name: "서울형키즈카페 망우본동점",
  address: "서울 중랑구 용마산로 670",
  phone: "02-123-4567",
  url: "http://place.map.kakao.com/1",
  ...overrides,
});

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

describe("createPlanStore", () => {
  test("처음에는 비어 있다", () => {
    expect(createPlanStore(memoryStorage()).getSnapshot()).toEqual([]);
  });

  test("toggle로 담고 다시 toggle하면 뺀다", () => {
    const store = createPlanStore(memoryStorage());

    store.toggle(item());
    expect(store.getSnapshot()).toEqual([item()]);

    store.toggle(item());
    expect(store.getSnapshot()).toEqual([]);
  });

  test("담은 순서대로 보관한다", () => {
    const store = createPlanStore(memoryStorage());

    store.toggle(item({ id: "b", name: "둘째" }));
    store.toggle(item({ id: "a", name: "첫째" }));

    expect(store.getSnapshot().map((entry) => entry.name)).toEqual(["둘째", "첫째"]);
  });

  test("종류와 고유 번호가 같으면 한 번만 들어가고, 종류가 다르면 다른 곳으로 본다", () => {
    const store = createPlanStore(memoryStorage());

    store.toggle(item({ kind: "cafes", id: "7" }));
    store.toggle(item({ kind: "spots", id: "7", kindLabel: "가볼만한곳" }));

    expect(store.getSnapshot()).toHaveLength(2);
    store.toggle(item({ kind: "cafes", id: "7" }));
    expect(store.getSnapshot().map((entry) => entry.kind)).toEqual(["spots"]);
  });

  test("remove로 키가 가리키는 항목만 뺀다", () => {
    const store = createPlanStore(memoryStorage());
    store.toggle(item({ id: "1" }));
    store.toggle(item({ id: "2" }));

    store.remove("cafes:1");

    expect(store.getSnapshot().map((entry) => entry.id)).toEqual(["2"]);
  });

  test("담은 계획을 저장소에 쓰고, 같은 저장소로 만든 새 스토어가 그대로 읽는다", () => {
    const storage = memoryStorage();
    createPlanStore(storage).toggle(item());

    expect(createPlanStore(storage).getSnapshot()).toEqual([item()]);
  });

  test("같은 저장소를 쓰는 다른 스토어(다른 탭)가 먼저 담은 곳을 덮어쓰지 않는다", () => {
    const storage = memoryStorage();
    const tabA = createPlanStore(storage);
    const tabB = createPlanStore(storage);

    tabA.toggle(item({ id: "a", name: "A 탭에서 담음" }));
    tabB.toggle(item({ id: "b", name: "B 탭에서 담음" }));

    expect(tabB.getSnapshot().map((entry) => entry.name)).toEqual([
      "A 탭에서 담음",
      "B 탭에서 담음",
    ]);
    expect(createPlanStore(storage).getSnapshot()).toHaveLength(2);
  });

  test("다른 탭이 담은 곳을 이 탭에서 빼도 나머지는 그대로 남는다", () => {
    const storage = memoryStorage();
    const tabA = createPlanStore(storage);
    const tabB = createPlanStore(storage);
    tabA.toggle(item({ id: "a" }));
    tabA.toggle(item({ id: "b" }));

    tabB.remove("cafes:a");

    expect(createPlanStore(storage).getSnapshot().map((entry) => entry.id)).toEqual(["b"]);
  });

  test("바뀌면 구독자에게 알리고, 구독을 풀면 알리지 않는다", () => {
    const store = createPlanStore(memoryStorage());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.toggle(item());
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.toggle(item());
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("바뀌지 않았다면 같은 스냅샷 객체를 돌려준다", () => {
    const store = createPlanStore(memoryStorage());
    store.toggle(item());

    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  test("저장소가 없어도 오류 없이 그 순간에는 담고 뺄 수 있다", () => {
    const store = createPlanStore(null);

    store.toggle(item());
    expect(store.getSnapshot()).toEqual([item()]);

    store.remove("cafes:1");
    expect(store.getSnapshot()).toEqual([]);
  });

  test("저장소가 읽기와 쓰기에서 오류를 던져도 오류 없이 동작한다", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    const store = createPlanStore(broken);

    expect(store.getSnapshot()).toEqual([]);
    store.toggle(item());
    expect(store.getSnapshot()).toEqual([item()]);
  });

  test("저장된 내용이 깨져 있으면 빈 계획으로 시작한다", () => {
    const store = createPlanStore(
      memoryStorage({ "kids-trip-finder:plan": "{not json" }),
    );

    expect(store.getSnapshot()).toEqual([]);
  });

  test("저장된 내용이 목록이 아니거나 항목 모양이 틀리면 그 항목은 버린다", () => {
    const valid = JSON.stringify([item(), { foo: "bar" }, null]);
    expect(
      createPlanStore(memoryStorage({ "kids-trip-finder:plan": valid })).getSnapshot(),
    ).toEqual([item()]);

    expect(
      createPlanStore(
        memoryStorage({ "kids-trip-finder:plan": JSON.stringify({ items: [] }) }),
      ).getSnapshot(),
    ).toEqual([]);
  });

  test("서버에서는 항상 빈 계획을 돌려준다", () => {
    const store = createPlanStore(memoryStorage());
    store.toggle(item());

    expect(store.getServerSnapshot()).toEqual([]);
  });
});
