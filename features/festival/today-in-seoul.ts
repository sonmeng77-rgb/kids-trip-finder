/** 지금 한국 날짜를 YYYYMMDD로 돌려준다. */
export function todayInSeoul(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" })
    .format(now)
    .replaceAll("-", "");
}
