"use client";

import { useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RegionId } from "@/features/region";

import { filterHref, type View } from "./filter-href";

/** 목록에서 무엇을 볼지(행사, 키즈카페, 키즈펜션) 고른다. 고르면 선택이 담긴 주소로 이동한다. */
export function ViewTabs({
  view,
  regionId,
  month,
}: {
  view: View;
  regionId?: RegionId;
  month?: string;
}) {
  const router = useRouter();

  return (
    <Tabs
      value={view}
      onValueChange={(value) =>
        router.push(filterHref({ regionId, month, view: value as View }))
      }
    >
      <TabsList>
        <TabsTrigger value="events">행사</TabsTrigger>
        <TabsTrigger value="cafes">키즈카페</TabsTrigger>
        <TabsTrigger value="pensions">키즈펜션</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
