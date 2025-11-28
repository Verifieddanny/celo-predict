# CeloPredict

CeloPredict is a mobile-first prediction market built on Celo Sepolia Testnet where users can:

- Join community pools on football and crypto
- Stake CELO on home / draw / away outcomes
- Share the prize pool if they are correct
- Use a clean, MiniPay-friendly interface on mobile

The project is structured as a monorepo:

```

apps/
contracts/    # Foundry smart contracts
web/          # Next.js + Wagmi + RainbowKit + MiniPay UI

````

---

## 1. Tech Stack

**Smart contracts**

- Solidity `^0.8.20`
- Foundry (forge, cast)
- Celo Sepolia network

**Frontend**

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Wagmi + RainbowKit
- Celo chains (Celo Sepolia)
- MiniPay deep link (`https://minipay.opera.com/add_cash`)

---

## 2. Contract: `apps/contracts`

### 2.1. Contract overview

Main contract: `apps/contracts/src/CeloPredict.sol`

Core features:

- Create events with three outcomes:
  - `0` Home to win
  - `1` Draw
  - `2` Away to win
- Place bets by sending CELO to `placeBet(eventId, outcome)`
- Track totals per outcome and overall pool
- Resolve events and set `winningOutcome`
- Allow winners to call `claimReward(eventId)` to receive their share
- Track per user events and bets via:
  - `getUserEvents(address user) returns (uint256[])`
  - `getBet(uint256 eventId, address user) returns (Bet)`

Deployed contract (Celo Sepolia):

##### 0xd60dD40EBB2b0Aec09445bAEdE0f4d6f3C176EEE

This address is used by the frontend. If you redeploy, update the address in the web app.

### 2.2. Prerequisites

* Node.js 18+

* Foundry installed:

  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup

* Celo Sepolia RPC URL, for example Forno:

  * `https://forno.celo-sepolia.celo-testnet.org`

* A funded Celo Sepolia account (for deployment gas)

### 2.3. Install dependencies

From repo root:

```bash
cd apps/contracts
forge install
```

(if you use git submodules or extra dependencies, run them here)

### 2.4. Running tests

```bash
cd apps/contracts
forge test
```

### 2.5. Deployment

Deployment script:
`apps/contracts/script/CeloPredict.s.sol`

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {CeloPredict} from "../src/CeloPredict.sol";

contract CeloPredictScript is Script {
    CeloPredict public celoPredict;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        celoPredict = new CeloPredict();

        vm.stopBroadcast();
    }
}
```

You can deploy with:

```bash
cd apps/contracts

export RPC_URL="https://forno.celo-sepolia.celo-testnet.org"
export PRIVATE_KEY=0xyourprivatekey

forge script script/CeloPredict.s.sol:CeloPredictScript \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --chain-id 11142220
```

After deployment, note the new address and update the frontend config if needed.

---

## 3. Web App: `apps/web`

### 3.1. Overview

The web app is a mobile-first Next.js UI that:

* Connects via RainbowKit and Wagmi
* Targets Celo Sepolia
* Detects MiniPay and auto connects the injected provider
* Shows:

  * Home page with hero, live events, finished events
  * Event cards with deadlines and pool info
  * My Predictions page with your stakes, outcomes and claim buttons
  * Admin panel (only for contract owner) to create and resolve events

### 3.2. Prerequisites

* Node.js 18+
* pnpm / yarn / npm (any one)
* Wallet:

  * MiniPay inside Opera, or
  * Any EVM wallet that can connect to Celo Sepolia

### 3.3. Install dependencies

From repo root:

```bash
cd apps/web
npm install
# or
yarn
# or
pnpm install
```

### 3.4. Environment variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_CELO_PREDICT_ADDRESS=0xd60dD40EBB2b0Aec09445bAEdE0f4d6f3C176EEE
NEXT_PUBLIC_CELO_SEPOLIA_RPC=https://forno.celo-sepolia.celo-testnet.org
```

In code, the contract address is wired via `CELO_PREDICT_ADDRESS` in `lib/celoPredict.ts`. If you change the deployment, update that constant or use the env var.

### 3.5. Running the dev server

```bash
cd apps/web
npm run dev
# or yarn dev or pnpm dev
```

Open:

```text
http://localhost:3000
```

---

## 4. How it works (UI)

### 4.1. Home page (`/`)

* Hero section:

  * Title: CeloPredict
  * Subtitle: Predict, play, earn CELO
  * Stats:

    * Live markets (only events that are active and not past deadline)
    * Total events
  * Buttons:

    * `Explore events` scrolls to live events section
    * `My predictions` goes to `/me`

* MiniPay top up:

  * A pill-style link:

    * `Top up in MiniPay`
    * Links to `https://minipay.opera.com/add_cash`
  * In a normal browser it behaves like a web link
  * Inside MiniPay it opens the MiniPay top up flow

* Events lists:

  * **Live events** section:

    * Shows only events where `active == true` and `deadline > now`
  * **Finished events** section:

    * Shows events that are inactive or whose deadline has passed
  * Both use `EventCard` and read on-chain data via Wagmi `readContract`

### 4.2. My Predictions (`/me`)

Shows only the events the connected address has bet in.

Hook: `useMyPredictions`:

* Calls `getUserEvents(address)` on the contract to get event ids
* For each id it loads:

  * `getEvent`
  * `getPool`
  * `getBet(eventId, user)`
* Returns:

  * `betAmount` (your stake)
  * `betOutcome` (0 / 1 / 2)
  * `poolTotal`
  * `event` metadata
  * `claimed` status

UI:

* Shows:

  * Event title and description
  * Deadline
  * Your stake in CELO (formatted `1.000 CELO` etc)
  * Your predicted outcome (Home to Win, Draw, Away to Win)
  * Total pool
  * Winning outcome (if resolved)
  * Badge for status:

    * Pending resolution
    * Lost
    * Won - claimable
    * Claimed

* Claim button:

  * Uses `useClaimReward` hook
  * Calls `claimReward(eventId)`
  * Disables while pending
  * On success, triggers `refresh()` in `useMyPredictions` to update the UI

### 4.3. Admin panel (`/admin`)

Visible only if the connected address matches `owner()` of the contract.

Hook: `useAdminEvents`:

* `checkIsOwner`:

  * Reads `owner()` from the contract and compares with `useAccount().address`
* `createEvent`:

  * Calls `createEvent(title, description, deadline)`
  * `deadline` is a unix timestamp
* `resolveEvent`:

  * Calls `resolveEvent(eventId, winningOutcome)`

Admin UI (summary):

* Form to create a new event:

  * Match title, description
  * Deadline (usually chosen via date/time input, converted to unix seconds)
* Table / list of existing events:

  * Event id, title, deadline, resolved status
  * Inputs or controls to set a winning outcome and resolve

---

## 5. MiniPay integration details

* The app uses a `WalletProvider` wrapper with:

  * Wagmi configured for `celoSepolia`
  * RainbowKit with `darkTheme` so the modal matches the dark UI
  * `connectorsForWallets` with `injectedWallet` so MiniPay is used automatically

* On mount

* The MiniPay top up pill is diplayed on the home page which links to:

  ```text
  https://minipay.opera.com/add_cash
  ```

---

## 6. Production build

To build the frontend:

```bash
cd apps/web
npm run build
npm run start
```

Make sure the environment variables for WalletConnect, RPC and contract address are set in your deployment environment.

---

## 7. Notes and future improvements

* Add more event types (crypto price, eSports, etc)
* Add graph of pool growth per event
* Add localization for different languages
* Add an on-chain fee or treasury for protocol revenue
* Improve validation and error feedback on admin actions

This README should be enough for judges or collaborators to:

* Set up the contracts and understand deployment
* Run the web app locally
* Connect with MiniPay or any CELO wallet
* Use the prediction and reward flows end to end

