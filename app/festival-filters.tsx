"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RegionId } from "@/features/region";

import { filterHref } from "./filter-href";

type Option = { value: string; label: string };

/** "선택 안 함"을 나타내는 드롭다운 값 */
const ALL = "all";

/** 시·도와 월을 고르는 드롭다운. 선택하면 선택이 담긴 주소로 이동한다. */
export function FestivalFilters({
  regions,
  months,
  regionId,
  month,
}: {
  regions: Option[];
  months: Option[];
  regionId?: RegionId;
  month?: string;
}) {
  const router = useRouter();
  const regionItems = [{ value: ALL, label: "전국" }, ...regions];
  const monthItems = [{ value: ALL, label: "전체" }, ...months];

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        items={regionItems}
        value={regionId ?? ALL}
        onValueChange={(value) =>
          router.push(
            filterHref({
              regionId: !value || value === ALL ? undefined : (value as RegionId),
              month,
            }),
          )
        }
      >
        <SelectTrigger aria-label="시·도" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {regionItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={monthItems}
        value={month ?? ALL}
        onValueChange={(value) =>
          router.push(
            filterHref({ regionId, month: !value || value === ALL ? undefined : value }),
          )
        }
      >
        <SelectTrigger aria-label="월" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {monthItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
