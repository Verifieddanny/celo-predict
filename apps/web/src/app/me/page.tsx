"use client";

import {
    useAccount
} from "wagmi";
import { useMyPredictions } from "../../hooks/useMyPredictions";
import { useClaimReward } from "../../hooks/useClaimReward";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function formatAmount(raw: unknown): string {
    if (raw === undefined || raw === null) return "0 CELO";

    let amount: bigint;

    try {
        amount = typeof raw === "bigint" ? raw : BigInt(raw as any);
    } catch {
        return "0 CELO";
    }

    if (amount === BigInt(0)) return "0 CELO";

    const celo = Number(amount) / 1e18;
    return `${celo.toFixed(3)} CELO`;
}


type StatusInfo = {
    label: string;
    colorClass: string;
    claimable: boolean;
};

function computeStatus(p: ReturnType<typeof useMyPredictions>["predictions"][number]): StatusInfo {
    const { event, betOutcome, claimed } = p;

    if (!event.resolved) {
        return {
            label: "Pending resolution",
            colorClass: "border-amber-500/40 bg-amber-500/10 text-amber-300",
            claimable: false,
        };
    }

    const isWinner = betOutcome === event.winningOutcome;

    if (!isWinner) {
        return {
            label: "Lost",
            colorClass: "border-red-500/40 bg-red-500/10 text-red-300",
            claimable: false,
        };
    }

    if (claimed) {
        return {
            label: "Claimed",
            colorClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
            claimable: false,
        };
    }

    return {
        label: "Won - claimable",
        colorClass: "border-[#35D07F]/60 bg-[#35D07F]/10 text-[#35D07F]",
        claimable: true,
    };
}


export default function MyPredictionsPage() {
    const router = useRouter();
    const { address } = useAccount();
    const { predictions, isLoading, error, refresh } = useMyPredictions();
    const { claimReward, isPending, isSuccess } = useClaimReward();

    useEffect(() => {
        if (isSuccess) {
            refresh();
        }
    }, [isSuccess, refresh]);



    if (!address) {
        return (
            <div className="min-h-screen bg-linear-to-b from-[#050816] via-[#050816] to-[#020617] text-slate-50">
                <div className="max-w-md mx-auto px-4 pt-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-xs text-slate-400"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-semibold mb-2">
                        My predictions
                    </h1>
                    <p className="text-sm text-slate-400">
                        Connect your wallet first to see your predictions.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-[#050816] via-[#050816] to-[#020617] text-slate-50">
            <div className="max-w-md mx-auto px-4 pb-10 pt-6 space-y-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-xs text-slate-400"
                >
                    ← Back
                </button>
                <header className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                        Portfolio
                    </p>
                    <h1 className="text-2xl font-semibold">
                        My predictions
                    </h1>
                    <p className="text-xs text-slate-400">
                        Track your positions, see outcomes and claim rewards.
                    </p>
                </header>

                {isLoading && (
                    <p className="text-sm text-slate-400">Loading predictions...</p>
                )}

                {error && (
                    <p className="text-xs text-red-400">
                        {String(error.message || "Error loading predictions")}
                    </p>
                )}

                {!isLoading && predictions.length === 0 && (
                    <p className="text-sm text-slate-400">
                        You have not placed any predictions yet. Join a pool from the home
                        page to see it here.
                    </p>
                )}

                <div className="space-y-3">
                    {predictions.map((p) => {
                        const deadlineDate = new Date(
                            Number(p.event.deadline) * 1000,
                        );
                        const status = computeStatus(p);

                        return (
                            <div
                                key={p.eventId}
                                className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl space-y-3 text-xs relative overflow-hidden"
                            >
                                <div className="absolute -right-20 -top-20 h-32 w-32 rounded-full bg-[#35D07F]/5 blur-3xl" />

                                <div className="relative flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="text-slate-50 text-sm font-medium">
                                            #{p.eventId} {p.event.title}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            {p.event.description}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            Deadline: {deadlineDate.toLocaleString()}
                                        </p>
                                    </div>

                                    <span
                                        className={
                                            "rounded-full px-2 py-0.5 text-[10px] border " +
                                            status.colorClass
                                        }
                                    >
                                        {status.label}
                                    </span>
                                </div>

                                <div className="relative grid grid-cols-2 gap-3 mt-2">
                                    <div className="space-y-1">
                                        <p className="text-[11px] text-slate-400">
                                            Your stake
                                        </p>
                                        <p className="text-sm font-semibold text-slate-50">
                                            {formatAmount(p.betAmount)}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            Predicted Outcome: <span className="font-semibold">{p.betOutcome === 0 ? "Home to Win" : p.betOutcome === 1 ? "Draw" : "Away to Win"}</span>
                                        </p>
                                    </div>

                                    <div className="space-y-1 text-right">
                                        <p className="text-[11px] text-slate-400">
                                            Total pool
                                        </p>
                                        <p className="text-sm font-semibold text-slate-50">
                                            {formatAmount(p.poolTotal)}
                                        </p>
                                        {p.event.resolved && (
                                            <p className="text-[11px] text-slate-500">
                                                Winning Outcome: <span className="font-semibold">{p.event.winningOutcome === 0 ? "Home to Win" : p.event.winningOutcome === 1 ? "Draw" : "Away to Win"}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="relative mt-3 flex items-center justify-between">
                                    <p className="text-[11px] text-slate-500">
                                        Address:{" "}
                                        <span className="font-mono text-[10px] text-slate-400">
                                            {address.slice(0, 6)}...
                                            {address.slice(-4)}
                                        </span>
                                    </p>

                                    <button
                                        type="button"
                                        disabled={!status.claimable || isPending}
                                        onClick={() => claimReward(p.eventId)}
                                        className="rounded-xl bg-[#35D07F] px-3 py-1.5 text-[11px] font-semibold text-slate-900 disabled:bg-slate-700 disabled:text-slate-400"
                                    >
                                        {isPending && status.claimable
                                            ? "Claiming..."
                                            : status.claimable
                                                ? "Claim reward"
                                                : "No reward"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}