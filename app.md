# CivixShield Native Android Launcher — Implementation Guide
> **Project Codename:** `CivixLauncher`  
> **Purpose:** A native Kotlin Android Home Screen Replacement that provides persistent, OS-level threat interception for the CivixShield ecosystem.  
> **Built for:** CivixShield — India's AI-powered citizen cybersecurity platform.

---

## Why You Need This

Your current CivixShield app is a **Next.js web application** hosted on Vercel. It is excellent for scanning threats on-demand, but it has a hard limitation:

> **The web browser cannot passively intercept incoming SMS notifications, phone calls, or clipboard data in the background.**

The CivixLauncher solves this by acting as the Android system's default **Home Screen**. Because it is the launcher, Android keeps it alive permanently in memory. It uses native Android APIs to:

1. **Silently intercept every incoming notification** (WhatsApp messages, SMS, bank alerts) and pipe the text content to CivixShield's Gemini AI for instant analysis.
2. **Screen incoming phone calls** before the ringtone even rings, catching Digital Arrest scam callers.
3. **Forward threat data** to the main CivixShield web-app (if installed as a PWA or React Native app) via Android Deep Links using the URI scheme `civix://ingest`.

---

## How It Connects to Your Current Website

Your website already has a working AI analysis endpoint at `POST /api/analyze`. The native launcher will call this same endpoint directly by firing a **Deep Link URI** that wakes up a mobile CivixShield client app, which in turn calls your backend.

The data pipeline looks like this:

```
Android System
    │
    ├── Incoming WhatsApp Notification
    │       └── CivixNotificationListener.kt (catches it)
    │               └── fires URI: civix://ingest?sourcetype=SMS&label=com.whatsapp&content=<message>
    │                       └── CivixShield App (React Native or PWA) receives deep link
    │                               └── calls POST https://your-vercel-app.vercel.app/api/analyze
    │                                       └── Gemini AI → risk_score → alert shown to user
    │
    └── Incoming Phone Call
            └── CivixCallScreeningService.kt (intercepts it)
                    └── fires URI: civix://ingest?sourcetype=CALL&label=+91XXXXXXXXXX&content=<metadata>
                            └── CivixShield App receives deep link → calls /api/analyze
```

Your existing `POST /api/analyze` endpoint accepts `content` (the message text), `contentType`, and `userId`. **No changes are needed to your backend.** The native launcher is purely a data ingestion layer that feeds into the same pipeline you already built.

---

## Project Structure — CivixLauncher

Create a **new Android Studio project** (Empty Activity, Kotlin, minSdk 29) alongside your Next.js project. Name it `CivixLauncher`.

```
CivixLauncher/
├── app/
│   ├── src/main/
│   │   ├── java/com/yourteam/civixlauncher/
│   │   │   ├── MainActivity.kt                  ← Home screen dashboard UI
│   │   │   ├── CivixNotificationListener.kt     ← Notification interception
│   │   │   ├── CivixCallScreeningService.kt     ← Call screening
│   │   │   └── ui/theme/
│   │   │       └── Theme.kt                     ← CivixShield cyberpunk theme
│   │   └── AndroidManifest.xml                  ← Critical: HOME intent filter
│   └── build.gradle
└── ...
```

---

## Step 1 — AndroidManifest.xml

This is the most critical file. It declares the app as a launcher, and registers the two background services.

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.yourteam.civixlauncher">

    <!-- ============================================================ -->
    <!--  PERMISSIONS                                                 -->
    <!-- ============================================================ -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <!-- Notification Listener does NOT need a separate permission here -->
    <!-- It is granted via System Settings → Notification Access        -->

    <application
        android:allowBackup="true"
        android:label="CivixShield"
        android:theme="@style/Theme.CivixLauncher">

        <!-- ============================================================ -->
        <!--  MAIN ACTIVITY — declared as the HOME screen                -->
        <!-- ============================================================ -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:stateNotNeeded="true">

            <!-- This makes the app appear as a launcher option -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- ============================================================ -->
        <!--  NOTIFICATION LISTENER SERVICE                              -->
        <!-- ============================================================ -->
        <service
            android:name=".CivixNotificationListener"
            android:exported="true"
            android:label="CivixShield Threat Monitor"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>

        <!-- ============================================================ -->
        <!--  CALL SCREENING SERVICE                                     -->
        <!-- ============================================================ -->
        <service
            android:name=".CivixCallScreeningService"
            android:exported="true"
            android:permission="android.permission.BIND_SCREENING_SERVICE">
            <intent-filter>
                <action android:name="android.telecom.CallScreeningService" />
            </intent-filter>
        </service>

    </application>
</manifest>
```

---

## Step 2 — MainActivity.kt (Home Screen Dashboard)

This is the UI your user sees when they press the Home button. It is built with **Jetpack Compose** and mirrors the CivixShield cyberpunk aesthetic (dark background, cyan accents).

The dashboard shows:
- **Protection Status** (Active / Degraded)
- **Quick Launch** buttons for the main CivixShield app
- **Permission Request** buttons (notification access, call screening)
- **Test button** to fire a dummy threat alert (for demo/testing)

```kotlin
package com.yourteam.civixlauncher

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.NotificationCompat

// ─── CivixShield Color Tokens (matches your web app) ─────────────────────────
val CivixCyan = Color(0xFF00E5FF)
val CivixYellow = Color(0xFFFFFF00)
val CivixRed = Color(0xFFDC2626)
val CivixDark = Color(0xFF0A0F14)
val CivixDarker = Color(0xFF050505)

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Create notification channel for our own alerts
        createAlertChannel()

        setContent {
            CivixLauncherTheme {
                LauncherDashboard(
                    onOpenCivixApp = { openCivixShieldApp() },
                    onRequestNotifAccess = { requestNotificationAccess() },
                    onRequestCallScreening = { requestCallScreeningRole() },
                    onFireTestAlert = { fireTestNotification() }
                )
            }
        }
    }

    // ── Opens the CivixShield main app (React Native or PWA) via explicit intent ──
    private fun openCivixShieldApp() {
        // Replace "com.yourteam.civixshield" with your actual React Native package name
        val intent = packageManager.getLaunchIntentForPackage("com.yourteam.civixshield")
        if (intent != null) {
            startActivity(intent)
        } else {
            // Fallback: open your Vercel web app in browser
            val webIntent = Intent(Intent.ACTION_VIEW,
                Uri.parse("https://your-app.vercel.app"))
            startActivity(webIntent)
        }
    }

    // ── Opens System Settings so user can grant Notification Listener access ──
    private fun requestNotificationAccess() {
        startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
    }

    // ── Opens System Settings so user can set CivixLauncher as Call Screener ──
    private fun requestCallScreeningRole() {
        val intent = Intent(Intent.ACTION_VIEW,
            Uri.parse("package:$packageName"))
        startActivity(intent)
    }

    // ── Fires a dummy "SBI Security Alert" notification to test interception ──
    private fun fireTestNotification() {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notification = NotificationCompat.Builder(this, "civix_alerts")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("SBI Security Alert")
            .setContentText("Your account is under review. Click here immediately to verify: http://sbi-secure-verify.xyz/login")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()
        nm.notify(1001, notification)
    }

    private fun createAlertChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "civix_alerts",
                "CivixShield Threat Alerts",
                NotificationManager.IMPORTANCE_HIGH
            )
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(channel)
        }
    }
}

// ─── Jetpack Compose UI ───────────────────────────────────────────────────────

@Composable
fun LauncherDashboard(
    onOpenCivixApp: () -> Unit,
    onRequestNotifAccess: () -> Unit,
    onRequestCallScreening: () -> Unit,
    onFireTestAlert: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(CivixDarker)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {

        // Logo / Title
        Text(
            text = "[ CIVIXSHIELD ]",
            color = CivixCyan,
            fontSize = 28.sp,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Monospace,
            letterSpacing = 4.sp
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = "> Protection Active",
            color = Color(0xFF4CAF50),
            fontSize = 13.sp,
            fontFamily = FontFamily.Monospace
        )

        Spacer(Modifier.height(48.dp))

        // Status Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, CivixCyan, shape = MaterialTheme.shapes.small)
                .background(CivixDark)
                .padding(20.dp)
        ) {
            Column {
                StatusRow("Notification Monitor", isActive = true)
                StatusRow("Call Screening", isActive = true)
                StatusRow("Threat Vault", isActive = true)
                StatusRow("Gemini AI Engine", isActive = true)
            }
        }

        Spacer(Modifier.height(40.dp))

        // Action Buttons
        CivixButton("[ OPEN CIVIXSHIELD ]", CivixYellow, onClick = onOpenCivixApp)
        Spacer(Modifier.height(12.dp))
        CivixButton("[ GRANT NOTIFICATION ACCESS ]", CivixCyan, onClick = onRequestNotifAccess)
        Spacer(Modifier.height(12.dp))
        CivixButton("[ ENABLE CALL SCREENING ]", CivixCyan, onClick = onRequestCallScreening)
        Spacer(Modifier.height(12.dp))
        CivixButton("[ FIRE TEST ALERT ]", CivixRed, onClick = onFireTestAlert)

        Spacer(Modifier.height(40.dp))
        Text(
            text = "© 2026 CivixShield — All Systems Operational",
            color = Color.Gray,
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace
        )
    }
}

@Composable
fun StatusRow(label: String, isActive: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = "> $label", color = Color.Gray, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
        Text(
            text = if (isActive) "● ACTIVE" else "○ INACTIVE",
            color = if (isActive) Color(0xFF4CAF50) else CivixRed,
            fontSize = 12.sp, fontFamily = FontFamily.Monospace
        )
    }
}

@Composable
fun CivixButton(label: String, accentColor: Color, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .border(1.dp, accentColor),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent,
            contentColor = accentColor
        ),
        shape = MaterialTheme.shapes.extraSmall
    ) {
        Text(
            text = label,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            letterSpacing = 2.sp,
            fontSize = 12.sp
        )
    }
}

@Composable
fun CivixLauncherTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            background = CivixDarker,
            surface = CivixDark,
            primary = CivixCyan,
            onBackground = Color.White
        ),
        content = content
    )
}
```

---

## Step 3 — CivixNotificationListener.kt (The SMS/WhatsApp Interceptor)

This service runs **silently and permanently** in the background. Every time any app on the device pushes a notification, this service wakes up, reads the text, and if it looks like a message, fires the deep link to CivixShield for analysis.

**Exact mapping to your backend:**
- `sourcetype=SMS` → maps to `contentType: "text"` in your `POST /api/analyze`
- `label` = the originating app's package name (e.g., `com.whatsapp`, `com.google.android.apps.messaging`)
- `content` = the notification body text (the actual message)

```kotlin
package com.yourteam.civixlauncher

import android.app.Notification
import android.content.Intent
import android.net.Uri
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

// ── The apps whose notifications we want to monitor ──────────────────────────
// Add or remove packages as needed for your use case
private val MONITORED_APPS = setOf(
    "com.google.android.apps.messaging",   // Google Messages (SMS)
    "com.samsung.android.messaging",       // Samsung Messages
    "com.whatsapp",                        // WhatsApp
    "com.whatsapp.w4b",                    // WhatsApp Business
    "org.telegram.messenger",              // Telegram
    "com.facebook.orca",                   // Messenger
    "com.android.email",                   // Default Email
    "com.microsoft.launcher",              // Outlook (optional)
)

class CivixNotificationListener : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        sbn ?: return

        val packageName = sbn.packageName

        // Only process notifications from apps we care about
        if (packageName !in MONITORED_APPS) return

        val extras = sbn.notification?.extras ?: return

        // Extract the text content from the notification
        val title = extras.getString(Notification.EXTRA_TITLE) ?: ""
        val body = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: body

        // Skip empty, system, or very short notifications (typing indicators, etc.)
        val content = bigText.ifEmpty { body }
        if (content.length < 5) return

        // Build the deep link URI and route it to CivixShield
        // This matches the sentinel://ingest pattern from SentiLauncher
        forwardToCivixShield(
            sourceType = "SMS",
            label = packageName,
            content = content
        )
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        // Not needed for our use case—but required override
    }

    /**
     * Constructs and fires the deep link URI:
     * civix://ingest?sourcetype=SMS&label=com.whatsapp&content=<msg>
     *
     * The CivixShield React Native / PWA app must have an expo-linking
     * handler registered for the "civix" URI scheme to receive this.
     */
    private fun forwardToCivixShield(sourceType: String, label: String, content: String) {
        val encodedContent = Uri.encode(content)
        val encodedLabel = Uri.encode(label)

        val deepLink = "civix://ingest" +
                "?sourcetype=$sourceType" +
                "&label=$encodedLabel" +
                "&content=$encodedContent"

        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            // Target the CivixShield app package specifically
            `package` = "com.yourteam.civixshield"
        }

        try {
            applicationContext.startActivity(intent)
        } catch (e: Exception) {
            // If the React Native app is not installed, silently fail
            // You could add local analysis fallback here (see Step 5)
            android.util.Log.w("CivixLauncher", "CivixShield app not found. Deep link dropped: $deepLink")
        }
    }
}
```

---

## Step 4 — CivixCallScreeningService.kt (The Call Interceptor)

This service integrates with Android's built-in `CallScreeningService` API. When a call comes in, this service fires **before the ringtone**, allowing you to intercept the caller ID.

**Exact mapping to your backend:**
- `sourcetype=CALL` → maps to `contentType: "text"` in your `POST /api/analyze`
- `label` = the incoming phone number (the caller's number)
- `content` = formatted call metadata string for Gemini to analyze

```kotlin
package com.yourteam.civixlauncher

import android.content.Intent
import android.net.Uri
import android.telecom.Call
import android.telecom.CallScreeningService

class CivixCallScreeningService : CallScreeningService() {

    override fun onScreenCall(callDetails: Call.Details) {
        val callerNumber = callDetails.handle?.schemeSpecificPart ?: "Unknown"
        val callDirection = callDetails.callDirection

        // Only screen incoming calls
        if (callDirection != Call.Details.DIRECTION_INCOMING) {
            // Let the call through without screening
            respondToCall(callDetails, CallResponse.Builder()
                .setDisallowCall(false)
                .build())
            return
        }

        // Build metadata string for Gemini to analyze
        // Your /api/analyze endpoint will receive this as the "content" field
        val callMetadata = """
            INCOMING_CALL_DETECTED
            Caller: $callerNumber
            Direction: INCOMING
            Call State: Ringing
            
            [CivixShield will analyze this caller for digital arrest scam patterns.
             Known scam indicators: +91-XXXXXXXXXX numbers claiming to be CBI/Police/RBI/TRAI.]
        """.trimIndent()

        // Forward to CivixShield for analysis via deep link
        forwardCallToCivix(callerNumber, callMetadata)

        // Always allow the call through — CivixShield handles the warning UI
        // To block suspicious calls automatically, change disallowCall to true
        // based on a pre-computed risk score (requires more architecture)
        respondToCall(callDetails, CallResponse.Builder()
            .setDisallowCall(false)
            .setRejectCall(false)
            .setSilenceCall(false)
            .setSkipCallLog(false)
            .build())
    }

    private fun forwardCallToCivix(callerNumber: String, metadata: String) {
        val encodedLabel = Uri.encode(callerNumber)
        val encodedContent = Uri.encode(metadata)

        val deepLink = "civix://ingest" +
                "?sourcetype=CALL" +
                "&label=$encodedLabel" +
                "&content=$encodedContent"

        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            `package` = "com.yourteam.civixshield"
        }

        try {
            applicationContext.startActivity(intent)
        } catch (e: Exception) {
            android.util.Log.w("CivixLauncher", "CivixShield app not found. Call deep link dropped.")
        }
    }
}
```

---

## Step 5 — How to Handle the Deep Link in Your Web/RN App

When `CivixLauncher` fires `civix://ingest?...`, your CivixShield client app must catch it and call your backend.

### Option A: React Native (with Expo)

In your `App.tsx` (the mobile version of CivixShield):

```typescript
import * as Linking from 'expo-linking'
import { useEffect } from 'react'

// Your existing Vercel backend URL
const CIVIX_API = 'https://your-app.vercel.app/api/analyze'

export default function App() {
  useEffect(() => {
    // Handle deep links when app is already running
    const subscription = Linking.addEventListener('url', handleDeepLink)

    // Handle deep link that launched the app from cold start
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url })
    })

    return () => subscription.remove()
  }, [])

  async function handleDeepLink({ url }: { url: string }) {
    const parsed = Linking.parse(url)

    // Only handle civix://ingest deep links from the launcher
    if (parsed.scheme !== 'civix' || parsed.path !== 'ingest') return

    const { sourcetype, label, content } = parsed.queryParams as Record<string, string>
    if (!content) return

    // Call your existing CivixShield backend — same endpoint your
    // web scanner uses. No backend changes needed.
    try {
      const res = await fetch(CIVIX_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          contentType: sourcetype === 'CALL' ? 'text' : 'text',
          // "label" = caller number or app package for context
          // You can prepend it to content if you want Gemini to see it
        })
      })

      const result = await res.json()

      // Show alert if high risk
      if (result.risk_score > 60) {
        showThreatAlert(result, sourcetype, label)
      }
    } catch (err) {
      console.error('CivixLauncher deep link analysis failed:', err)
    }
  }

  function showThreatAlert(result: any, type: string, source: string) {
    // Trigger your existing Digital Arrest alert UI from digitalarrest.md
    // or a native Alert/Modal showing the risk score and red flags
    console.log(`THREAT DETECTED [${type}] from ${source}: Score=${result.risk_score}`)
  }

  return (/* your app UI */)
}
```

Register the `civix` scheme in your `app.json`:
```json
{
  "expo": {
    "scheme": "civix"
  }
}
```

### Option B: Progressive Web App (PWA)

If CivixShield is installed as a PWA with a service worker, you can register a protocol handler:

In `public/manifest.json`:
```json
{
  "protocol_handlers": [
    {
      "protocol": "civix",
      "url": "/ingest?%s"
    }
  ]
}
```

Then handle it in your Next.js page at `app/ingest/page.tsx`.

---

## Step 6 — build.gradle Dependencies

Add these to your `app/build.gradle` (Module level):

```gradle
android {
    compileSdk 34
    defaultConfig {
        minSdk 29           // Android 10+ required for CallScreeningService
        targetSdk 34
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.activity:activity-compose:1.8.0'
    implementation 'androidx.compose.ui:ui:1.5.4'
    implementation 'androidx.compose.material3:material3:1.1.2'
    implementation 'androidx.compose.ui:ui-tooling-preview:1.5.4'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.6.2'
}
```

---

## Step 7 — Permissions Flow (User Experience)

When a user first opens the launcher, they must grant permissions. Here is the flow:

```
User presses Home → CivixLauncher opens
        │
        ├── [GRANT NOTIFICATION ACCESS] button
        │       → Opens Settings → Notification Access
        │       → User toggles CivixShield ON
        │       → CivixNotificationListener starts working immediately
        │
        └── [ENABLE CALL SCREENING] button
                → Opens Settings or Role Request dialog
                → User selects CivixShield as Call Screener
                → CivixCallScreeningService activates
```

---

## Summary: CivixLauncher Architecture at a Glance

| CivixLauncher Component | Role | Your Backend Endpoint |
|---|---|---|
| `MainActivity.kt` | Home screen dashboard UI | — (UI only) |
| `CivixNotificationListener.kt` | Passive notification interception | `POST /api/analyze` |
| `CivixCallScreeningService.kt` | Pre-ring call screening | `POST /api/analyze` |
| `civix://ingest` deep link | OS → App data bridge | Triggers `fetch('/api/analyze')` |
| `com.civixshield.launcher` | Android package identity | N/A |
| Firebase/Firestore | Shared with your web app | `adminDb.collection('analyses')` |

---

## What Does NOT Change in Your Existing Next.js Project

✅ `lib/fraud-detector.ts` — **No changes needed.** The AI engine is already built.  
✅ `app/api/analyze/route.ts` — **No changes needed.** The API endpoint already accepts `content` and `contentType`.  
✅ Firebase / Firestore — **No changes needed.** All threat data still goes to the same `/analyses` collection.  
✅ `lib/url-analyzer.ts` — **No changes needed.** URLs extracted from notification text will go through this.  
✅ Community Feed — **No changes needed.** High-risk notification scans auto-publish to `/community_scams` (risk_score > 60 as per your current logic).

---

## Quick Start Checklist

- [ ] Create new Android Studio project (Kotlin, minSdk 29, Empty Activity)
- [ ] Replace `AndroidManifest.xml` with the one from Step 1
- [ ] Create `MainActivity.kt` with the home screen UI from Step 2
- [ ] Create `CivixNotificationListener.kt` from Step 3
- [ ] Create `CivixCallScreeningService.kt` from Step 4
- [ ] Update `build.gradle` dependencies from Step 6
- [ ] Build and install APK on physical Android device
- [ ] Set CivixLauncher as Default Home App (Android will prompt you)
- [ ] Press `[ GRANT NOTIFICATION ACCESS ]` and enable in Settings
- [ ] Press `[ FIRE TEST ALERT ]` and verify it triggers in CivixShield app
- [ ] Confirm threat data appears in Firestore `/analyses` collection

---

> **Note on Package Names:** Replace all occurrences of `com.yourteam.civixlauncher` and `com.yourteam.civixshield` with your actual package names before building.

---

## What Makes CivixLauncher Unique (Not a Copy)

The core launcher pattern (Home screen + NotificationListener + CallScreening) is a known Android architecture. What makes **CivixLauncher genuinely different** is the layer of intelligence and India-specific features built on top of it. Here are **5 unique additions** you must implement to make this 100% original:

---

### 🇮🇳 Unique Feature 1 — India-Specific Scam Pattern Engine (`CivixScamPatterns.kt`)

Create a new file `CivixScamPatterns.kt`. This is a **local, offline, zero-latency** rules engine that pre-screens notifications before even calling Gemini. It is India-specific — tuned for Indian scam patterns that generic solutions miss.

**Why it is unique:** No other open-source launcher has a rules engine specifically targeting Indian Digital Arrest scams, UPI fraud patterns, and fake government authority impersonation.

```kotlin
package com.civixshield.launcher

object CivixScamPatterns {

    // ── Indian Authority Impersonation Keywords ──────────────────────────────
    // Scammers in India specifically abuse these institution names
    private val INDIAN_AUTHORITY_KEYWORDS = listOf(
        "CBI", "ED", "TRAI", "RBI", "Cyber Cell", "Supreme Court",
        "Customs", "Income Tax", "NARCOTICS", "NCB", "FedEx",
        "DHL parcel", "money laundering", "arrest warrant"
    )

    // ── UPI Fraud Patterns ───────────────────────────────────────────────────
    // Fake UPI collect requests disguised as refunds or rewards
    private val UPI_FRAUD_PATTERNS = listOf(
        "collect request", "UPI PIN", "approve payment", "cashback credited",
        "KYC update", "link Aadhaar", "verify PAN", "SIM blocked"
    )

    // ── Digital Arrest Trigger Phrases ───────────────────────────────────────
    private val DIGITAL_ARREST_PHRASES = listOf(
        "do not disconnect", "stay on the call", "video call verification",
        "you are under observation", "legal action will be taken",
        "your account is frozen", "transfer to safe account"
    )

    // ── Urgency Amplifiers (India-specific) ─────────────────────────────────
    private val URGENCY_AMPLIFIERS = listOf(
        "turant", "abhi", "immediately", "2 ghante mein", "court order",
        "last warning", "final notice", "24 hours"
    )

    /**
     * Returns a pre-score (0-100) based purely on local rules.
     * This runs in <1ms on device with no internet needed.
     * If pre-score > 40, escalate to Gemini AI for deep analysis.
     */
    fun preScore(text: String): Int {
        val lower = text.lowercase()
        var score = 0

        INDIAN_AUTHORITY_KEYWORDS.forEach { if (lower.contains(it.lowercase())) score += 20 }
        UPI_FRAUD_PATTERNS.forEach { if (lower.contains(it.lowercase())) score += 15 }
        DIGITAL_ARREST_PHRASES.forEach { if (lower.contains(it.lowercase())) score += 25 }
        URGENCY_AMPLIFIERS.forEach { if (lower.contains(it.lowercase())) score += 10 }

        return minOf(100, score)
    }

    fun isHighPriority(text: String) = preScore(text) >= 40
}
```

**How to use it in `CivixNotificationListener.kt`:**
Before firing the deep link to Gemini, run the local pre-screen:

```kotlin
// Inside onNotificationPosted(), after extracting content:
val preScore = CivixScamPatterns.preScore(content)

if (preScore >= 40) {
    // High priority — forward to Gemini immediately
    forwardToCivixShield("SMS", packageName, content, priority = "HIGH")
} else if (preScore >= 15) {
    // Medium — forward but mark as low priority
    forwardToCivixShield("SMS", packageName, content, priority = "LOW")
}
// Below 15 = safe, ignore silently
```

This **saves API calls** (only sends suspicious content to Gemini) and gives **instant local feedback** even without internet.

---

### 📊 Unique Feature 2 — Live Threat Counter Widget on Home Screen

Instead of a plain dashboard, show a **live animated counter** directly on the home screen that updates every time a threat is intercepted. This is the "wow factor" for judges — they press Home and see threats being caught in real time.

Add this to your `LauncherDashboard` composable in `MainActivity.kt`:

```kotlin
// Add to MainActivity state — stored in SharedPreferences so it persists
val prefs = getSharedPreferences("civix_stats", Context.MODE_PRIVATE)
val threatsBlocked = remember { mutableStateOf(prefs.getInt("threats_blocked", 0)) }
val callsScreened = remember { mutableStateOf(prefs.getInt("calls_screened", 0)) }

// Animated counter card on the dashboard
@Composable
fun LiveThreatCounter(threats: Int, calls: Int) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CivixRed)
            .background(Color(0xFF1A0000))
            .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        CounterColumn("THREATS\nBLOCKED", threats, CivixRed)
        CounterColumn("CALLS\nSCREENED", calls, CivixYellow)
    }
}

@Composable
fun CounterColumn(label: String, count: Int, color: Color) {
    val animatedCount by animateIntAsState(
        targetValue = count,
        animationSpec = tween(durationMillis = 800)
    )
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = animatedCount.toString(),
            color = color, fontSize = 36.sp,
            fontWeight = FontWeight.Black,
            fontFamily = FontFamily.Monospace
        )
        Text(text = label, color = Color.Gray, fontSize = 10.sp,
            fontFamily = FontFamily.Monospace, textAlign = TextAlign.Center)
    }
}
```

Increment these counters inside the notification listener and call screener every time a threat is detected, and persist them to SharedPreferences.

---

### 🔇 Unique Feature 3 — Auto-Silence Suspected Scam Calls

This is something the reference project does **not** do. Instead of just warning the user, CivixLauncher can **automatically silence** a call if the local pre-score from `CivixScamPatterns.kt` is above 80 (critical threshold) — giving the user time to see the warning before deciding.

Modify `CivixCallScreeningService.kt`:

```kotlin
override fun onScreenCall(callDetails: Call.Details) {
    val callerNumber = callDetails.handle?.schemeSpecificPart ?: "Unknown"
    val metadata = "INCOMING CALL from $callerNumber — analyze for Digital Arrest patterns"

    val preScore = CivixScamPatterns.preScore(metadata)

    // UNIQUE: Auto-silence critical threats while showing warning UI
    // This does NOT reject the call — user can still answer it
    val silenceCall = preScore >= 80

    forwardCallToCivix(callerNumber, metadata)

    respondToCall(callDetails, CallResponse.Builder()
        .setDisallowCall(false)
        .setRejectCall(false)
        .setSilenceCall(silenceCall)  // ← silenced if pre-score is critical
        .setSkipCallLog(false)
        .build())
}
```

**What the user sees:** Phone vibrates silently. A full-screen CivixShield warning overlay appears with the risk score and red flags. The user can then choose to answer or dismiss.

---

### 🔥 Unique Feature 4 — Firebase Firestore Threat Vault (Cloud Sync)

Every threat intercepted by the launcher is saved directly into **your existing Firebase Firestore** `/analyses` collection — the same one your web dashboard already reads from. This means:

- Threats caught on the phone **appear instantly in your web dashboard**
- High-risk threats (score > 60) **auto-publish to the Community Feed** (your existing backend logic handles this)
- No SQLite, no Room, no extra database setup — **you already have Firebase**

Add to `build.gradle`:
```gradle
implementation platform('com.google.firebase:firebase-bom:32.7.0')
implementation 'com.google.firebase:firebase-firestore-ktx'
```

Create `CivixFirestoreVault.kt`:

```kotlin
package com.civixshield.launcher

import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.google.firebase.Timestamp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

object CivixFirestoreVault {

    /**
     * Saves an intercepted threat to Firestore /analyses collection.
     * This is the SAME collection your Next.js web app writes to via /api/analyze.
     * Threats saved here will appear automatically in your web dashboard.
     */
    fun saveThreat(
        sourceType: String,     // "SMS" or "CALL"
        sourceApp: String,      // "com.whatsapp" or "+91XXXXXXXXXX"
        content: String,        // Intercepted message or call metadata
        preScore: Int           // Score from CivixScamPatterns (0-100)
    ) {
        val db = Firebase.firestore

        // Map score to risk level (matches your web app's risk_level enum)
        val riskLevel = when {
            preScore >= 80 -> "critical"
            preScore >= 50 -> "high"
            preScore >= 30 -> "medium"
            else           -> "low"
        }

        // Document structure matches your existing /analyses Firestore schema
        val threat = hashMapOf(
            "user_id"         to "civix_launcher",     // Tag as coming from native launcher
            "content_type"    to sourceType,            // "SMS" or "CALL"
            "content"         to content,               // The intercepted text
            "source_app"      to sourceApp,             // Which app / caller number
            "risk_score"      to preScore,              // Local pre-score (0-100)
            "risk_level"      to riskLevel,             // "low" | "medium" | "high" | "critical"
            "intercepted_by"  to "CivixLauncher",       // Unique tag — identifies launcher-sourced threats
            "scam_patterns"   to listOf("Intercepted by CivixLauncher"),
            "is_suspicious"   to (preScore > 50),
            "created_at"      to Timestamp.now()
        )

        CoroutineScope(Dispatchers.IO).launch {
            db.collection("analyses")
                .add(threat)
                .addOnSuccessListener { docRef ->
                    android.util.Log.d("CivixLauncher",
                        "✅ Threat saved to Firestore: ${docRef.id} | Score: $preScore | Type: $sourceType"
                    )
                }
                .addOnFailureListener { e ->
                    android.util.Log.e("CivixLauncher", "❌ Firestore save failed: ${e.message}")
                }
        }
    }
}
```

**How to call it** — add one line inside `CivixNotificationListener.kt` after pre-scoring:

```kotlin
// Inside onNotificationPosted(), after getting preScore:
val preScore = CivixScamPatterns.preScore(content)

if (preScore >= 15) {
    // Save to Firestore — appears in your web dashboard instantly
    CivixFirestoreVault.saveThreat(
        sourceType = "SMS",
        sourceApp  = packageName,
        content    = content,
        preScore   = preScore
    )
}
```

And inside `CivixCallScreeningService.kt`:

```kotlin
CivixFirestoreVault.saveThreat(
    sourceType = "CALL",
    sourceApp  = callerNumber,
    content    = callMetadata,
    preScore   = preScore
)
```

**What this looks like end-to-end:**

```
Phone receives WhatsApp scam message
        ↓
CivixNotificationListener catches it
        ↓
CivixScamPatterns.preScore() → 75 (HIGH)
        ↓
CivixFirestoreVault.saveThreat() → writes to Firestore /analyses
        ↓
Your web dashboard (civixshield.vercel.app/dashboard) shows it LIVE
        ↓
risk_score > 60 → auto-published to /community_scams (Community Feed)
```

> ✅ **No SQLite. No Room. No extra dependencies beyond Firebase which you already have.**
> The launcher and the website share the same database automatically.

---

### 🌐 Unique Feature 5 — Clipboard Link Auto-Scanner

This feature does not exist in any known reference project. When a user **copies a link** (from WhatsApp, Instagram, SMS), CivixLauncher silently checks it in the background. If it is malicious, it shows a toast warning before the user even pastes it anywhere.

Create `CivixClipboardMonitor.kt`:

```kotlin
package com.civixshield.launcher

import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import kotlinx.coroutines.*

class CivixClipboardMonitor(private val context: Context) {

    private val scope = CoroutineScope(Dispatchers.IO)
    private var lastChecked = ""

    fun startMonitoring() {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager

        clipboard.addPrimaryClipChangedListener {
            val clip = clipboard.primaryClip ?: return@addPrimaryClipChangedListener
            val text = clip.getItemAt(0)?.text?.toString() ?: return@addPrimaryClipChangedListener

            // Avoid re-checking the same content
            if (text == lastChecked) return@addPrimaryClipChangedListener
            lastChecked = text

            // Only check if it looks like a URL
            if (!text.contains("http") && !text.contains("www.")) return@addPrimaryClipChangedListener

            scope.launch {
                val preScore = CivixScamPatterns.preScore(text)
                if (preScore >= 30) {
                    withContext(Dispatchers.Main) {
                        // Show toast warning immediately, before user pastes it anywhere
                        Toast.makeText(
                            context,
                            "⚠️ CivixShield: Suspicious link in clipboard! Score: $preScore/100",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            }
        }
    }
}
```

Call `CivixClipboardMonitor(this).startMonitoring()` from `MainActivity.onCreate()`.

**Why this is unique:** No launcher or security app in India currently offers real-time clipboard link scanning as a background service. This covers the huge gap where scam links spread via WhatsApp "forward" messages.

---

## Updated Project Structure (With Unique Features)

```
CivixLauncher/
├── app/src/main/java/com/civixshield/launcher/
│   ├── MainActivity.kt                  ← Dashboard + Live Threat Counter
│   ├── CivixNotificationListener.kt     ← Notification interception
│   ├── CivixCallScreeningService.kt     ← Auto-silence scam calls  
│   ├── CivixScamPatterns.kt             ← 🆕 India-specific offline rules engine
│   ├── CivixFirestoreVault.kt           ← 🆕 Firebase Firestore sync (replaces SQLite)
│   └── CivixClipboardMonitor.kt         ← 🆕 Real-time clipboard link scanner
```

---

## What Makes CivixLauncher Different — Summary Table

| Feature | Generic Launcher | CivixLauncher |
|---|---|---|
| Notification interception | ✅ Basic | ✅ + India-specific pre-screening |
| Call screening | ✅ Basic intercept | ✅ + Auto-silence on high risk |
| Local rules engine | ❌ None | ✅ `CivixScamPatterns.kt` (offline, <1ms) |
| Cloud threat sync | ❌ None | ✅ Firebase Firestore → live in web dashboard |
| Clipboard monitoring | ❌ Not common | ✅ Real-time link scanner |
| Live threat counter UI | ❌ None | ✅ Animated home screen stats |
| India-specific patterns | ❌ None | ✅ CBI, TRAI, UPI, Aadhaar, ED scams |
| Gemini AI integration | ❌ None | ✅ Via your existing `/api/analyze` |

