# 주소나 시·도 코드가 빠진 행사 한 건이 모든 지역 페이지를 깨뜨린다

**Symptom**: TourAPI 응답의 한 행에 `addr1` 또는 `lDongRegnCd`가 없으면 `resolveRegion`이 `TypeError`를 던진다. `RegionFestivals`는 `FestivalFetchError`만 처리하므로 모든 지역 페이지가 오류 화면이 된다.

**Observed evidence**: 코드 리뷰(`code-review low`)가 `features/region/resolve-region.ts`에서 지적했다. 2026-10-29 실제 응답 139건에는 모든 행에 두 필드가 있어 재현되지 않았다.

**Suspected cause**: 응답 항목의 필드를 항상 문자열로 가정한다(`sidoCode.slice`, `address.trim`). 외부 데이터에서 필드가 빠지는 경우를 다루지 않는다.

**What was tried**: 수정하지 않았다. 현재 실제 데이터에서 일어나지 않았고 스펙의 수용 기준을 깨지 않는다.

**Proposed next step**: `fetchActiveFestivals`에서 필수 필드가 없는 행을 건너뛰도록 하거나 빈 문자열로 정규화하고, 필드가 빠진 행이 섞인 응답에서도 나머지 행사가 나오는 테스트를 추가한다.
