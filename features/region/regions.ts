export type RegionId =
  | "seoul"
  | "busan"
  | "daegu"
  | "incheon"
  | "gwangju"
  | "daejeon"
  | "ulsan"
  | "sejong"
  | "gyeonggi"
  | "gangwon"
  | "north-chungcheong"
  | "south-chungcheong"
  | "north-jeolla"
  | "south-jeolla"
  | "north-gyeongsang"
  | "south-gyeongsang"
  | "jeju";

export type Region = {
  id: RegionId;
  name: string;
  /** TourAPI 응답의 시·도 코드(lDongRegnCd) 앞 두 자리 */
  sidoCode: string;
};

export const REGIONS: readonly Region[] = [
  { id: "seoul", name: "서울", sidoCode: "11" },
  { id: "busan", name: "부산", sidoCode: "26" },
  { id: "daegu", name: "대구", sidoCode: "27" },
  { id: "incheon", name: "인천", sidoCode: "28" },
  { id: "gwangju", name: "광주", sidoCode: "29" },
  { id: "daejeon", name: "대전", sidoCode: "30" },
  { id: "ulsan", name: "울산", sidoCode: "31" },
  { id: "sejong", name: "세종", sidoCode: "36" },
  { id: "gyeonggi", name: "경기", sidoCode: "41" },
  { id: "gangwon", name: "강원", sidoCode: "51" },
  { id: "north-chungcheong", name: "충북", sidoCode: "43" },
  { id: "south-chungcheong", name: "충남", sidoCode: "44" },
  { id: "north-jeolla", name: "전북", sidoCode: "52" },
  { id: "south-jeolla", name: "전남", sidoCode: "46" },
  { id: "north-gyeongsang", name: "경북", sidoCode: "47" },
  { id: "south-gyeongsang", name: "경남", sidoCode: "48" },
  { id: "jeju", name: "제주", sidoCode: "50" },
];

export function findRegion(id: string | undefined): Region | undefined {
  return REGIONS.find((region) => region.id === id);
}
