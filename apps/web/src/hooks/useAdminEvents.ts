"use client";

import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { readContract } from "wagmi/actions";
import { CELO_PREDICT_ADDRESS, celoPredictAbi } from "../lib/celoPredict";
import { wagmiConfig } from "@/components/wallet-provider";

export function useAdminEvents() {
  const { address } = useAccount();

  const {
    writeContract,
    data: hash,
    isPending: isWriting,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createEvent = async (params: {
    title: string;
    description: string;
    deadlineTs: number; // unix seconds
  }) => {
    writeContract({
      address: CELO_PREDICT_ADDRESS,
      abi: celoPredictAbi,
      functionName: "createEvent",
      args: [params.title, params.description, BigInt(params.deadlineTs)],
    });
  };

  const resolveEvent = async (params: {
    eventId: number;
    winningOutcome: number;
  }) => {
    writeContract({
      address: CELO_PREDICT_ADDRESS,
      abi: celoPredictAbi,
      functionName: "resolveEvent",
      args: [BigInt(params.eventId), params.winningOutcome],
    });
  };

  const checkIsOwner = async (): Promise<boolean> => {
    if (!address) return false;

    const owner = (await readContract(wagmiConfig, {
      address: CELO_PREDICT_ADDRESS,
      abi: celoPredictAbi,
      functionName: "owner",
    })) as string;

    return owner.toLowerCase() === address.toLowerCase();
  };

  return {
    createEvent,
    resolveEvent,
    checkIsOwner,
    isPending: isWriting || isConfirming,
    isSuccess,
    error,
    txResult: hash,
  };
}
