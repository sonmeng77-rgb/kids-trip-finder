"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { planItemKey, type PlanItem } from "./plan-item";
import { createPlanStore, type PlanStore } from "./plan-store";

const PlanContext = createContext<PlanStore | null>(null);

function browserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** 계획 스토어를 아래 화면에 나눠 준다. store를 주지 않으면 이 브라우저의 localStorage를 쓴다. */
export function PlanProvider({
  store,
  children,
}: {
  store?: PlanStore;
  children: ReactNode;
}) {
  const [browserStore] = useState(() => createPlanStore(browserStorage()));
  return <PlanContext value={store ?? browserStore}>{children}</PlanContext>;
}

export function usePlan() {
  const store = useContext(PlanContext);
  if (!store) throw new Error("usePlan은 PlanProvider 안에서만 쓸 수 있습니다.");

  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return {
    items,
    has: (item: Pick<PlanItem, "kind" | "id">) =>
      items.some((entry) => planItemKey(entry) === planItemKey(item)),
    toggle: store.toggle,
    remove: store.remove,
  };
}
