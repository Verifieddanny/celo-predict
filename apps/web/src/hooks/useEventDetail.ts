"use client";

import { useReadContract } from "wagmi";
import {
  CELO_PREDICT_ADDRESS,
  celoPredictAbi,
  EventInfo,
} from "../lib/celoPredict";

export function useEventDetail(eventId: number) {
  const { data: eventData, isLoading: loadingEvent } = useReadContract({
    address: CELO_PREDICT_ADDRESS,
    abi: celoPredictAbi,
    functionName: "getEvent",
    args: [BigInt(eventId)],
  });

  const { data: poolData, isLoading: loadingPool } = useReadContract({
    address: CELO_PREDICT_ADDRESS,
    abi: celoPredictAbi,
    functionName: "getPool",
    args: [BigInt(eventId)],
  });

  const event = eventData as unknown as EventInfo | undefined;

  const pool = poolData
    ? {
        total: BigInt(poolData[0]),
        o0: BigInt(poolData[1]),
        o1: BigInt(poolData[2]),
        o2: BigInt(poolData[3]),
      }
    : undefined;

  return {
    event,
    pool,
    loading: loadingEvent || loadingPool,
  };
}
