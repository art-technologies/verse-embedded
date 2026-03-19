# Verse Elements

## Overview

Verse Elements is a lightweight SDK that lets your website perform authenticated user actions on Verse — sign in, sign out, show a purchase dialog, check reserves — without embedding the full Verse UI.

Under the hood, Verse Elements uses hidden iframes and [penpal](https://github.com/nicbarker/penpal) to communicate with Verse. The iframes are sandboxed and managed by the SDK — you don't need to deal with them directly.

## Verse Elements vs Verse Frame

|                   | Verse Frame                               | Verse Elements                                                                                                     |
| ----------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Approach**      | Embed the Verse website as an iframe      | Use Verse as an API from your own website                                                                          |
| **UI**            | Verse's UI, with optional style tweaks    | You build all the UI and logic                                                                                     |
| **Data fetching** | Handled by the iframe                     | Use Verse Public API (TBA) for public data (artworks, prices, artists) and Verse Elements for auth-related actions |
| **Control**       | Limited — the overall flow stays the same | Full — you decide the layout, flow, and UX                                                                         |

**Use Verse Frame** when you want a quick, drop-in integration that looks and works like Verse out of the box.

**Use Verse Elements** when you need full control over the user experience and only need Verse for authenticated operations.

## Setup

```html
<script src="https://your-cdn/verse-elements.js"></script>

<script>
  const elements = new VerseElements({ baseUrl: "https://iframe.verse.works" });
</script>
```

## API Reference

### `checkAuth()`

Check if the current user is authenticated on Verse.

**Returns:** `Promise<boolean>`

```javascript
const isSignedIn = await elements.checkAuth();
```

---

### `authorise()`

Opens a sign-in dialog overlay. The user can close the dialog without signing in.

**Returns:** `Promise<VerseAuthResult | null>` — returns `null` if the user closes the dialog.

```typescript
// VerseAuthResult
{
  success: boolean
  verseUserId?: string
  verseUsername?: string
}
```

```javascript
const result = await elements.authorise();
if (result) {
  console.log("Signed in as", result.verseUsername);
}
```

---

### `signOut()`

Signs out the currently authenticated user.

**Returns:** `Promise<void>`

**Throws:** if no user is signed in or the sign-out operation fails.

```javascript
await elements.signOut();
```

---

### `openPurchaseDialog(artworkId, payload, callbacks)`

Shows a full-screen purchase dialog. A loading spinner overlay is displayed while the dialog loads.

**Parameters:**

| Parameter   | Type                | Description             |
| ----------- | ------------------- | ----------------------- |
| `artworkId` | `string`            | The artwork to purchase |
| `payload`   | `PurchasePayload`   | Purchase configuration  |
| `callbacks` | `PurchaseCallbacks` | Event handlers          |

```typescript
// PurchasePayload
{
  amount?: { value: string; currency: string }
  userInput?: Array<{ key: string; value: string; signedToken?: string }>
  isReservation?: boolean
}

// PurchaseCallbacks
{
  onSuccess(data: { editionId: string; editionNumber: number; artworkId: string }): void
  onTerminalFailure(data: { title: string; message: string }): void
  onClose(): void
}
```

**Returns:** `Promise<{ destroy: () => void }>` — call `destroy()` to programmatically close the dialog.

`onTerminalFailure` is called only for irrecoverable errors (sold out, payment timeout). Retryable errors (e.g. outbid in auction) are handled within the dialog UI.

```javascript
elements.openPurchaseDialog(
  artworkId,
  {
    amount: { currency: "USD", value: "100" },
    userInput: [],
  },
  {
    onSuccess({ editionId, editionNumber, artworkId }) {
      console.log("Purchase succeeded", {
        editionId,
        editionNumber,
        artworkId,
      });
    },
    onTerminalFailure({ title, message }) {
      console.error(`Purchase failed: ${title} — ${message}`);
    },
    onClose() {
      console.log("User closed the dialog");
    },
  },
);
```

---

### `checkReserves(artworkId, reserveId?)`

Check whether the current user has reserve access for an artwork.

**Parameters:**

| Parameter   | Type                | Description                            |
| ----------- | ------------------- | -------------------------------------- |
| `artworkId` | `string`            | The artwork to check                   |
| `reserveId` | `string` (optional) | A specific reserve ID to check against |

**Returns:** `Promise<ReservesResult>`

```typescript
// ReservesResult
{
  hasAccess: boolean;
  reserveAccess: {
    hasAccess: boolean;
    reserveRequired: boolean;
    reserves: number | null;
  }
}
```

**Throws:** if the artwork has no active listing or the query fails.

```javascript
const result = await elements.checkReserves(artworkId);

if (result.reserveAccess.hasAccess) {
  console.log(`User has ${result.reserveAccess.reserves} reserves`);
} else if (result.reserveAccess.reserveRequired) {
  console.log("Reserve required but user has none");
}
```

---

### `createBookmark(artworkId)`

Generate a bookmark token for an artwork. The returned `signedToken` can be passed as `$user_hash` in `userInput` when opening a purchase dialog.

**Parameters:**

| Parameter   | Type     | Description             |
| ----------- | -------- | ----------------------- |
| `artworkId` | `string` | The artwork to bookmark |

**Returns:** `Promise<BookmarkResult>`

```typescript
// BookmarkResult
{
  hash: string;
  signedToken: string;
}
```

```javascript
const bookmark = await elements.createBookmark(artworkId);

elements.openPurchaseDialog(
  artworkId,
  {
    userInput: [{ key: "$user_hash", value: bookmark.signedToken }],
  },
  { onSuccess() {}, onTerminalFailure() {}, onClose() {} },
);
```

## Examples

See [`/examples/elements`](./examples/elements) for working examples you can run locally.
