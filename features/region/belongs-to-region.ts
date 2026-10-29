import { REGIONS, type RegionId } from "./regions";

/** 광주와 전남이 하나로 합쳐진 전남광주통합특별시의 주소 표기 */
const MERGED_GWANGJU_JEONNAM = "전남광주통합특별시";

/** 주소 첫 단어에서 쓰이는 시·도 공식 이름. 약칭과 다른 지역만 적는다. */
const OFFICIAL_NAMES: Partial<Record<RegionId, string[]>> = {
  "north-chungcheong": ["충청북도"],
  "south-chungcheong": ["충청남도"],
  "north-jeolla": ["전라북도"],
  "south-jeolla": ["전라남도"],
  "north-gyeongsang": ["경상북도"],
  "south-gyeongsang": ["경상남도"],
};

/** 주소(예: "서울 중랑구 용마산로 670")가 그 시·도에 속하는지 첫 단어로 판단한다. */
export function belongsToRegion(regionId: RegionId, address: string): boolean {
  const [head = "", district = ""] = address.trim().split(/\s+/);

  if (head === MERGED_GWANGJU_JEONNAM) {
    return regionId === (district.endsWith("구") ? "gwangju" : "south-jeolla");
  }

  const region = REGIONS.find((candidate) => candidate.id === regionId);
  if (!region || !head) return false;

  return [region.name, ...(OFFICIAL_NAMES[regionId] ?? [])].some((name) =>
    head.startsWith(name),
  );
}
