import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fetchKidsPlaces, KidsPlaceFetchError } from "@/features/kids-place";

function doc(overrides: Record<string, string> = {}) {
  return {
    id: "1",
    place_name: "서울형키즈카페 망우본동점",
    address_name: "서울 중랑구 망우본동 1",
    road_address_name: "서울 중랑구 용마산로 670",
    phone: "02-123-4567",
    place_url: "http://place.map.kakao.com/1",
    x: "127.0916",
    y: "37.5995",
    ...overrides,
  };
}

function page(
  docs: unknown[],
  meta: { is_end: boolean; total_count?: number; pageable_count?: number },
) {
  return Response.json({
    documents: docs,
    meta: {
      is_end: meta.is_end,
      total_count: meta.total_count ?? docs.length,
      pageable_count: meta.pageable_count ?? docs.length,
    },
  });
}

describe("fetchKidsPlaces", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("KAKAO_REST_API_KEY", "test-key");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  test("지역명으로 키즈카페를 검색해 이름, 주소, 전화번호, 카카오맵 링크를 돌려준다", async () => {
    fetchMock.mockResolvedValueOnce(page([doc()], { is_end: true }));

    const { places } = await fetchKidsPlaces("서울", "키즈카페");

    const request = fetchMock.mock.calls[0];
    const url = new URL(String(request[0]));
    expect(url.searchParams.get("query")).toBe("서울 키즈카페");
    expect(url.searchParams.get("page")).toBe("1");
    expect(request[1].headers.Authorization).toBe("KakaoAK test-key");

    expect(places).toEqual([
      {
        id: "1",
        name: "서울형키즈카페 망우본동점",
        address: "서울 중랑구 용마산로 670",
        phone: "02-123-4567",
        url: "http://place.map.kakao.com/1",
        lat: 37.5995,
        lng: 127.0916,
      },
    ]);
  });

  test("검색어의 키워드에 따라 지역명 뒤에 그 키워드를 붙여 검색한다", async () => {
    fetchMock.mockResolvedValueOnce(page([doc()], { is_end: true }));

    await fetchKidsPlaces("제주", "키즈 펜션 숙소");

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get("query")).toBe("제주 키즈 펜션 숙소");
  });

  test("좌표가 비어 있거나 숫자가 아니면 좌표 없이 돌려준다", async () => {
    fetchMock.mockResolvedValueOnce(
      page([doc({ id: "1", x: "", y: "" }), doc({ id: "2", x: "abc", y: "37.5" })], { is_end: true }),
    );

    const { places } = await fetchKidsPlaces("서울", "키즈카페");

    expect(places.map((place) => place.lat)).toEqual([undefined, undefined]);
    expect(places.map((place) => place.lng)).toEqual([undefined, undefined]);
  });

  test("도로명 주소가 없으면 지번 주소를 쓰고, 전화번호가 없으면 비워 둔다", async () => {
    fetchMock.mockResolvedValueOnce(
      page([doc({ road_address_name: "", phone: "" })], { is_end: true }),
    );

    const { places } = await fetchKidsPlaces("서울", "키즈카페");

    expect(places[0].address).toBe("서울 중랑구 망우본동 1");
    expect(places[0].phone).toBeUndefined();
  });

  test("마지막 쪽이 아니면 다음 쪽을 이어서 가져오고 마지막 쪽에서 멈춘다", async () => {
    fetchMock
      .mockResolvedValueOnce(page([doc({ id: "1" })], { is_end: false }))
      .mockResolvedValueOnce(page([doc({ id: "2" })], { is_end: true }));

    const { places } = await fetchKidsPlaces("서울", "키즈카페");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(new URL(String(fetchMock.mock.calls[1][0])).searchParams.get("page")).toBe("2");
    expect(places.map((place) => place.id)).toEqual(["1", "2"]);
  });

  test("끝이 아니어도 3쪽까지만 가져온다", async () => {
    fetchMock.mockImplementation(async () =>
      page([doc()], { is_end: false, total_count: 498, pageable_count: 45 }),
    );

    await fetchKidsPlaces("서울", "키즈카페");

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  test("검색된 곳이 가져올 수 있는 수보다 많으면 일부만 가져온 것으로 알린다", async () => {
    fetchMock.mockImplementation(async () =>
      page([doc()], { is_end: true, total_count: 498, pageable_count: 45 }),
    );

    await expect(fetchKidsPlaces("서울", "키즈카페")).resolves.toMatchObject({ truncated: true });
  });

  test("검색된 곳을 모두 가져왔으면 일부만 가져온 것이 아니다", async () => {
    fetchMock.mockResolvedValueOnce(
      page([doc()], { is_end: true, total_count: 30, pageable_count: 30 }),
    );

    await expect(fetchKidsPlaces("서울", "키즈카페")).resolves.toMatchObject({ truncated: false });
  });
});

describe("fetchKidsPlaces 실패", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("KAKAO_REST_API_KEY", "test-key");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  test("API가 거부하면 KidsPlaceFetchError로 실패하고 키는 메시지에 담기지 않는다", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ errorType: "NotAuthorizedError", message: "disabled" }, { status: 403 }),
    );

    const failure = await fetchKidsPlaces("서울", "키즈카페").catch((error) => error);

    expect(failure).toBeInstanceOf(KidsPlaceFetchError);
    expect(failure.message).not.toContain("test-key");
  });

  test("API 서버에 닿지 못해도 KidsPlaceFetchError로 실패한다", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(fetchKidsPlaces("서울", "키즈카페")).rejects.toBeInstanceOf(KidsPlaceFetchError);
  });

  test("인증키가 설정되지 않았으면 API를 호출하지 않고 KidsPlaceFetchError로 실패한다", async () => {
    vi.stubEnv("KAKAO_REST_API_KEY", "");

    await expect(fetchKidsPlaces("서울", "키즈카페")).rejects.toBeInstanceOf(KidsPlaceFetchError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
