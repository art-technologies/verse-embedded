import Script from 'next/script'

export default function Page() {
    return (
        <>
            <header style={{ padding: '20px' }}>
                <h1>Verse Artwork Embed Example</h1>
                <span>This is some generic website content, below you can see the actual artwork embed</span>
            </header>
    
            <div
                className="artwork-container"
                verse-artwork-id="329d1517-99fd-4350-9b6e-2e7687548080"
                verse-edition-number="18"
                verse-custom-styles-path="https://localhost:3001/verse-styles.css"
            ></div>

            <footer style={{ padding: '20px' }}>
                <p>Fun footer, tell a joke:</p>
                <p>Why did the chicken cross the road?</p>
                <p>To get to the other side!</p>
            </footer>

            <Script>
                {`
                    const verseEmbed = new VerseEmbed({
                        // temporary URL for testing the latest features
                        // baseUrl: "https://localhost:3000",
                        baseUrl: "https://verse-webapp-git-fix-ver-3392-you-shouldnt-be-d-6cb319-at-verse.vercel.app/",
                        // baseUrl: "https://verse.works",
                    });
                    verseEmbed.initialize();
                `}
            </Script>
        </>
    )
}