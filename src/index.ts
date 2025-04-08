import { createLoader } from './loader';

interface VerseEmbedOptions {
  baseUrl?: string;
  minHeight?: number;
}

interface IframeMessage {
  type: 'resize';
  height: number;
}

class VerseEmbed {
  private baseUrl: string;
  private minHeight: number;
  private lastHeight: number = 0;

  constructor(options: VerseEmbedOptions = {}) {
    this.baseUrl = options.baseUrl || 'https://verse-webapp-git-feat-verse-embedded-poc-at-verse.vercel.app/artworks';
    this.minHeight = options.minHeight || 400;
    this.handleMessage = this.handleMessage.bind(this);
  }

  private handleMessage(event: MessageEvent): void {
    // Verify the message is from our expected origin
    if (event.origin !== new URL(this.baseUrl).origin) {
      return;
    }

    try {
      const message: IframeMessage = event.data;
      if (message.type === 'resize' && typeof message.height === 'number') {
        console.log('Received height update:', message.height);
        
        // Find the iframe that sent the message
        const iframes = document.querySelectorAll('iframe');
        const sourceIframe = Array.from(iframes).find(iframe => 
          iframe.contentWindow === event.source
        );
        
        if (sourceIframe) {
          const container = sourceIframe.parentElement;
          if (container) {
            // Only ensure minimum height
            const height = Math.max(message.height, this.minHeight);

            // Only update if height has changed
            if (this.lastHeight !== height) {
              console.log('Updating iframe height to:', height);
              this.lastHeight = height;
              container.style.height = `${height}px`;
              sourceIframe.style.height = `${height}px`;
            }
          }
        }
      }
    } catch (e) {
      console.error('Error handling iframe message:', e);
    }
  }

  private createIframe(artworkId: string): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.src = `${this.baseUrl}/${artworkId}`;
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

  private initializeContainer(container: HTMLElement): void {
    const artworkId = container.getAttribute('verse-artwork-id');
    if (!artworkId) {
      console.error('Container missing verse-artwork-id attribute');
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

    // Create and add iframe
    const iframe = this.createIframe(artworkId);
    iframe.onload = () => {
      container.removeChild(loader);
    };
    container.appendChild(iframe);
  }

  public initialize(): void {
    // Add message event listener
    window.addEventListener('message', this.handleMessage);
    
    const containers = document.querySelectorAll<HTMLElement>('[verse-artwork-id]');
    containers.forEach(container => this.initializeContainer(container));
  }
}

// Initialize automatically when script is loaded
const verseEmbed = new VerseEmbed();
verseEmbed.initialize(); 