import type { ReactNode } from "react";

import {
  ExternalLinkIcon,
  InfoIcon,
  MapPinIcon,
  PhoneIcon,
  SearchXIcon,
  MousePointerClickIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import type { KidsPlace } from "./kids-place";

export function KidsPlaceList({
  places,
  truncated,
  emptyTitle,
  renderAction,
}: {
  places: KidsPlace[];
  /** 검색된 곳이 가져올 수 있는 수보다 많아 일부만 보여 주는 경우 */
  truncated: boolean;
  /** 장소가 하나도 없을 때의 안내 제목 */
  emptyTitle: string;
  /** 항목마다 덧붙일 동작(예: 계획에 담기 버튼) */
  renderAction?: (place: KidsPlace) => ReactNode;
}) {
  if (places.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>다른 시·도를 선택해 보세요.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {truncated && (
        <Alert>
          <InfoIcon />
          <AlertTitle>일부만 보여요</AlertTitle>
          <AlertDescription>
            이 지역에는 더 많은 곳이 있어요. 검색 순서대로 먼저 나온 곳만 보여 드립니다.
          </AlertDescription>
        </Alert>
      )}
      <ul className="flex flex-col gap-3">
        {places.map((place) => (
          <li key={place.id}>
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-base">{place.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-sm">
                <p className="flex items-start gap-1.5">
                  <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>{place.address}</span>
                </p>
                {place.phone && (
                  <p className="flex items-start gap-1.5">
                    <PhoneIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>{place.phone}</span>
                  </p>
                )}
                <a
                  href={place.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-1.5 font-medium underline underline-offset-4"
                >
                  카카오맵에서 보기
                  <ExternalLinkIcon className="size-4" />
                </a>
                {renderAction?.(place)}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KidsPlaceRegionPrompt() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MousePointerClickIcon />
        </EmptyMedia>
        <EmptyTitle>시·도를 선택해 주세요</EmptyTitle>
        <EmptyDescription>
          지도나 드롭다운에서 시·도를 고르면 그 지역의 목록을 볼 수 있어요.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function KidsPlaceLoadError({ subject }: { subject: string }) {
  return (
    <Alert variant="destructive">
      <TriangleAlertIcon />
      <AlertTitle>{subject} 정보를 불러오지 못했습니다</AlertTitle>
      <AlertDescription>
        잠시 후 다시 시도해 주세요. 다른 목록은 계속 볼 수 있습니다.
      </AlertDescription>
    </Alert>
  );
}
