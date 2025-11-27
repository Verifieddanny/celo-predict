"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CELO_PREDICT_ADDRESS, celoPredictAbi } from "../lib/celoPredict";

export function usePlaceBet() {
  const {
    writeContract,
    data: hash,
    isPending: isWriting,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const placeBet = (params: {
    eventId: number;
    outcome: number;
    stake: string; // in CELO, like "0.1"
  }) => {
    // convert CELO string to wei (bigint)
    const value = BigInt(
      Math.floor(parseFloat(params.stake) * 1e18)
    );

    writeContract({
      address: CELO_PREDICT_ADDRESS,
      abi: celoPredictAbi,
      functionName: "placeBet",
      args: [BigInt(params.eventId), params.outcome],
      value,
    });
  };

  return { placeBet, isPending: isWriting || isConfirming, data: hash, isSuccess, error };
}
