import { createLoader } from './loader';

interface VerseEmbedOptions {
  baseUrl?: string;
  minHeight?: number;
}

type IFrameMessage = {
  type: 'resize';
  bounds: {
    height: number;
  };
} | {
  type: 'fullScreenMode';
  fullScreen: boolean;
} | {
  type: 'applyStyles';
  styles: string;
}

const iframeSandox = [
  "allow-downloads",
  "allow-forms",
  "allow-modals",
  "allow-orientation-lock",
  "allow-pointer-lock",
  "allow-popups",
  "allow-popups-to-escape-sandbox",
  "allow-presentation",
  "allow-same-origin",
  "allow-scripts",
  "allow-storage-access-by-user-activation",
  // "allow-top-navigation",
  // "allow-top-navigation-by-user-activation",
  // "allow-top-navigation-to-custom-protocols",
]

class VerseEmbed {
  private baseUrl: string;
  private minHeight: number;
  private lastHeight: number = 0;
  private isFullScreenMode: boolean = false;
  private lastNormalHeight: number = 0;  // Store height before fullscreen
  public iframe: HTMLIFrameElement | undefined;

  constructor(options: VerseEmbedOptions = {}) {
    if (!options.baseUrl) {
      throw new Error('baseUrl is required');
    }
    this.baseUrl = options.baseUrl;
    this.minHeight = options.minHeight || 560;
    this.handleMessage = this.handleMessage.bind(this);
  }

  private handleFullScreenMessage(isFullScreen: boolean, event: MessageEvent): void {
    this.isFullScreenMode = isFullScreen;

    // Find the iframe that sent the message
    const iframes = document.querySelectorAll('iframe');
    const sourceIframe = Array.from(iframes).find(iframe => 
      iframe.contentWindow === event.source
    );

    if (sourceIframe) {
      const container = sourceIframe.parentElement;
      if (container) {
        if (isFullScreen) {
          // Store the current height before going fullscreen
          this.lastNormalHeight = this.lastHeight;
          
          // Set fullscreen styles
          container.style.position = 'fixed';
          container.style.top = '0';
          container.style.left = '0';
          container.style.width = '100vw';
          container.style.height = '100vh';
          container.style.zIndex = '9999';
          container.style.backgroundColor = 'white';
        } else {
          // Reset to initial state
          container.style.position = 'relative';
          container.style.top = '';
          container.style.left = '';
          container.style.width = '100%';
          container.style.height = `${this.lastNormalHeight}px`;  // Restore the stored height
          container.style.zIndex = '';
          container.style.backgroundColor = '';
        }
      }
    }
  }

  private handleMessage(event: MessageEvent): void {
    // Verify the message is from our expected origin
    if (event.origin !== new URL(this.baseUrl).origin) {
      return;
    }

    try {
      const message: IFrameMessage = event.data;
      if (message.type === 'resize') {
        // Ignore resize events during fullscreen mode
        if (this.isFullScreenMode) {
          return;
        }
        
        // Find the iframe that sent the message
        const iframes = document.querySelectorAll('iframe');
        const sourceIframe = Array.from(iframes).find(iframe => 
          iframe.contentWindow === event.source
        );
        
        if (sourceIframe) {
          const container = sourceIframe.parentElement;
          if (container) {
            // Only ensure minimum height
            const height = Math.max(message.bounds.height, this.minHeight);

            // Only update if height has changed
            if (this.lastHeight !== height) {
              this.lastHeight = height;
              this.lastNormalHeight = height;  // Store the normal height
              container.style.height = `${height}px`;
              sourceIframe.style.height = `${height}px`;
            }
          }
        }
      } else if (message.type === 'fullScreenMode' && typeof message.fullScreen === 'boolean') {
        this.handleFullScreenMessage(message.fullScreen, event);
      }
    } catch (e) {
      console.error('Error handling iframe message:', e);
    }
  }

  private createIframe(artworkId: string, seriesSlug?: string, stylesPath?: string): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', iframeSandox.join(" "));
    
    const url = seriesSlug 
      ? `${this.baseUrl}/series/${seriesSlug}?iframe=true&stylesPath=${stylesPath}`
      : `${this.baseUrl}/artworks/${artworkId}?iframe=true&stylesPath=${stylesPath}`;
    
    iframe.src = url;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      overflow: hidden;
      scrolling: no;
    `;
    iframe.setAttribute('scrolling', 'no');
    return iframe;
  }

  private async loadCustomStyles(stylesPath: string): Promise<string> {
    try {
      const response = await fetch(stylesPath);
      if (!response.ok) {
        throw new Error(`Failed to load styles: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error loading custom styles:', error);
      return '';
    }
  }

  public async applyStyles(styles: string): Promise<void> {
    if (!this.iframe) {
      console.error('No iframe found to apply styles to');
      return;
    }

    this.iframe.contentWindow?.postMessage({
      type: 'applyStyles',
      styles
    }, new URL(this.baseUrl).origin);
  }

  private async initializeContainer(container: HTMLElement): Promise<void> {
    const artworkId = container.getAttribute('verse-artwork-id');
    const seriesSlug = container.getAttribute('verse-series-slug');
    
    if (!artworkId && !seriesSlug) {
      console.error('Container missing required attributes: either verse-artwork-id or verse-series-slug must be provided');
      return;
    }

    // Set container styles
    container.style.cssText = `
      position: relative;
      width: 100%;
      min-height: ${this.minHeight}px;
      overflow: hidden;
    `;

    // Add loader
    const loader = createLoader();
    container.appendChild(loader);

    // Get styles path
    const stylesPath = container.getAttribute('verse-custom-styles-path');

    // Create iframe
    this.iframe = this.createIframe(artworkId || '', seriesSlug || undefined, stylesPath || undefined);
    
    // Load custom styles if specified
    // const stylesPath = container.getAttribute('verse-custom-styles-path');
    // let customStyles = '';
    // if (stylesPath) {
    //   customStyles = await this.loadCustomStyles(stylesPath);
    // }

    // Add iframe to container
    container.appendChild(this.iframe);

    // Wait for iframe to load and apply styles
    await new Promise<void>((resolve) => {
      if (!this.iframe) {
        return
      }

      this.iframe.onload = async () => {
        // if (customStyles) {
        //   await this.applyStyles(customStyles);
        // }
        container.removeChild(loader);
        resolve();
      };
    });
  }

  public initialize(): void {
    // Add message event listener
    window.addEventListener('message', this.handleMessage);
    
    const containers = [
      ...Array.from(document.querySelectorAll<HTMLElement>('[verse-artwork-id]')),
      ...Array.from(document.querySelectorAll<HTMLElement>('[verse-series-slug]')),
    ]
    containers.forEach(container => this.initializeContainer(container));
  }

  public forceRefreshMeasure(): void {
    if (!this.iframe) {
      return
    }

    this.iframe.contentWindow?.postMessage({
      type: "forceRefreshMeasure",
    }, new URL(this.baseUrl).origin);
  }
}

// Initialize automatically when script is loaded
// const verseEmbed = new VerseEmbed();
// verseEmbed.initialize();

(window as any).VerseEmbed = VerseEmbed;