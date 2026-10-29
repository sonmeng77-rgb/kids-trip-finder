# 행사 조회가 첫 페이지 1000건 이후 결과를 버린다

**Symptom**: `fetchActiveFestivals`가 TourAPI `searchFestival2`를 `pageNo=1`, `numOfRows=1000`으로 한 번만 호출한다. 응답의 `totalCount`가 1000을 넘으면 나머지 행사는 어느 지역 목록에도 나타나지 않고 오류도 없다.

**Observed evidence**: 코드 리뷰(`code-review low`)가 `features/festival/fetch-active-festivals.ts`에서 지적했다. 2026-10-29 실제 호출은 `eventStartDate=오늘`에서 `totalCount=139`라 아직 재현되지 않았다.

**Suspected cause**: 페이지를 넘기며 가져오는 반복이 없다. 현재 데이터 규모(139건)에서는 문제가 없어 생략했다.

**What was tried**: 수정하지 않았다. 스펙의 수용 기준과 현재 실제 데이터 모두에서 문제가 없었다.

**Proposed next step**: 응답의 `totalCount`와 받은 건수를 비교해 부족하면 다음 `pageNo`를 이어서 가져오도록 `fetchActiveFestivals`를 고치고, 두 페이지에 걸친 응답을 가짜 `fetch`로 돌려주는 테스트를 추가한다.
