# Verse Embedded

Verse Embedded is a JavaScript library that helps you to integrate Verse Primary Market features into your existing websites.

## Basic integration

Add a script to your `<head>`:
```html
<script src="dist/verse-embedded.js"></script>
```

And add initialistion of library at the point when DOM is ready (in `example.html`, I did it in the bottom of body)
```js
const verseEmbed = new VerseEmbed({
    baseUrl: "https://verse.works",
});
verseEmbed.initialize();
```

Then, in add following div anywhere you want Verse artwork/edition/serie iframe to appear:

### Loading artworks
```html
<div
    verse-artwork-id="57883342-1032-4820-b318-b42fa761e1aa"
    verse-custom-styles-path="http://localhost:3000/verse-styles.css"
></div>
```

### Loading editions
```html
<div
    verse-artwork-id="57883342-1032-4820-b318-b42fa761e1aa"
    verse-edition-number="1"
    verse-custom-styles-path="http://localhost:3000/verse-styles.css"
></div>
```

### Loading series (collections)
```html
<div
    verse-series-slug="internal-lullabies-for-the-disenfranchised"
    verse-custom-styles-path="http://localhost:3000/verse-styles.css"
></div>
```
where
- `verse-artwork-id` is a inner Verse artwork id, should be provided by Verse team
- `verse-edition-number` is a inner Verse edition number, should be provided by Verse team
- `verse-series-slug` is a inner Verse serie's slug, should be provided by Verse team
- `verse-custom-styles-path` is a relative or absolute path to CSS file you wish to use in order to override Verse default styles

## Origin allowlist
- You can embed Verse iframe only on `localhost:3000` origin
- In order to make it avaiable on your website, please chat with Verse tech team and give them your origin needed for whitelisting

## Comments on custom CSS
Because Verse use build system, classnames may have have postfixes that are not known in advance. Thus, in current version you should
use following CSS rules:
```css
[class*="CollSinglePMSection_assetCoverRoot"] {
    --forced-max-width: 200px !important;
}
```

## Local testing

To test locally use command below

```bash
npm run serve
```