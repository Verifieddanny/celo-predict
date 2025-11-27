"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CELO_PREDICT_ADDRESS, celoPredictAbi } from "../lib/celoPredict";

export function useClaimReward() {
  const {
    writeContract,
    data: hash,
    isPending: isWriting,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimReward = (eventId: number) => {
    writeContract({
      address: CELO_PREDICT_ADDRESS,
      abi: celoPredictAbi,
      functionName: "claimReward",
      args: [BigInt(eventId)],
    });
  };

  return {
    claimReward,
    isPending: isWriting || isConfirming,
    data: hash,
    isSuccess,
    error,
  };
}
