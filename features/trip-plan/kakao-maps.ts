/** 카카오 지도 SDK 중 이 앱이 쓰는 부분만 적은 모양 */
export type KakaoMapsApi = {
  maps: {
    Map: new (container: HTMLElement, options: { center: unknown; level: number }) => {
      setBounds(bounds: unknown, top?: number, right?: number, bottom?: number, left?: number): void;
    };
    LatLng: new (lat: number, lng: number) => unknown;
    LatLngBounds: new () => { extend(point: unknown): void };
    Polyline: new (options: {
      path: unknown[];
      strokeWeight: number;
      strokeColor: string;
      strokeOpacity: number;
      strokeStyle: string;
    }) => { setMap(map: unknown): void };
    CustomOverlay: new (options: {
      position: unknown;
      content: HTMLElement;
      yAnchor: number;
    }) => { setMap(map: unknown): void };
    load(callback: () => void): void;
  };
};

declare global {
  interface Window {
    kakao?: KakaoMapsApi;
  }
}

let loading: Promise<KakaoMapsApi> | null = null;

/** 카카오 지도 SDK를 한 번만 불러온다. 실패하면 다음에 다시 시도할 수 있다. */
export function loadKakaoMaps(appKey: string): Promise<KakaoMapsApi> {
  loading ??= new Promise<KakaoMapsApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.async = true;
    script.onload = () => {
      const kakao = window.kakao;
      if (!kakao) return reject(new Error("카카오 지도 SDK를 찾을 수 없습니다."));
      kakao.maps.load(() => resolve(kakao));
    };
    script.onerror = () => reject(new Error("카카오 지도 SDK를 불러오지 못했습니다."));
    document.head.appendChild(script);
  }).catch((error) => {
    loading = null;
    throw error;
  });

  return loading;
}
