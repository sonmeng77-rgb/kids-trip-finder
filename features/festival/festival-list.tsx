import type { ReactNode } from "react";

import { CalendarOffIcon, MapPinIcon, TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import type { Festival } from "./festival";

/** YYYYMMDD → YYYY.MM.DD */
function formatDate(date: string) {
  return `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6, 8)}`;
}

/** 개최 기간을 2026.10.30 ~ 2026.11.01 모양으로. 하루짜리면 날짜를 한 번만 쓴다. */
export function formatFestivalPeriod(festival: Pick<Festival, "startDate" | "endDate">) {
  return festival.startDate === festival.endDate
    ? formatDate(festival.startDate)
    : `${formatDate(festival.startDate)} ~ ${formatDate(festival.endDate)}`;
}

export function FestivalList({
  festivals,
  renderAction,
}: {
  festivals: Festival[];
  /** 항목마다 덧붙일 동작(예: 계획에 담기 버튼) */
  renderAction?: (festival: Festival) => ReactNode;
}) {
  if (festivals.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarOffIcon />
          </EmptyMedia>
          <EmptyTitle>진행 중이거나 예정된 행사가 없습니다</EmptyTitle>
          <EmptyDescription>
            시·도나 월을 바꿔 보세요.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {festivals.map((festival) => (
        <li key={festival.id}>
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-base">{festival.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatFestivalPeriod(festival)}
              </p>
            </CardHeader>
            <CardContent>
              <p className="flex items-start gap-1.5 text-sm">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>{festival.place}</span>
              </p>
              {renderAction?.(festival)}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export function FestivalListSkeleton() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="행사를 불러오는 중">
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function FestivalLoadError() {
  return (
    <Alert variant="destructive">
      <TriangleAlertIcon />
      <AlertTitle>행사 정보를 불러오지 못했습니다</AlertTitle>
      <AlertDescription>
        잠시 후 다시 시도해 주세요. 지도에서 다른 지역을 계속 고를 수 있습니다.
      </AlertDescription>
    </Alert>
  );
}
