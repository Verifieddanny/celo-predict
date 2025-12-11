"use client";

import Link from "next/link";
import EventCard from "../components/event-card";
import { useEvents } from "../hooks/useEvents";

export default function HomePage() {
  const { events } = useEvents();

  const now = Math.floor(Date.now() / 1000);

  const liveEvents = events.filter(
    (e) => e.active && Number(e.deadline) > now,
  );
  const endedEvents = events.filter(
    (e) => !e.active || Number(e.deadline) <= now,
  );

  const totalEvents = events.length;

  return (
    <div className="space-y-5 relative">
      {/* Hero */}
      <section className="pt-4 px-4 pb-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-slate-900 via-slate-900 to-black p-5 backdrop-blur-xl">
          {/* Glow accents */}
          <div className="pointer-events-none absolute -left-20 top-0 h-40 w-40 rounded-full bg-[#35D07F]/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-10 h-52 w-52 rounded-full bg-[#FFD166]/10 blur-3xl" />

          <div className="relative flex flex-col gap-4">
            {/* Top pill and tiny label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#35D07F]" />
              Live on Celo Mainnet, mobile first
            </div>

            {/* Main heading */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                CeloPredict
              </p>
              <h1 className="text-3xl font-semibold leading-tight">
                Predict, play,{" "}
                <span className="text-[#35D07F]">earn CELO.</span>
              </h1>
              <p className="text-sm text-slate-300">
                Join community pools on football and crypto, if you are right you
                share the pot. Built for quick picks on your phone, not spreadsheets.
              </p>
            </div>

            {/* Stats and actions */}
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              {/* Stats */}
              <div className="flex gap-4 text-xs">
                <div>
                  <p className="text-slate-400">Live markets</p>
                  <p className="text-base font-semibold text-slate-50">
                    {liveEvents.length}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Total events</p>
                  <p className="text-base font-semibold text-slate-50">
                    {totalEvents}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 text-xs">
                <Link
                  href="#events"
                  className="flex-1 rounded-2xl bg-[#35D07F] px-4 py-2 text-center font-semibold text-slate-900"
                >
                  Explore events
                </Link>
                <Link
                  href="/me"
                  className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-center font-medium text-slate-100"
                >
                  My predictions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Link
        href="https://minipay.opera.com/add_cash"
        target="_blank"
        rel="noreferrer"
        className="text-[11px] mx-4 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-100"
      >
        Top up in MiniPay
      </Link>

      {/* Live events list */}
      <section id="events" className="space-y-3 px-4">
        <h2 className="text-sm font-medium text-slate-300">
          Live events
        </h2>

        <div className="flex flex-col w-full gap-y-2 max-h-[280px] h-full overflow-y-auto no-scroll pt-4">
          {liveEvents.map((e) => (
            <EventCard
              key={e.id}
              event={{
                id: e.id,
                title: e.title,
                description: e.description,
                deadline: new Date(
                  Number(e.deadline) * 1000,
                ).toLocaleString(),
                pool: undefined,
              }}
            />
          ))}

          {liveEvents.length === 0 && (
            <p className="text-xs text-slate-400">
              No live events right now. Check back soon or watch your past predictions.
            </p>
          )}
        </div>
      </section>

      {/* Ended events list */}
      {endedEvents.length > 0 && (
        <section className="space-y-3 px-4 pb-6">
          <h2 className="text-sm font-medium text-slate-300">
            Finished events
          </h2>
          <p className="text-[11px] text-slate-500">
            These events have passed their deadline. If you participated, you can review results and claim from the portfolio page.
          </p>

          <div className="flex flex-col w-full gap-y-2 max-h-[280px] h-full overflow-y-auto no-scroll pt-4">
            {endedEvents.map((e) => (
              <EventCard
                key={e.id}
                event={{
                  id: e.id,
                  title: e.title,
                  description: e.description,
                  deadline: new Date(
                    Number(e.deadline) * 1000,
                  ).toLocaleString(),
                  pool: undefined,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
