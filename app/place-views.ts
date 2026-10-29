/** 카카오 키워드 검색으로 보여 주는 보기(키즈카페, 키즈펜션)와 그 검색 방식, 안내 문구 */
export const PLACE_VIEWS = {
  cafes: {
    keyword: "키즈카페",
    subject: "키즈카페",
    emptyTitle: "이 지역에서 찾은 키즈카페가 없습니다",
  },
  pensions: {
    keyword: "키즈 펜션 숙소",
    subject: "키즈펜션",
    emptyTitle: "이 지역에서 찾은 키즈펜션이 없습니다",
  },
} as const;

export type PlaceView = keyof typeof PLACE_VIEWS;
