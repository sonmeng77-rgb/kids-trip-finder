"use client";

import { ClipboardListIcon, ExternalLinkIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { planItemKey } from "./plan-item";
import { usePlan } from "./plan-provider";

/** "내 계획(개수)" 버튼과, 누르면 열리는 담은 곳 목록 */
export function PlanPanel() {
  const { items, remove } = usePlan();

  return (
    <Sheet>
      <SheetTrigger render={<Button type="button" variant="outline" />}>
        <ClipboardListIcon />
        내 계획
        <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
          {items.length}
        </span>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>내 계획 ({items.length})</SheetTitle>
          <SheetDescription>
            계획은 이 브라우저에만 저장돼요. 다른 기기에서는 보이지 않습니다.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              아직 담은 곳이 없어요
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={planItemKey(item)}
                  className="flex flex-col gap-1.5 rounded-lg border p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="w-fit rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {item.kindLabel}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`${item.name} 계획에서 빼기`}
                      onClick={() => remove(planItemKey(item))}
                    >
                      <XIcon />
                    </Button>
                  </div>
                  {item.period && <p className="text-muted-foreground">{item.period}</p>}
                  <p>{item.address}</p>
                  {item.phone && <p>{item.phone}</p>}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-fit items-center gap-1.5 font-medium underline underline-offset-4"
                    >
                      카카오맵에서 보기
                      <ExternalLinkIcon className="size-4" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
