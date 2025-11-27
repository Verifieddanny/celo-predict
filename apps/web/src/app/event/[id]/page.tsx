"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useEventDetail } from "../../../hooks/useEventDetail";
import { usePlaceBet } from "../../../hooks/usePlaceBet";

function formatPool(total: bigint): string {
    if (total === BigInt(0)) return "0 CELO";
    const celo = Number(total) / 1e18;
    return `${celo.toFixed(3)} CELO`;
}

export default function EventPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const eventId = Number(params.id);

    const { event, pool, loading: isLoading } = useEventDetail(eventId);
    const { placeBet, isPending } = usePlaceBet();

    const [selected, setSelected] = useState<number | null>(null);
    const [stake, setStake] = useState<string>("");

    const now = Date.now();


    const status = useMemo(() => {
        if (!event) return "";
        const deadlineMs = Number(event.deadline) * 1000;
        if (event.resolved) return "Resolved";
        if (deadlineMs < now) return "Betting closed";
        return "Live";
    }, [event, now]);


    const disabledBet =
        !event ||
        event.resolved ||
        Number(event.deadline) * 1000 < now ||
        selected === null ||
        !stake ||
        isPending;

    const options = useMemo(() => {
        if (!event) return ["Outcome 0", "Outcome 1", "Outcome 2"];

        if (event.title.includes("vs") || event.title.includes("VS") || event.title.includes("Vs")) {
            return ["Home win", "Draw", "Away win"];
        }
        if (event.title.toLowerCase().includes("price")) {
            return ["Goes up", "Stays around", "Goes down"];
        }
        return ["Outcome 0", "Outcome 1", "Outcome 2"];
    }, [event]);


    const handlePlaceBet = () => {
        if (selected === null || !stake) return;
        placeBet({
            eventId,
            outcome: selected,
            stake,
        });
    };

    if (isLoading || !event) {
        return (
            <div className="min-h-screen bg-linear-to-b from-[#050816] via-[#050816] to-[#020617] text-slate-50">
                <div className="max-w-md mx-auto px-4 pt-8">
                    <p className="text-sm text-slate-400">Loading event...</p>
                </div>
            </div>
        );
    }

    const deadlineDate = new Date(Number(event.deadline) * 1000);

    return (
        <div className="min-h-screen bg-linear-to-b from-[#050816] via-[#050816] to-[#020617] text-slate-50">
            <div className="max-w-md mx-auto px-4 pb-10 pt-4 space-y-4">
                <button
                    onClick={() => router.back()}
                    className="text-xs text-slate-400"
                >
                    ← Back
                </button>

                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl space-y-4 relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#35D07F]/10 blur-3xl" />

                    <div className="relative flex justify-between items-start gap-4">
                        <div className="space-y-1">
                            <h1 className="text-xl font-semibold text-slate-50">
                                {event.title}
                            </h1>
                            <p className="text-xs text-slate-400">
                                {event.description}
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Deadline: {deadlineDate.toLocaleString()}
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] border ${status === "Live"
                                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                                    : status === "Resolved"
                                        ? "border-sky-500/50 bg-sky-500/10 text-sky-300"
                                        : "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                }`}
                        >
                            {status}
                        </span>
                    </div>

                    {pool && (
                        <div className="relative mt-2 flex justify-between text-xs">
                            <div className="space-y-1">
                                <p className="text-slate-400">Total pool</p>
                                <p className="font-semibold text-slate-50">
                                    {formatPool(pool.total)}
                                </p>
                            </div>
                            <div className="text-[11px] text-slate-500 text-right">
                                <p>Outcome 0: {formatPool(pool.o0)}</p>
                                <p>Outcome 1: {formatPool(pool.o1)}</p>
                                <p>Outcome 2: {formatPool(pool.o2)}</p>
                            </div>
                        </div>
                    )}

                    {/* Outcome selection */}
                    <div className="mt-4 space-y-2">
                        <p className="text-xs text-slate-300">
                            Choose your outcome
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {options.map((label, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelected(index)}
                                    disabled={event.resolved || Number(event.deadline) * 1000 < now}
                                    className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition 
                  ${selected === index
                                            ? "border-[#35D07F] bg-[#35D07F]/10 text-[#35D07F]"
                                            : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30"
                                        } ${event.resolved || Number(event.deadline) * 1000 < now
                                            ? "opacity-60 cursor-not-allowed"
                                            : ""
                                        }`}
                                >
                                    <span className="font-medium">{label}</span>
                                    <span className="ml-2 text-[10px] text-slate-400">
                                        index {index}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stake input */}
                    <div className="mt-4 space-y-2">
                        <p className="text-xs text-slate-300">
                            Stake amount (CELO)
                        </p>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={stake}
                                onChange={(e) => setStake(e.target.value)}
                                placeholder="0.1"
                                disabled={event.resolved || Number(event.deadline) * 1000 < now}
                                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#35D07F]"
                            />
                            <button
                                type="button"
                                className="text-[11px] rounded-xl bg-white/5 px-2 py-1 text-slate-300"
                                onClick={() => setStake("0.5")}
                                disabled={event.resolved || Number(event.deadline) * 1000 < now}
                            >
                                Demo max
                            </button>
                        </div>
                    </div>

                    {event.resolved && (
                        <p className="mt-2 text-[11px] text-slate-400">
                            Winning outcome index:{" "}
                            <span className="font-semibold text-slate-200">
                                {event.winningOutcome}
                            </span>
                        </p>
                    )}

                    {/* Place bet button */}
                    <button
                        onClick={handlePlaceBet}
                        disabled={disabledBet}
                        className="mt-5 w-full rounded-2xl bg-[#35D07F] py-2.5 text-sm font-semibold text-slate-900 disabled:bg-slate-700 disabled:text-slate-400"
                    >
                        {isPending
                            ? "Placing..."
                            : event.resolved
                                ? "Event resolved"
                                : Number(event.deadline) * 1000 < now
                                    ? "Betting closed"
                                    : "Place prediction"}
                    </button>
                </div>
            </div>
        </div>
    );
}