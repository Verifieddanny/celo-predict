"use client";

import { useEffect, useState } from "react";
import { useAdminEvents } from "../../hooks/useAdminEvents";
import { useEvents } from "../../hooks/useEvents";
import { useRouter } from "next/navigation";

type OutcomeSelectState = {
    [eventId: number]: number;
};

export default function AdminPage() {
    const router = useRouter();
    const { events } = useEvents();
    const {
        createEvent,
        resolveEvent,
        checkIsOwner,
        isPending,
        error,
    } = useAdminEvents();

    const [isOwner, setIsOwner] = useState<boolean | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState(""); // datetime-local input

    const [outcomeSelections, setOutcomeSelections] =
        useState<OutcomeSelectState>({});

    useEffect(() => {
        const run = async () => {
            const ok = await checkIsOwner();
            setIsOwner(ok);
        };
        void run();
    }, [checkIsOwner]);


    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deadline) return;

        const ts = Math.floor(new Date(deadline).getTime() / 1000);
        await createEvent({ title, description, deadlineTs: ts });

        setTitle("");
        setDescription("");
        setDeadline("");
    };

    const handleResolve = async (eventId: number) => {
        const outcome = outcomeSelections[eventId];
        if (outcome === undefined) return;
        await resolveEvent({ eventId, winningOutcome: outcome });
    };

    if (isOwner === false) {
        return (
            <div className="min-h-screen bg-linear-to-b from-[#050816] via-[#050816] to-[#020617] text-slate-50">
                <div className="max-w-md mx-auto px-4 pt-8">
                    <p className="text-sm text-slate-300">
                        You are not the contract owner. Connect with the deployer wallet to
                        access the admin panel.
                    </p>
                </div>
            </div>
        );
    }

    if (isOwner === null) {
        return (
            <div className="min-h-screen bg-linear-to-b from-[#050816] via-[#050816] to-[#020617] text-slate-50">
                <div className="max-w-md mx-auto px-4 pt-8">
                    <p className="text-sm text-slate-300">Checking admin rights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-[#050816] via-[#050816] to-[#020617] text-slate-50">
            <div className="max-w-md mx-auto px-4 pb-10 pt-6 space-y-6">
                <button
                    onClick={() => router.back()}
                    className="text-xs text-slate-400"
                >
                    ← Back
                </button>
                <header className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                        Admin
                    </p>
                    <h1 className="text-2xl font-semibold">
                        Manage{" "}
                        <span className="text-[#35D07F]">
                            CeloPredict
                        </span>{" "}
                        events
                    </h1>
                    <p className="text-xs text-slate-400">
                        Create new prediction markets and resolve finished games.
                    </p>
                </header>

                {/* Create event card */}
                <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl space-y-4">
                    <h2 className="text-sm font-medium text-slate-200">
                        Create new event
                    </h2>

                    <form onSubmit={handleCreate} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[11px] text-slate-400">
                                Title
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nigeria vs Ghana"
                                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#35D07F]"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] text-slate-400">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Full time result, regular time only."
                                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#35D07F] resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] text-slate-400">
                                Deadline (betting closes)
                            </label>
                            <input
                                type="datetime-local"
                                value={deadline}
                                placeholder="Setting deadline"
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#35D07F]"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-[11px] text-red-400">
                                {String(error.message || "Transaction error")}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="mt-2 w-full rounded-2xl bg-[#35D07F] py-2.5 text-sm font-semibold text-slate-900 disabled:bg-slate-700 disabled:text-slate-400"
                        >
                            {isPending ? "Creating..." : "Create event"}
                        </button>
                    </form>
                </section>

                {/* Existing events */}
                <section className="space-y-3">
                    <h2 className="text-sm font-medium text-slate-200">
                        Existing events
                    </h2>

                    <div className="space-y-3">
                        {events.length === 0 && (
                            <p className="text-xs text-slate-400">
                                No events yet. Create your first one above.
                            </p>
                        )}

                        {events.map((e) => {
                            const deadlineDate = new Date(
                                Number(e.deadline) * 1000,
                            );
                            const isPast = deadlineDate.getTime() < Date.now();

                            return (
                                <div
                                    key={e.id}
                                    className="rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-xs space-y-2"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-slate-100 font-medium">
                                                #{e.id} {e.title}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                {e.description}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] ${e.resolved
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/40"
                                                : "bg-amber-500/10 text-amber-400 border border-amber-500/40"
                                                }`}
                                        >
                                            {e.resolved ? "Resolved" : "Open"}
                                        </span>
                                    </div>

                                    <p className="text-[11px] text-slate-500">
                                        Deadline: {deadlineDate.toLocaleString()}
                                    </p>

                                    {!e.resolved && (
                                        <div className="mt-1 flex items-center gap-2">
                                            <select
                                                title="select winning outcome"
                                                className="flex-1 rounded-xl border border-white/10 bg-black/30 px-2 py-1 text-[11px] outline-none focus:border-[#35D07F]"
                                                value={
                                                    outcomeSelections[e.id] !== undefined
                                                        ? outcomeSelections[e.id]
                                                        : ""
                                                }
                                                onChange={(ev) =>
                                                    setOutcomeSelections((prev) => ({
                                                        ...prev,
                                                        [e.id]: Number(ev.target.value),
                                                    }))
                                                }
                                            >
                                                <option value="">Select winning outcome</option>
                                                <option value={0}>Outcome 0</option>
                                                <option value={1}>Outcome 1</option>
                                                <option value={2}>Outcome 2</option>
                                            </select>

                                            <button
                                                className="rounded-xl bg-white/5 border border-white/15 px-3 py-1 text-[11px] text-slate-100 hover:border-[#35D07F]/70 disabled:opacity-50"
                                                disabled={
                                                    !isPast ||
                                                    outcomeSelections[e.id] === undefined ||
                                                    isPending
                                                }
                                                onClick={() => void handleResolve(e.id)}
                                            >
                                                {isPending ? "Resolving..." : "Resolve"}
                                            </button>
                                        </div>
                                    )}

                                    {e.resolved && (
                                        <p className="text-[11px] text-slate-400">
                                            Winning outcome index:{" "}
                                            <span className="font-semibold text-slate-200">
                                                {e.winningOutcome}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}