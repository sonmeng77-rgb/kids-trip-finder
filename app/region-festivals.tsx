import {
  type Festival,
  FestivalFetchError,
  FestivalList,
  FestivalLoadError,
  fetchActiveFestivals,
  overlapsMonth,
  todayInSeoul,
} from "@/features/festival";
import { resolveRegion, type Region } from "@/features/region";
import { AddToPlanButton } from "@/features/trip-plan";

import { festivalToPlanItem } from "./plan-items";

/**
 * 고른 시·도와 월에 맞는 진행 중이거나 예정된 행사 목록. 고르지 않은 조건은 적용하지 않는다.
 * 지역과 행사를 여기서 엮는다.
 */
export async function RegionFestivals({
  region,
  month,
}: {
  region?: Region;
  month?: string;
}) {
  let festivals: Festival[];
  try {
    festivals = await fetchActiveFestivals(todayInSeoul());
  } catch (error) {
    if (error instanceof FestivalFetchError) return <FestivalLoadError />;
    throw error;
  }

  return (
    <FestivalList
      renderAction={(festival) => <AddToPlanButton item={festivalToPlanItem(festival)} />}
      festivals={festivals.filter(
        (festival) =>
          (!region ||
            resolveRegion({
              sidoCode: festival.sidoCode,
              address: festival.address,
            }) === region.id) &&
          (!month || overlapsMonth(festival, month)),
      )}
    />
  );
}
