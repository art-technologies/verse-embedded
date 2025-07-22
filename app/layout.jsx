import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script src="/verse-embedded.js" strategy="beforeInteractive"></Script>
      </body>
    </html>
  )
}