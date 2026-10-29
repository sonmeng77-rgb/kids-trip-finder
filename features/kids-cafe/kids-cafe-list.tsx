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

import type { KidsCafe } from "./kids-cafe";

export function KidsCafeList({
  cafes,
  truncated,
}: {
  cafes: KidsCafe[];
  /** 검색된 곳이 가져올 수 있는 수보다 많아 일부만 보여 주는 경우 */
  truncated: boolean;
}) {
  if (cafes.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>이 지역에서 찾은 키즈카페가 없습니다</EmptyTitle>
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
            이 지역에는 키즈카페가 더 많아요. 검색 순서대로 먼저 나온 곳만 보여 드립니다.
          </AlertDescription>
        </Alert>
      )}
      <ul className="flex flex-col gap-3">
        {cafes.map((cafe) => (
          <li key={cafe.id}>
            <Card size="sm">
              <CardHeader>
                <CardTitle className="text-base">{cafe.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-sm">
                <p className="flex items-start gap-1.5">
                  <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>{cafe.address}</span>
                </p>
                {cafe.phone && (
                  <p className="flex items-start gap-1.5">
                    <PhoneIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>{cafe.phone}</span>
                  </p>
                )}
                <a
                  href={cafe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-1.5 font-medium underline underline-offset-4"
                >
                  카카오맵에서 보기
                  <ExternalLinkIcon className="size-4" />
                </a>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KidsCafeRegionPrompt() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MousePointerClickIcon />
        </EmptyMedia>
        <EmptyTitle>시·도를 선택해 주세요</EmptyTitle>
        <EmptyDescription>
          지도나 드롭다운에서 시·도를 고르면 그 지역의 키즈카페를 볼 수 있어요.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function KidsCafeLoadError() {
  return (
    <Alert variant="destructive">
      <TriangleAlertIcon />
      <AlertTitle>키즈카페 정보를 불러오지 못했습니다</AlertTitle>
      <AlertDescription>
        잠시 후 다시 시도해 주세요. 행사 목록은 계속 볼 수 있습니다.
      </AlertDescription>
    </Alert>
  );
}
