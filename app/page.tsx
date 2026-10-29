import { Suspense } from "react";

import { FestivalListSkeleton, selectableMonths, todayInSeoul } from "@/features/festival";
import { KidsPlaceRegionPrompt } from "@/features/kids-place";
import { findRegion, REGIONS, RegionMap } from "@/features/region";
import { PlanPanel } from "@/features/trip-plan";

import { FestivalFilters } from "./festival-filters";
import { filterHref, parseView } from "./filter-href";
import { RegionFestivals } from "./region-festivals";
import { PLACE_VIEWS } from "./place-views";
import { RegionKidsPlaces } from "./region-kids-places";
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
  const view = parseView(single(params.view));

  const heading =
    view !== "events"
      ? `${region ? `${region.name} 지역` : "전국"} ${PLACE_VIEWS[view].subject}`
      : [selectedMonth?.label, region ? `${region.name} 지역` : "전국", "행사"]
          .filter(Boolean)
          .join(" ");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            아이와 가기 좋은 축제·행사
          </h1>
          <PlanPanel kakaoAppKey={process.env.KAKAO_JAVASCRIPT_KEY} />
        </div>
        <p className="text-muted-foreground">
          지도나 목록에서 지역을 고르고, 행사는 가려는 달을 정해 보세요. 키즈카페, 키즈펜션, 가볼만한곳도 지역별로 찾아볼 수 있어요.
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
          {view !== "events" ? (
            region ? (
              <Suspense key={`${view}-${region.id}`} fallback={<FestivalListSkeleton />}>
                <RegionKidsPlaces region={region} view={view} />
              </Suspense>
            ) : (
              <KidsPlaceRegionPrompt />
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
