import { Suspense } from "react";

import { FestivalListSkeleton, selectableMonths, todayInSeoul } from "@/features/festival";
import { KidsCafeRegionPrompt } from "@/features/kids-cafe";
import { findRegion, REGIONS, RegionMap } from "@/features/region";

import { FestivalFilters } from "./festival-filters";
import { filterHref, type View } from "./filter-href";
import { RegionFestivals } from "./region-festivals";
import { RegionKidsCafes } from "./region-kids-cafes";
import { ViewTabs } from "./view-tabs";

type SearchParams = { [key: string]: string | string[] | undefined };

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const region = findRegion(single(params.region));
  const months = selectableMonths(todayInSeoul());
  const selectedMonth = months.find((option) => option.value === single(params.month));
  const month = selectedMonth?.value;
  const view: View = single(params.view) === "cafes" ? "cafes" : "events";

  const heading =
    view === "cafes"
      ? `${region ? `${region.name} 지역` : "전국"} 키즈카페`
      : [selectedMonth?.label, region ? `${region.name} 지역` : "전국", "행사"]
          .filter(Boolean)
          .join(" ");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          아이와 가기 좋은 축제·행사
        </h1>
        <p className="text-muted-foreground">
          지도나 목록에서 지역을 고르고, 행사는 가려는 달을 정해 보세요. 키즈카페도 지역별로 찾아볼 수 있어요.
        </p>
      </header>

      <FestivalFilters
        regions={REGIONS.map(({ id, name }) => ({ value: id, label: name }))}
        months={months}
        regionId={region?.id}
        month={month}
        view={view}
      />

      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <RegionMap
          selectedId={region?.id}
          hrefFor={(id) => filterHref({ regionId: id, month, view })}
        />

        <section aria-labelledby="festival-heading" className="flex flex-col gap-4">
          <ViewTabs view={view} regionId={region?.id} month={month} />
          <h2 id="festival-heading" className="text-lg font-semibold">
            {heading}
          </h2>
          {view === "cafes" ? (
            region ? (
              <Suspense key={`cafes-${region.id}`} fallback={<FestivalListSkeleton />}>
                <RegionKidsCafes region={region} />
              </Suspense>
            ) : (
              <KidsCafeRegionPrompt />
            )
          ) : (
            <Suspense
              key={`events-${region?.id ?? "all"}-${month ?? "all"}`}
              fallback={<FestivalListSkeleton />}
            >
              <RegionFestivals region={region} month={month} />
            </Suspense>
          )}
        </section>
      </div>
    </main>
  );
}
