"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAdminEvents } from "@/hooks/useAdminEvents";
import { useEffect, useState } from "react";

import { ConnectButton } from "@/components/connect-button"
import { useAccount } from "wagmi"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Docs", href: "https://docs.celo.org", external: true },
]

export function Navbar() {
  const { checkIsOwner } = useAdminEvents();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    const run = async () => {
      const ok = await checkIsOwner();
      setIsOwner(ok);
    };
    void run();
  }, [checkIsOwner]);

  return (
    <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5 backdrop-blur-xl">
      {/* Left side - logo and brand */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#35D07F] to-[#FFD166] text-[11px] font-bold text-slate-900 shadow-sm">
          CP
        </div>

        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold text-slate-50">
            CeloPredict
          </span>
          <span className="text-[10px] text-slate-400">
            Play to predict
          </span>
        </div>
      </div>

      {/* Right side - compact actions */}
      <div className="flex items-center gap-1">
        {/* Links as small pills for mobile */}
        <div className="flex items-center gap-1 text-[11px]">
          {isOwner && (
            <Link
              href="/admin"
              className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-slate-200 hover:border-[#35D07F]/70"
            >
              Admin
            </Link>
          )}

          <Link
            href="/me"
            className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-slate-200 hover:border-[#35D07F]/70"
          >
            My bets
          </Link>
        </div>

        {/* Wallet button kept tight for mobile */}
        <div className="ml-1">
          <ConnectButton />
        </div>
      </div>
    </nav>
  )
}
