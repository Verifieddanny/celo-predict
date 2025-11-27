"use client";

import { useAccount } from "wagmi";
import { readContract } from "wagmi/actions";
import {
  CELO_PREDICT_ADDRESS,
  celoPredictAbi,
  EventInfo,
} from "../lib/celoPredict";
import { wagmiConfig } from "@/components/wallet-provider";
import { useEffect, useState } from "react";

export type MyPrediction = {
  eventId: number;
  event: EventInfo;
  poolTotal: bigint;
  betAmount: bigint;
  betOutcome: number;
  claimed: boolean;
};

export function useMyPredictions() {
  const { address } = useAccount();
  const [predictions, setPredictions] = useState<MyPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((x) => x + 1);

  useEffect(() => {
    const run = async () => {
      if (!address) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const eventIds = (await readContract(wagmiConfig, {
          address: CELO_PREDICT_ADDRESS,
          abi: celoPredictAbi,
          functionName: "getUserEvents",
          args: [address],
        })) as bigint[];

        const items: MyPrediction[] = [];

        for (const rawId of eventIds) {
          const idNum = Number(rawId);

          const [eventData, poolData, betData] = await Promise.all([
            readContract(wagmiConfig, {
              address: CELO_PREDICT_ADDRESS,
              abi: celoPredictAbi,
              functionName: "getEvent",
              args: [rawId],
            }),
            readContract(wagmiConfig, {
              address: CELO_PREDICT_ADDRESS,
              abi: celoPredictAbi,
              functionName: "getPool",
              args: [rawId],
            }),
            readContract(wagmiConfig, {
              address: CELO_PREDICT_ADDRESS,
              abi: celoPredictAbi,
              functionName: "getBet",
              args: [rawId, address],
            }),
          ]);

          const event = eventData as unknown as EventInfo;

          // tuple (amount, outcome, claimed)
          const { amount, outcome, claimed } = betData as {
            amount: bigint;
            outcome: number;
            claimed: boolean;
          };

          const poolTuple = poolData as unknown as [
            bigint,
            bigint,
            bigint,
            bigint
          ];
          const total = poolTuple[0];

          items.push({
            eventId: idNum,
            event,
            poolTotal: total,
            betAmount: amount,
            betOutcome: outcome,
            claimed,
          });
        }

        setPredictions(items);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, [address, refreshKey]);

  return { predictions, isLoading, error, refresh };
}
