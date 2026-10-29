import { isPlanItem, planItemKey, type PlanItem } from "./plan-item";

const STORAGE_KEY = "kids-trip-finder:plan";

type PlanStorage = Pick<Storage, "getItem" | "setItem">;

const EMPTY: readonly PlanItem[] = [];

/** 저장소에서 계획을 읽는다. 저장소가 없거나 읽을 수 없으면 null, 내용이 깨져 있으면 빈 계획이다. */
function read(storage: PlanStorage | null): readonly PlanItem[] | null {
  if (!storage) return null;
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isPlanItem) : EMPTY;
  } catch {
    return EMPTY;
  }
}

/**
 * 계획을 보관하는 스토어. storage가 있으면 거기에 저장하고, 없거나 막혀 있으면
 * 페이지를 열어 둔 동안만 메모리에 보관한다. useSyncExternalStore와 함께 쓴다.
 */
export function createPlanStore(storage: PlanStorage | null) {
  let items = read(storage) ?? EMPTY;
  const listeners = new Set<() => void>();

  /** 다른 탭이 그 사이에 저장한 내용을 잃지 않도록, 바꾸기 직전에 저장소의 최신 계획을 읽는다. */
  function refresh() {
    items = read(storage) ?? items;
  }

  function commit(next: readonly PlanItem[]) {
    items = next;
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 저장소를 쓸 수 없어도 이 페이지에서는 계속 동작한다.
    }
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot: () => items,
    getServerSnapshot: () => EMPTY,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    toggle(item: PlanItem) {
      refresh();
      const key = planItemKey(item);
      commit(
        items.some((entry) => planItemKey(entry) === key)
          ? items.filter((entry) => planItemKey(entry) !== key)
          : [...items, item],
      );
    },
    remove(key: string) {
      refresh();
      commit(items.filter((entry) => planItemKey(entry) !== key));
    },
  };
}

export type PlanStore = ReturnType<typeof createPlanStore>;
