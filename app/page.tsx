import { Suspense } from "react";

import { FestivalListSkeleton, selectableMonths, todayInSeoul } from "@/features/festival";
import { findRegion, REGIONS, RegionMap } from "@/features/region";

import { FestivalFilters } from "./festival-filters";
import { filterHref } from "./filter-href";
import { RegionFestivals } from "./region-festivals";

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

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          아이와 가기 좋은 축제·행사
        </h1>
        <p className="text-muted-foreground">
          지도나 목록에서 지역을 고르고, 가려는 달을 정하면 그 시기에 열리는 행사를 볼 수 있어요.
        </p>
      </header>

      <FestivalFilters
        regions={REGIONS.map(({ id, name }) => ({ value: id, label: name }))}
        months={months}
        regionId={region?.id}
        month={month}
      />

      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <RegionMap
          selectedId={region?.id}
          hrefFor={(id) => filterHref({ regionId: id, month })}
        />

        <section aria-labelledby="festival-heading" className="flex flex-col gap-4">
          <h2 id="festival-heading" className="text-lg font-semibold">
            {[selectedMonth?.label, region ? `${region.name} 지역` : "전국", "행사"]
              .filter(Boolean)
              .join(" ")}
          </h2>
          <Suspense
            key={`${region?.id ?? "all"}-${month ?? "all"}`}
            fallback={<FestivalListSkeleton />}
          >
            <RegionFestivals region={region} month={month} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
