import { connect, type Methods, WindowMessenger } from "penpal";

interface VerseElementsOptions {
  baseUrl: string;
}

interface AuthMethods {
  [index: string]: Function;
  getAuthStatus(): boolean;
}

interface SignOutMethods {
  [index: string]: Function;
  signOut(): Promise<true>;
}

export interface BookmarkResult {
  hash: string;
  signedToken: string;
}

interface BookmarksMethods {
  [index: string]: Function;
  createBookmark(): Promise<BookmarkResult>;
}

export interface ReservesResult {
  hasAccess: boolean;
  reserveAccess: {
    hasAccess: boolean;
    reserveRequired: boolean;
    reserves: number | null;
  };
}

interface ReservesMethods {
  [index: string]: Function;
  checkReserves(reserveId?: string): Promise<ReservesResult>;
}

export interface PurchasePayload {
  amount?: { value: string; currency: string };
  userInput?: Array<{ key: string; value: string; signedToken?: string }>;
  isReservation?: boolean;
}

export interface PurchaseTerminalFailure {
  title: string;
  message: string;
}

export interface PurchaseSuccessData {
  editionId: string;
  editionNumber: number;
  artworkId: string;
}

export interface PurchaseCallbacks {
  onSuccess(data: PurchaseSuccessData): void;
  onTerminalFailure(data: PurchaseTerminalFailure): void;
  onClose(): void;
}

interface PurchaseChildMethods {
  [index: string]: Function;
  openPurchaseDialog(payload: PurchasePayload): void;
}

interface PurchaseParentMethods extends Methods {
  onReady(): void;
  onSuccess(data: PurchaseSuccessData): void;
  onTerminalFailure(data: PurchaseTerminalFailure): void;
  onClose(): void;
}

export interface VerseAuthResult {
  success: boolean;
  verseUserId?: string;
  verseUsername?: string;
}

export interface AuthoriseOptions {
  mode?: "signin" | "signup";
}

interface ParentMethods extends Methods {
  onAuthSuccess(data: VerseAuthResult): void;
}

class VerseElements {
  private baseUrl: string;

  constructor(options: VerseElementsOptions) {
    if (!options.baseUrl) {
      throw new Error("baseUrl is required");
    }
    this.baseUrl = options.baseUrl;
  }

  public async checkAuth(): Promise<boolean> {
    const iframe = document.createElement("iframe");
    iframe.setAttribute(
      "sandbox",
      [
        "allow-same-origin",
        "allow-scripts",
        "allow-storage-access-by-user-activation",
      ].join(" "),
    );
    iframe.src = `${this.baseUrl}/elements/auth`;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    try {
      const messenger = new WindowMessenger({
        remoteWindow: iframe.contentWindow!,
        allowedOrigins: [this.baseUrl],
      });

      const connection = connect<AuthMethods>({ messenger });
      const child = await connection.promise;
      const isSignedIn = await child.getAuthStatus();

      connection.destroy();
      iframe.remove();

      return isSignedIn;
    } catch (error) {
      iframe.remove();
      console.error("Error checking Verse auth status:", error);
      return false;
    }
  }
  public async signOut(): Promise<void> {
    const iframe = document.createElement("iframe");
    iframe.setAttribute(
      "sandbox",
      [
        "allow-same-origin",
        "allow-scripts",
        "allow-storage-access-by-user-activation",
      ].join(" "),
    );
    iframe.src = `${this.baseUrl}/elements/signout`;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    try {
      const messenger = new WindowMessenger({
        remoteWindow: iframe.contentWindow!,
        allowedOrigins: [this.baseUrl],
      });

      const connection = connect<SignOutMethods>({ messenger });
      const child = await connection.promise;
      await child.signOut();

      connection.destroy();
      iframe.remove();
    } catch (error) {
      iframe.remove();
      throw error;
    }
  }

  public authorise(options?: AuthoriseOptions): Promise<VerseAuthResult | null> {
    const mode = options?.mode ?? "signin";
    const page = mode === "signup" ? "/signup" : "/signin";

    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        zIndex: "999999",
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });

      const closeButton = document.createElement("button");
      Object.assign(closeButton.style, {
        position: "absolute",
        top: "12px",
        right: "12px",
        width: "32px",
        height: "32px",
        border: "none",
        background: "transparent",
        color: "white",
        fontSize: "24px",
        cursor: "pointer",
        zIndex: "1",
      });
      closeButton.innerHTML = "&#x2715;";
      closeButton.setAttribute("aria-label", "Close");

      const iframe = document.createElement("iframe");
      const parentOrigin = encodeURIComponent(window.location.origin);
      iframe.src = `${this.baseUrl}${page}?app_auth_host=${parentOrigin}`;
      Object.assign(iframe.style, {
        position: "relative",
        inset: "auto",
        width: "90vw",
        height: "90vh",
        maxWidth: "600px",
        maxHeight: "800px",
        border: "none",
        borderRadius: "8px",
      });

      overlay.appendChild(closeButton);
      overlay.appendChild(iframe);
      document.body.appendChild(overlay);

      let connection: ReturnType<typeof connect> | null = null;

      function cleanup() {
        connection?.destroy();
        overlay.remove();
      }

      closeButton.addEventListener("click", () => {
        cleanup();
        resolve(null);
      });

      const messenger = new WindowMessenger({
        remoteWindow: iframe.contentWindow!,
        allowedOrigins: [this.baseUrl],
      });

      connection = connect<{}>({
        messenger,
        methods: {
          onAuthSuccess(data: VerseAuthResult) {
            cleanup();
            resolve(data);
          },
        } satisfies ParentMethods,
      });
    });
  }

  public async createBookmark(artworkId: string): Promise<BookmarkResult> {
    const iframe = document.createElement("iframe");
    iframe.src = `${this.baseUrl}/elements/bookmarks/${artworkId}`;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    try {
      const messenger = new WindowMessenger({
        remoteWindow: iframe.contentWindow!,
        allowedOrigins: [this.baseUrl],
      });

      const connection = connect<BookmarksMethods>({ messenger });
      const child = await connection.promise;
      const result = await child.createBookmark();

      connection.destroy();
      iframe.remove();

      return result;
    } catch (error) {
      iframe.remove();
      throw error;
    }
  }
  public async checkReserves(
    artworkId: string,
    reserveId?: string,
  ): Promise<ReservesResult> {
    const iframe = document.createElement("iframe");
    iframe.setAttribute(
      "sandbox",
      [
        "allow-same-origin",
        "allow-scripts",
        "allow-storage-access-by-user-activation",
      ].join(" "),
    );
    iframe.src = `${this.baseUrl}/elements/reserves/${artworkId}`;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    try {
      const messenger = new WindowMessenger({
        remoteWindow: iframe.contentWindow!,
        allowedOrigins: [this.baseUrl],
      });

      const connection = connect<ReservesMethods>({ messenger });
      const child = await connection.promise;
      const result = await child.checkReserves(reserveId);

      connection.destroy();
      iframe.remove();

      return result;
    } catch (error) {
      iframe.remove();
      throw error;
    }
  }

  public async openPurchaseDialog(
    artworkId: string,
    payload: PurchasePayload,
    callbacks: PurchaseCallbacks,
  ): Promise<{ destroy: () => void }> {
    // Show spinner overlay immediately
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "999999",
      background: "rgba(0, 0, 0, 0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });
    const spinnerStyle = document.createElement("style");
    spinnerStyle.textContent = `@keyframes verse-spin { to { transform: rotate(360deg) } }`;
    document.head.appendChild(spinnerStyle);

    const spinner = document.createElement("div");
    Object.assign(spinner.style, {
      width: "40px",
      height: "40px",
      border: "4px solid rgba(255,255,255,0.3)",
      borderTop: "4px solid #fff",
      borderRadius: "50%",
      animation: "verse-spin 1s linear infinite",
    });
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);

    // Create hidden iframe
    const iframe = document.createElement("iframe");
    iframe.setAttribute(
      "sandbox",
      [
        "allow-forms",
        "allow-modals",
        "allow-popups",
        "allow-popups-to-escape-sandbox",
        "allow-same-origin",
        "allow-scripts",
        "allow-storage-access-by-user-activation",
      ].join(" "),
    );
    iframe.src = `${this.baseUrl}/elements/purchase/${artworkId}`;
    Object.assign(iframe.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      border: "none",
      zIndex: "999999",
      display: "none",
    });
    document.body.appendChild(iframe);

    console.debug("[verse] iframe created, src:", iframe.src);

    const messenger = new WindowMessenger({
      remoteWindow: iframe.contentWindow!,
      allowedOrigins: [this.baseUrl],
    });

    console.debug("[verse] penpal connect() called, waiting for handshake...");

    const connection = connect<PurchaseChildMethods>({
      messenger,
      methods: {
        async onReady() {
          console.debug(
            "[verse] onReady fired, awaiting connection.promise...",
          );
          const child = await connection.promise;
          console.debug(
            "[verse] connection.promise resolved, showing iframe and calling openPurchaseDialog",
          );
          overlay.remove();
          iframe.style.display = "";
          child.openPurchaseDialog(payload);
          console.debug("[verse] openPurchaseDialog sent to child");
        },
        onSuccess(data: PurchaseSuccessData) {
          console.debug("[verse] onSuccess fired:", data);
          callbacks.onSuccess(data);
          cleanup();
        },
        onTerminalFailure(data: PurchaseTerminalFailure) {
          console.debug("[verse] onTerminalFailure fired:", data);
          callbacks.onTerminalFailure(data);
          cleanup();
        },
        onClose() {
          console.debug("[verse] onClose fired");
          callbacks.onClose();
          cleanup();
        },
      } satisfies PurchaseParentMethods,
    });

    connection.promise
      .then(() => {
        console.debug("[verse] penpal handshake complete");
      })
      .catch((err) => {
        console.error("[verse] penpal handshake failed:", err);
      });

    function cleanup() {
      console.debug("[verse] cleanup called");
      connection.destroy();
      spinnerStyle.remove();
      overlay.remove();
      iframe.remove();
    }

    return { destroy: cleanup };
  }
}

(window as any).VerseElements = VerseElements;
