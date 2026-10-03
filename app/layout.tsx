import type { Metadata } from 'next'
import { Newsreader, JetBrains_Mono } from 'next/font/google'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Underwater } from '@/components/underwater'
import { HoverBubbles } from '@/components/bubbles'
import { site } from '@/lib/config'
import './globals.css'

// Variable font with the optical-size axis: headings get Newsreader's display cuts automatically
const newsreader = Newsreader({
  subsets: ['latin'],
  axes: ['opsz'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  // Absolute base for the link-preview image (app/opengraph-image.png)
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: site.bio,
  openGraph: {
    title: site.name,
    description: site.bio,
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {/* Fixed background layers: fish + rays, painted below content */}
        <Underwater />
        <HoverBubbles />
        <div id="water-rays" />

        {/* Content — position:relative + z-index:1 creates a stacking context
            above the background layers; background:transparent lets them show
            through in margins and between elements */}
        <div
          className="min-h-dvh flex flex-col"
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '0 clamp(1.25rem, 4vw, 3.5rem)',
            position: 'relative',
            zIndex: 1,
            background: 'transparent',
          }}
        >
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
