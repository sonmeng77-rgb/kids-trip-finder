"use client";

import { useMemo } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClipboardListIcon,
  ExternalLinkIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import type { KakaoMapsApi } from "./kakao-maps";
import { planItemKey } from "./plan-item";
import { PlanMap } from "./plan-map";
import { usePlan } from "./plan-provider";
import { formatDistance, summarizeRoute } from "./route";

/** "내 계획(개수)" 버튼과, 누르면 열리는 지도와 담은 곳 목록(순서, 거리) */
export function PlanPanel({
  kakaoAppKey,
  loadMaps,
}: {
  /** 카카오 JavaScript 키. 지도를 그리는 데 쓴다. */
  kakaoAppKey?: string;
  loadMaps?: (appKey: string) => Promise<KakaoMapsApi>;
}) {
  const { items, move, remove } = usePlan();
  const route = useMemo(() => summarizeRoute(items), [items]);
  const legByEnd = new Map(route.legs.map((leg) => [leg.toNumber, leg]));

  return (
    <Sheet>
      <SheetTrigger render={<Button type="button" variant="outline" />}>
        <ClipboardListIcon />
        내 계획
        <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
          {items.length}
        </span>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader>
          <SheetTitle>내 계획 ({items.length})</SheetTitle>
          <SheetDescription>
            계획은 이 브라우저에만 저장돼요. 다른 기기에서는 보이지 않습니다.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              아직 담은 곳이 없어요
            </p>
          ) : (
            <>
              {route.pins.length > 0 ? (
                <PlanMap pins={route.pins} appKey={kakaoAppKey} loadMaps={loadMaps} />
              ) : (
                <p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
                  지도에 표시할 곳이 아직 없어요
                </p>
              )}

              {route.legs.length > 0 && (
                <div className="flex flex-col gap-0.5 text-sm">
                  <p className="font-medium">
                    총 직선거리 {formatDistance(route.totalMeters)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    직선거리 기준이에요. 실제 이동 거리는 더 길 수 있어요.
                  </p>
                </div>
              )}

              <ul className="flex flex-col gap-3">
                {route.stops.map(({ number, item, located }) => {
                  const leg = legByEnd.get(number);
                  return (
                    <li
                      key={planItemKey(item)}
                      className="flex flex-col gap-1.5 rounded-lg border p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {number}
                          </span>
                          <div className="flex flex-col gap-1">
                            <span className="w-fit rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                              {item.kindLabel}
                            </span>
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </div>
                        <div className="flex shrink-0">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`${item.name} 위로`}
                            disabled={number === 1}
                            onClick={() => move(planItemKey(item), "up")}
                          >
                            <ArrowUpIcon />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`${item.name} 아래로`}
                            disabled={number === route.stops.length}
                            onClick={() => move(planItemKey(item), "down")}
                          >
                            <ArrowDownIcon />
                          </Button>
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
                      </div>
                      {leg && (
                        <p className="text-xs font-medium text-blue-600">
                          {leg.fromNumber}번에서 직선거리 {formatDistance(leg.meters)}
                        </p>
                      )}
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
                      {!located && (
                        <p className="text-xs text-muted-foreground">
                          위치 정보가 없어 지도에 표시되지 않아요
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
