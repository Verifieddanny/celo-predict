"use client";

import { ConnectButton as RainbowKitConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";

export function ConnectButton() {
  const [isMinipay, setIsMinipay] = useState(false);

  useEffect(() => {
    // @ts-ignore
    if (window.ethereum?.isMiniPay) {
      setIsMinipay(true);
    }
  }, []);

  if (isMinipay) return null;

  return (
    <RainbowKitConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) return null;

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className="rounded-xl bg-[#35D07F] px-3 py-1.5 text-xs font-semibold text-black shadow hover:opacity-90"
            >
              Connect
            </button>
          );
        }

        if (!chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openAccountModal}
              className="flex font-semibold items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-100 hover:bg-white/10"
            >
              <span className="max-w-[70px] truncate">
                {account.displayName}
              </span>
              {account.displayBalance && (
                <span className="text-[10px] font-bold text-slate-400">
                  {account.displayBalance}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={openChainModal}
            className="rounded-xl bg-red-600 px-3 py-1.5 text-xs text-white"
          >
            Wrong network
          </button>
        );
      }}
    </RainbowKitConnectButton.Custom>
  );
}
