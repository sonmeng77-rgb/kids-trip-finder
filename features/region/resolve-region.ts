import { REGIONS, type RegionId } from "./regions";

/** 광주와 전남이 하나로 합쳐진 전남광주통합특별시의 시·도 코드 */
const MERGED_GWANGJU_JEONNAM_CODE = "12";

export function resolveRegion({
  sidoCode,
  address,
}: {
  sidoCode: string;
  address: string;
}): RegionId | null {
  const code = sidoCode.slice(0, 2);

  if (code === MERGED_GWANGJU_JEONNAM_CODE) {
    const district = address.trim().split(/\s+/)[1] ?? "";
    return district.endsWith("구") ? "gwangju" : "south-jeolla";
  }

  return REGIONS.find((region) => region.sidoCode === code)?.id ?? null;
}
