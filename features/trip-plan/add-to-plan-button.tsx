"use client";

import { CheckIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { PlanItem } from "./plan-item";
import { usePlan } from "./plan-provider";

/** 목록 항목에서 그 곳을 계획에 담거나 빼는 버튼 */
export function AddToPlanButton({ item }: { item: PlanItem }) {
  const { has, toggle } = usePlan();
  const added = has(item);

  return (
    <Button
      type="button"
      size="sm"
      variant={added ? "secondary" : "outline"}
      aria-pressed={added}
      aria-label={`${item.name} ${added ? "담았어요" : "계획에 담기"}`}
      onClick={() => toggle(item)}
    >
      {added ? <CheckIcon /> : <PlusIcon />}
      {added ? "담았어요" : "계획에 담기"}
    </Button>
  );
}
