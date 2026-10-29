export type KidsCafe = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  /** 카카오맵 장소 페이지 */
  url: string;
};

/** 키즈카페 정보를 가져오지 못했다. 메시지에는 인증키 등 민감한 값을 담지 않는다. */
export class KidsCafeFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KidsCafeFetchError";
  }
}
