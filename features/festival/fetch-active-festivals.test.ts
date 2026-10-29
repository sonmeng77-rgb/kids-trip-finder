import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { FestivalFetchError, fetchActiveFestivals } from "@/features/festival";

function item(overrides: Record<string, string>) {
  return {
    contentid: "1",
    title: "축제",
    addr1: "서울특별시 종로구 인사동5길 10",
    addr2: "",
    eventstartdate: "20261101",
    eventenddate: "20261102",
    lDongRegnCd: "11",
    ...overrides,
  };
}

function apiResponse(items: unknown[], totalCount = items.length) {
  return Response.json({
    response: {
      header: { resultCode: "0000", resultMsg: "OK" },
      body: {
        items: items.length === 0 ? "" : { item: items },
        numOfRows: 1000,
        pageNo: 1,
        totalCount,
      },
    },
  });
}

describe("fetchActiveFestivals", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("DATA_GO_KR_SERVICE_KEY", "test-key");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  test("오늘 날짜 기준으로 조회하고 개최 기간 순서, 같으면 축제명 순으로 돌려준다", async () => {
    fetchMock.mockResolvedValueOnce(
      apiResponse([
        item({ contentid: "3", title: "다 축제", eventstartdate: "20261110" }),
        item({ contentid: "2", title: "나 축제", eventstartdate: "20261101" }),
        item({
          contentid: "1",
          title: "가 축제",
          eventstartdate: "20261101",
          addr1: "부산광역시 해운대구 APEC로 30",
          addr2: "1층",
          lDongRegnCd: "26",
        }),
      ]),
    );

    const festivals = await fetchActiveFestivals("20261029");

    const requested = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requested.searchParams.get("eventStartDate")).toBe("20261029");
    expect(requested.searchParams.get("serviceKey")).toBe("test-key");

    expect(festivals.map((festival) => festival.title)).toEqual([
      "가 축제",
      "나 축제",
      "다 축제",
    ]);
    expect(festivals[0]).toEqual({
      id: "1",
      title: "가 축제",
      startDate: "20261101",
      endDate: "20261102",
      place: "부산광역시 해운대구 APEC로 30 1층",
      address: "부산광역시 해운대구 APEC로 30",
      sidoCode: "26",
    });
  });

  test("이미 끝난 행사는 돌려주지 않는다", async () => {
    fetchMock.mockResolvedValueOnce(
      apiResponse([
        item({ contentid: "1", title: "끝난 축제", eventstartdate: "20261001", eventenddate: "20261028" }),
        item({ contentid: "2", title: "오늘 끝나는 축제", eventstartdate: "20261020", eventenddate: "20261029" }),
      ]),
    );

    const festivals = await fetchActiveFestivals("20261029");

    expect(festivals.map((festival) => festival.title)).toEqual(["오늘 끝나는 축제"]);
  });

  test("행사가 하나도 없으면 빈 목록을 돌려준다", async () => {
    fetchMock.mockResolvedValueOnce(apiResponse([]));

    await expect(fetchActiveFestivals("20261029")).resolves.toEqual([]);
  });

  test("API가 키를 거부하면 FestivalFetchError로 실패하고 키는 메시지에 담기지 않는다", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json(
        {
          OpenAPI_ServiceResponse: {
            cmmMsgHeader: { errMsg: "SERVICE_KEY_IS_NOT_REGISTERED_ERROR", returnReasonCode: "30" },
          },
        },
        { status: 403 },
      ),
    );

    const failure = await fetchActiveFestivals("20261029").catch((error) => error);

    expect(failure).toBeInstanceOf(FestivalFetchError);
    expect(failure.message).not.toContain("test-key");
  });

  test("API 서버에 닿지 못해도 FestivalFetchError로 실패한다", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(fetchActiveFestivals("20261029")).rejects.toBeInstanceOf(FestivalFetchError);
  });

  test("인증키가 설정되지 않았으면 API를 호출하지 않고 FestivalFetchError로 실패한다", async () => {
    vi.stubEnv("DATA_GO_KR_SERVICE_KEY", "");

    await expect(fetchActiveFestivals("20261029")).rejects.toBeInstanceOf(FestivalFetchError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
