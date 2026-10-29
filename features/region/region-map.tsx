import Link from "next/link";

import { cn } from "@/lib/utils";

import { KOREA_MAP_PATHS, KOREA_MAP_VIEW_BOX } from "./korea-map-paths";
import { REGIONS, type RegionId } from "./regions";

/** 라벨을 놓을 지도 좌표. 시·도 경계의 중심에서 겹치는 곳만 옮겼다. */
const LABEL_POSITIONS: Record<RegionId, [number, number]> = {
  seoul: [153, 126],
  busan: [345, 402],
  daegu: [300, 336],
  incheon: [112, 142],
  gwangju: [140, 408],
  daejeon: [195, 284],
  ulsan: [364, 367],
  sejong: [168, 243],
  gyeonggi: [200, 150],
  gangwon: [270, 97],
  "north-chungcheong": [243, 239],
  "south-chungcheong": [142, 250],
  "north-jeolla": [170, 343],
  "south-jeolla": [156, 439],
  "north-gyeongsang": [312, 272],
  "south-gyeongsang": [286, 388],
  jeju: [111, 609],
};

/** 면적이 작아 라벨을 작게 써야 하는 시·도 */
const SMALL_REGIONS = new Set<RegionId>(["seoul", "incheon", "sejong", "daejeon", "gwangju", "ulsan"]);

export function RegionMap({
  selectedId,
  hrefFor = (id) => `/?region=${id}`,
}: {
  selectedId?: RegionId;
  /** 시·도를 눌렀을 때 이동할 주소 */
  hrefFor?: (id: RegionId) => string;
}) {
  return (
    <nav aria-label="대한민국 시·도 지도">
      <svg
        viewBox={KOREA_MAP_VIEW_BOX}
        className="mx-auto h-auto w-full max-w-md"
        role="group"
        aria-label="시·도를 선택하세요"
      >
        {REGIONS.map((region) => {
          const selected = region.id === selectedId;
          const [x, y] = LABEL_POSITIONS[region.id];
          return (
            <Link
              key={region.id}
              href={hrefFor(region.id)}
              aria-label={region.name}
              aria-current={selected ? "true" : undefined}
              className="group outline-none"
            >
              <path
                d={KOREA_MAP_PATHS[region.id]}
                className={cn(
                  "stroke-background stroke-1 transition-colors group-focus-visible:stroke-ring group-focus-visible:stroke-2",
                  selected
                    ? "fill-primary"
                    : "fill-primary/15 group-hover:fill-primary/35",
                )}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                aria-hidden="true"
                className={cn(
                  "pointer-events-none select-none font-medium",
                  SMALL_REGIONS.has(region.id) ? "text-[9.5px]" : "text-[13px]",
                  selected ? "fill-primary-foreground" : "fill-foreground",
                )}
              >
                {region.name}
              </text>
            </Link>
          );
        })}
      </svg>
    </nav>
  );
}
