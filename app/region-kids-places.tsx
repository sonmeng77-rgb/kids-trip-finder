import {
  fetchKidsCafes,
  KidsCafeFetchError,
  KidsCafeList,
  KidsCafeLoadError,
} from "@/features/kids-cafe";
import { belongsToRegion, type Region } from "@/features/region";

/**
 * 선택한 시·도의 키즈카페 목록. 검색 결과 중 다른 시·도 주소는 뺀다.
 * 지역과 키즈카페를 여기서 엮는다.
 */
export async function RegionKidsCafes({ region }: { region: Region }) {
  let result: Awaited<ReturnType<typeof fetchKidsCafes>>;
  try {
    result = await fetchKidsCafes(region.name);
  } catch (error) {
    if (error instanceof KidsCafeFetchError) return <KidsCafeLoadError />;
    throw error;
  }

  return (
    <KidsCafeList
      cafes={result.cafes.filter((cafe) => belongsToRegion(region.id, cafe.address))}
      truncated={result.truncated}
    />
  );
}
