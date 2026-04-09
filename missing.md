# Missing Features & Gap Analysis: Web vs. CivixShield Mobile Architecture

Based on the analysis of the current CivixShield web application (Next.js) against the described **CivixShield** hybrid mobile architecture, the following features, capabilities, and architectural components are currently **missing** from your web-based implementation. 

If you are transitioning to an app-based application using React Native and Expo, these are the primary gaps you will need to bridge:

## 1. Core Architecture & Native Capabilities
- **Mobile Framework & Routing:** The current app uses Next.js web routing. It lacks a native navigation stack (e.g., `@react-navigation/native-stack` and `@react-navigation/bottom-tabs`) required for seamless mobile transitions.
- **Onboarding Workflow:** There is no localized onboarding state management. CivixShield mobile uses `AsyncStorage` to track if a user has seen the tutorial.
- **Background Processing & Web Workers:** The web app currently functions strictly in the foreground. It lacks the persistent background execution needed for constant threat monitoring.

## 2. Local-First Processing & Edge Computing
- **Offline / Edge Analysis:** The current web app heavily relies on server API calls (e.g., `/api/analyze`) to perform threat detection, causing latency and requiring an active internet connection.
- **Custom Rules Engine (`rulesEngine.ts`):** The web app is missing a dedicated, on-device deterministic rules engine for instant, zero-latency parsing of URLs and SMS payloads without server round-trips.
- **Hybrid Scoring:** It lacks the layered approach combining strict local deterministic rules with weighted, on-device lightweight indicators before hitting an API backend.

## 3. Dedicated Device-Level Application Modules
- **Live Call Analysis (`LiveCallScreen.tsx`):** The web app currently cannot capture or process real-time audio. You are missing the `expo-av` integration and chunk-based audio processing required for live scam signal detection over phone calls.
- **Separated Tool Screens:** While the web has a central `Scanner` component, an app requires native tabs separating the SMS Shield, URL Scanner, and Call Monitoring into distinct, focused UI screens.

## 4. Local Storage (Threat Vault)
- **SQLite Persistence (`expo-sqlite`):** The web app likely stores data in standard cloud databases (Firebase/Upstash) or non-persistent browser state. You are missing an on-device local SQLite database to securely store the "Threat Vault" audit trail natively and offline.
- **Local Threat History:** No offline-accessible threat log that retains history unconditionally without a cloud login.

## 5. Native OS Ingestion & Interception
- **Deep-Link Handoff (`civix://ingest`):** Completely absent in a web context. You need to implement `expo-linking` in your `App.tsx` to handle background data payloads passed from the OS.
- **OS Layer Integration:** The web app cannot read Android Notification listeners, intercept incoming SMS directly, or monitor incoming clipboard links automatically in the background.

## 6. Premium Native UI/UX Implementations
- **Physical Feedback:** Missing `expo-haptics` for tactile feedback during threat alerts and scan completions.
- **Native Safe Areas:** Missing `react-native-safe-area-context` to handle device notches, dynamic islands, and home indicator bars gracefully.
- **Native Rendering Effects:** While the web uses CSS styles, transitioning to the app will require `expo-linear-gradient` and `expo-blur` for high-performance, native-level premium visual effects instead of DOM-based css filters. 

## Summary for Transition
To migrate from the current web implementation to the CivixShield mobile app, prioritize **dropping the server dependency** for basic scans (implementing your rules engine locally in TS), initializing a **local SQLite database**, and implementing native hooks like **`expo-av`** and **Deep Linking (`expo-linking`)** to achieve true background hybrid security capabilities.
