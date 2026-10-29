import { FestivalFetchError, type Festival } from "./festival";

const SEARCH_FESTIVAL_URL =
  "https://apis.data.go.kr/B551011/KorService2/searchFestival2";

type TourApiItem = {
  contentid: string;
  title: string;
  addr1: string;
  addr2: string;
  eventstartdate: string;
  eventenddate: string;
  lDongRegnCd: string;
};

/**
 * 한국관광공사 TourAPI 행사 조회로 오늘 진행 중이거나 앞으로 열릴 행사를 가져온다.
 * eventStartDate를 오늘로 주면 진행 중인 행사와 예정 행사가 함께 온다.
 * @param today KST 기준 YYYYMMDD
 */
export async function fetchActiveFestivals(today: string): Promise<Festival[]> {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!serviceKey) {
    throw new FestivalFetchError("DATA_GO_KR_SERVICE_KEY가 설정되지 않았습니다.");
  }

  const url = new URL(SEARCH_FESTIVAL_URL);
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("MobileOS", "ETC");
  url.searchParams.set("MobileApp", "kids-trip-finder");
  url.searchParams.set("_type", "json");
  url.searchParams.set("eventStartDate", today);
  url.searchParams.set("numOfRows", "1000");
  url.searchParams.set("pageNo", "1");

  let json;
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new FestivalFetchError(`행사 조회 API가 ${response.status} 응답을 돌려줬습니다.`);
    }
    json = await response.json();
  } catch (error) {
    if (error instanceof FestivalFetchError) throw error;
    throw new FestivalFetchError("행사 조회 API에 연결하지 못했습니다.");
  }

  if (json?.response?.header?.resultCode !== "0000") {
    throw new FestivalFetchError("행사 조회 API가 오류 응답을 돌려줬습니다.");
  }

  const items: TourApiItem[] = json.response.body.items?.item ?? [];

  return items
    .filter((item) => item.eventenddate >= today)
    .map((item) => ({
      id: item.contentid,
      title: item.title,
      startDate: item.eventstartdate,
      endDate: item.eventenddate,
      place: [item.addr1, item.addr2].filter(Boolean).join(" "),
      address: item.addr1,
      sidoCode: item.lDongRegnCd,
    }))
    .sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) ||
        a.title.localeCompare(b.title, "ko"),
    );
}
