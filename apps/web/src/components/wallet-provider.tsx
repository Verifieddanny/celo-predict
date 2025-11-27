"use client";

import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { WagmiProvider, createConfig, http, useConnect } from "wagmi";
import { celoSepolia } from "wagmi/chains";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [injectedWallet],
    },
  ],
  {
    appName: "my-minipay-app",
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  }
);

export const wagmiConfig = createConfig({
  chains: [celoSepolia],
  connectors,
  transports: {
    [celoSepolia.id]: http("https://forno.celo-sepolia.celo-testnet.org"),

  },
  ssr: true,
});

const queryClient = new QueryClient();

function WalletProviderInner({ children }: { children: React.ReactNode }) {
  const { connect, connectors } = useConnect();

  useEffect(() => {
    // Check if the app is running inside MiniPay
    if (window.ethereum && (window.ethereum as any).isMiniPay) {
      const injectedConnector = connectors.find((c) => c.id === "injected");
      if (injectedConnector) {
        connect({ connector: injectedConnector });
      }
    }
  }, [connect, connectors]);

  return <>{children}</>;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: "#35D07F",
          accentColorForeground: "#020617",
          borderRadius: "large",
          overlayBlur: "small",
        })}
          modalSize="compact">
          <WalletProviderInner>{children}</WalletProviderInner>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
