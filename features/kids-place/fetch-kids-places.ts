import { KidsPlaceFetchError, type KidsPlace } from "./kids-place";

const KEYWORD_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

/** 카카오 키워드 검색은 한 쪽에 15곳, 최대 3쪽(45곳)까지만 돌려준다. */
const PAGE_SIZE = 15;
const MAX_PAGES = 3;

type KakaoDocument = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  place_url: string;
  x: string;
  y: string;
};

/** 위도·경도가 둘 다 숫자일 때만 좌표로 본다. 하나라도 비었거나 숫자가 아니면 좌표가 없다. */
function toLocation(lat: string | undefined, lng: string | undefined) {
  const parsed = { lat: lat ? Number(lat) : NaN, lng: lng ? Number(lng) : NaN };
  return Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng) ? parsed : {};
}

type KakaoPage = {
  documents: KakaoDocument[];
  meta: { is_end: boolean; total_count: number; pageable_count: number };
};

async function fetchPage(
  query: string,
  page: number,
  apiKey: string,
): Promise<KakaoPage> {
  const url = new URL(KEYWORD_SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("size", String(PAGE_SIZE));
  url.searchParams.set("page", String(page));

  try {
    const response = await fetch(url, {
      headers: { Authorization: `KakaoAK ${apiKey}` },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      throw new KidsPlaceFetchError(`장소 검색 API가 ${response.status} 응답을 돌려줬습니다.`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof KidsPlaceFetchError) throw error;
    throw new KidsPlaceFetchError("장소 검색 API에 연결하지 못했습니다.");
  }
}

/**
 * 카카오 로컬 키워드 검색으로 "<지역명> <키워드>"를 찾는다(예: 키즈카페, 키즈 펜션 숙소). 최대 45곳까지 가져오며,
 * 검색된 곳이 그보다 많으면 truncated로 알린다.
 */
export async function fetchKidsPlaces(
  regionName: string,
  keyword: string,
): Promise<{ places: KidsPlace[]; truncated: boolean }> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) {
    throw new KidsPlaceFetchError("KAKAO_REST_API_KEY가 설정되지 않았습니다.");
  }

  const query = `${regionName} ${keyword}`;
  const documents: KakaoDocument[] = [];
  let meta: KakaoPage["meta"] | undefined;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await fetchPage(query, page, apiKey);
    documents.push(...result.documents);
    meta = result.meta;
    if (result.meta.is_end) break;
  }

  return {
    places: documents.map((document) => ({
      id: document.id,
      name: document.place_name,
      address: document.road_address_name || document.address_name,
      phone: document.phone || undefined,
      url: document.place_url,
      ...toLocation(document.y, document.x),
    })),
    truncated: meta ? meta.total_count > meta.pageable_count : false,
  };
}
