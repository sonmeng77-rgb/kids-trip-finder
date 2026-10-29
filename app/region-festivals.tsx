import {
  type Festival,
  FestivalFetchError,
  FestivalList,
  FestivalLoadError,
  fetchActiveFestivals,
  todayInSeoul,
} from "@/features/festival";
import { resolveRegion, type Region } from "@/features/region";

/** 선택한 시·도에서 진행 중이거나 예정된 행사 목록. 지역과 행사를 여기서 엮는다. */
export async function RegionFestivals({ region }: { region: Region }) {
  let festivals: Festival[];
  try {
    festivals = await fetchActiveFestivals(todayInSeoul());
  } catch (error) {
    if (error instanceof FestivalFetchError) return <FestivalLoadError />;
    throw error;
  }

  return (
    <FestivalList
      festivals={festivals.filter(
        (festival) =>
          resolveRegion({
            sidoCode: festival.sidoCode,
            address: festival.address,
          }) === region.id,
      )}
    />
  );
}
