import { Suspense } from "react";
import { MousePointerClickIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FestivalListSkeleton } from "@/features/festival";
import { findRegion, RegionMap } from "@/features/region";

import { RegionFestivals } from "./region-festivals";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { region: regionParam } = await searchParams;
  const region = findRegion(
    typeof regionParam === "string" ? regionParam : undefined,
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          아이와 가기 좋은 축제·행사
        </h1>
        <p className="text-muted-foreground">
          지도에서 가려는 지역을 고르면 그 지역에서 열리는 행사를 볼 수 있어요.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <RegionMap selectedId={region?.id} />

        <section aria-labelledby="festival-heading" className="flex flex-col gap-4">
          <h2 id="festival-heading" className="text-lg font-semibold">
            {region ? `${region.name} 지역 행사` : "행사"}
          </h2>
          {region ? (
            <Suspense key={region.id} fallback={<FestivalListSkeleton />}>
              <RegionFestivals region={region} />
            </Suspense>
          ) : (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MousePointerClickIcon />
                </EmptyMedia>
                <EmptyTitle>지역을 선택해 주세요</EmptyTitle>
                <EmptyDescription>
                  지도에서 시·도를 누르면 진행 중이거나 예정된 행사가 여기에 나타납니다.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </div>
    </main>
  );
}
