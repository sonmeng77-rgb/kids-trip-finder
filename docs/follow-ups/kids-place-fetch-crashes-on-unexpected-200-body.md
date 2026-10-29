# 카카오가 예상과 다른 본문을 200으로 돌려주면 키즈카페·키즈펜션 화면이 깨진다

**Symptom**: `fetchKidsPlaces`가 `result.documents`와 `result.meta`를 try/catch 밖에서 읽는다. 카카오가 HTTP 200으로 `documents`나 `meta`가 없는 본문을 주면 일반 `TypeError`가 던져지고, `RegionKidsPlaces`는 `KidsPlaceFetchError`만 처리하므로 키즈카페 보기 전체가 오류 화면이 된다.

**Observed evidence**: 코드 리뷰(`code-review low`)가 `features/kids-place/fetch-kids-places.ts`에서 지적했다. 2026-10-29 실제 호출(17개 시·도)에서는 항상 정상 본문이 와서 재현되지 않았다.

**Suspected cause**: 응답 본문의 모양을 검증하지 않고 `KakaoPage` 타입으로 가정한다.

**What was tried**: 수정하지 않았다. 현재 실제 응답에서 일어나지 않았고 스펙의 수용 기준을 깨지 않는다.

**Proposed next step**: `fetchPage`에서 `documents`가 배열이고 `meta`가 있는지 확인하고, 아니면 `KidsPlaceFetchError`로 던지게 한다. 본문이 `{}`인 200 응답을 가짜 `fetch`로 돌려주는 테스트를 `fetch-kids-places.test.ts`에 추가한다.
