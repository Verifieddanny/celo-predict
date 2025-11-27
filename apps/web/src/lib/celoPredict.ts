import type { Abi } from "viem";

// Version 1 deployed address
// export const CELO_PREDICT_ADDRESS =
//   "0x0a81AdbF6247384C5726e4bce85e75Bd06D0e5BF" as const;

export const CELO_PREDICT_ADDRESS =
  "0xd60dD40EBB2b0Aec09445bAEdE0f4d6f3C176EEE" as const;

export type EventInfo = {
  title: string;
  description: string;
  deadline: bigint;
  resolved: boolean;
  winningOutcome: number;
  active: boolean;
};


export const celoPredictAbi = [
    {
      type: "function",
      name: "owner",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "address" }],
    },
    {
      type: "function",
      name: "eventCount",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "uint256" }],
    },
    {
      type: "function",
      name: "getEvent",
      stateMutability: "view",
      inputs: [{ name: "eventId", type: "uint256" }],
      outputs: [
        {
          components: [
            { name: "title", type: "string" },
            { name: "description", type: "string" },
            { name: "deadline", type: "uint256" },
            { name: "resolved", type: "bool" },
            { name: "winningOutcome", type: "uint8" },
            { name: "active", type: "bool" },
          ],
          type: "tuple",
        },
      ],
    },
    {
      type: "function",
      name: "getPool",
      stateMutability: "view",
      inputs: [{ name: "eventId", type: "uint256" }],
      outputs: [
        { name: "total", type: "uint256" },
        { name: "o0", type: "uint256" },
        { name: "o1", type: "uint256" },
        { name: "o2", type: "uint256" },
      ],
    },
    {
      type: "function",
      name: "bets",
      stateMutability: "view",
      inputs: [
        { name: "", type: "uint256" },
        { name: "", type: "address" },
      ],
      outputs: [
        { name: "amount", type: "uint256" },
        { name: "outcome", type: "uint8" },
        { name: "claimed", type: "bool" },
      ],
    },
    {
      type: "function",
      name: "getUserEvents",
      stateMutability: "view",
      inputs: [{ name: "user", type: "address" }],
      outputs: [{ name: "", type: "uint256[]" }],
    },
    {
      type: "function",
      name: "getBet",
      stateMutability: "view",
      inputs: [
        { name: "eventId", type: "uint256" },
        { name: "user", type: "address" },
      ],
      outputs: [
        {
          components: [
            { name: "amount", type: "uint256" },
            { name: "outcome", type: "uint8" },
            { name: "claimed", type: "bool" },
          ],
          type: "tuple",
        },
      ],
    },
    {
      type: "function",
      name: "placeBet",
      stateMutability: "payable",
      inputs: [
        { name: "eventId", type: "uint256" },
        { name: "outcome", type: "uint8" },
      ],
      outputs: [],
    },
    {
      type: "function",
      name: "claimReward",
      stateMutability: "nonpayable",
      inputs: [{ name: "eventId", type: "uint256" }],
      outputs: [],
    },
    {
      type: "function",
      name: "createEvent",
      stateMutability: "nonpayable",
      inputs: [
        { name: "_title", type: "string" },
        { name: "_description", type: "string" },
        { name: "_deadline", type: "uint256" },
      ],
      outputs: [],
    },
    {
      type: "function",
      name: "resolveEvent",
      stateMutability: "nonpayable",
      inputs: [
        { name: "eventId", type: "uint256" },
        { name: "winningOutcome", type: "uint8" },
      ],
      outputs: [],
    },
  ] as const satisfies Abi;