export type Festival = {
  id: string;
  title: string;
  /** YYYYMMDD */
  startDate: string;
  /** YYYYMMDD */
  endDate: string;
  place: string;
  address: string;
  /** TourAPI 시·도 코드(lDongRegnCd) 원문 */
  sidoCode: string;
};

/** 행사 정보를 가져오지 못했다. 메시지에는 인증키 등 민감한 값을 담지 않는다. */
export class FestivalFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FestivalFetchError";
  }
}
