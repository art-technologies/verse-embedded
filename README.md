# Verse Embedded

A lightweight library for embedding Verse artwork iframes on any website.

## Installation

1. Build the library:
```bash
npm install
npm run build
```

2. Include the built script in your HTML:
```html
<script src="path/to/verse-embedded.js"></script>
```

## Usage

1. Add a container div with the `verse-artwork-id` attribute:
```html
<div verse-artwork-id="123"></div>
```

2. The library will automatically:
   - Find all elements with the `verse-artwork-id` attribute
   - Create an iframe for each artwork
   - Show a loading spinner while the iframe is loading
   - Replace the spinner with the artwork once loaded

## Customization

You can customize the base URL by creating a new instance of VerseEmbed:

```javascript
const verseEmbed = new VerseEmbed({
  baseUrl: 'https://custom-verse-url.com/artworks'
});
verseEmbed.initialize();
```

## Development

- `npm run build` - Build the library
- `npm run dev` - Watch for changes and rebuild
- `npm run type-check` - Run TypeScript type checking

## Requirements

- Modern browser with ES2020 support
- TypeScript 5.3.3 or higher (for development) 