import {
  fetchKidsPlaces,
  KidsPlaceFetchError,
  KidsPlaceList,
  KidsPlaceLoadError,
} from "@/features/kids-place";
import { belongsToRegion, type Region } from "@/features/region";

import { PLACE_VIEWS, type PlaceView } from "./place-views";

/**
 * 선택한 시·도의 키즈카페 또는 키즈펜션 목록. 검색 결과 중 다른 시·도 주소는 뺀다.
 * 지역과 장소를 여기서 엮는다.
 */
export async function RegionKidsPlaces({
  region,
  view,
}: {
  region: Region;
  view: PlaceView;
}) {
  const { keyword, subject, emptyTitle } = PLACE_VIEWS[view];

  let result: Awaited<ReturnType<typeof fetchKidsPlaces>>;
  try {
    result = await fetchKidsPlaces(region.name, keyword);
  } catch (error) {
    if (error instanceof KidsPlaceFetchError) return <KidsPlaceLoadError subject={subject} />;
    throw error;
  }

  return (
    <KidsPlaceList
      places={result.places.filter((place) => belongsToRegion(region.id, place.address))}
      truncated={result.truncated}
      emptyTitle={emptyTitle}
    />
  );
}
