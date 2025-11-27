import Link from "next/link";

type EventCardProp = {
    id: number;
    title: string;
    description: string;
    deadline: string;
    pool: bigint | undefined;
}
export default function EventCard({ event }: { event: EventCardProp }) {
    return (
        <Link href={`/event/${event.id}`}>
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-slate-900/80 to-slate-950/90 p-4 backdrop-blur-xl transition transform hover:-translate-y-0.5 hover:border-[#35D07F]/60">
                <div className="absolute -right-16 -top-16 h-28 w-28 rounded-full bg-[#35D07F]/10 blur-3xl" />
                <div className="relative flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-slate-50">
                            {event.title}
                        </h3>
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                            {event.deadline}
                        </span>
                    </div>

                    <p className="text-xs text-slate-400">
                        {event.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-xs">
                        <div className="flex flex-col">
                            <span className="text-slate-400">Total pool</span>
                            <span className="font-semibold text-slate-50">
                                {event.pool}
                            </span>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-100 group-hover:border-[#35D07F]/70 group-hover:text-[#35D07F]">
                            View and play
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
