"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import {
  CELO_PREDICT_ADDRESS,
  celoPredictAbi,
  EventInfo,
} from "../lib/celoPredict";
import { wagmiConfig } from "@/components/wallet-provider";

export type UiEvent = EventInfo & {
  id: number;
};

export function useEvents() {
  const [events, setEvents] = useState<UiEvent[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: countData } = useReadContract({
    address: CELO_PREDICT_ADDRESS,
    abi: celoPredictAbi,
    functionName: "eventCount",
  });

  // manual refresh
  const refresh = () => setRefreshKey((x) => x + 1);

  useEffect(() => {
    const loadEvents = async () => {
      if (countData === undefined) return;
      const count = Number(countData);
      const items: UiEvent[] = [];

      for (let i = 0; i < count; i++) {
        const data = (await readContract(wagmiConfig, {
          address: CELO_PREDICT_ADDRESS,
          abi: celoPredictAbi,
          functionName: "getEvent",
          args: [BigInt(i)],
        })) as unknown as EventInfo;

        items.push({ ...data, id: i });
      }

      setEvents(items);
    };

    void loadEvents();
  }, [countData, refreshKey]);

  // Poll every 10 seconds for a "live" feel
  useEffect(() => {
    const id = setInterval(() => {
      refresh();
    }, 10000);
    return () => clearInterval(id);
  }, []);

  return { events, count: countData ? Number(countData) : 0, refresh };
}
