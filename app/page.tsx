import Image from 'next/image'
import { site } from '@/lib/config'
import { FeaturedProject } from '@/components/featured-project'
import { SocialLinks } from '@/components/social-links'
import { DeepLink } from '@/components/deep-link'

export default function Home() {
  return (
    <div style={{ paddingTop: 'clamp(3.5rem, 11vh, 7rem)', paddingBottom: '4rem' }}>
      <div style={{}}>

        {/* Intro */}
        <section style={{ marginBottom: '4.5rem' }}>
          {/* flex-col on mobile, flex-row on ≥640 px */}
          <div className="flex items-center gap-10 flex-col sm:flex-row">

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 500,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  marginBottom: '1rem',
                  color: 'var(--color-ink)',
                }}
              >
                {site.name}
              </h1>
              <p
                style={{
                  fontSize: 'var(--text-md)',
                  lineHeight: 1.55,
                  color: 'var(--color-ink)',
                  maxWidth: '30em',
                }}
              >
                {site.bio}
              </p>
              {site.available && (
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    letterSpacing: '0.08em',
                    color: 'var(--color-muted)',
                    marginTop: '1.25rem',
                  }}
                >
                  AVAILABLE FOR WORK
                </p>
              )}
            </div>

            {/* Floating portrait — drop portrait.jpg in /public/ */}
            <div style={{ flexShrink: 0, paddingTop: '0.25rem' }}>
              {/*
                portrait-drift wraps image + tail so they float as one unit.
                paddingLeft reserves 42 px for the non-overlapping tail portion;
                the tail itself is position:absolute z-index:0 so the portrait
                (position:relative z-index:1) sits on top and hides the join.
              */}
              <div
                className="portrait-drift"
                style={{ position: 'relative', display: 'inline-block', paddingLeft: '42px' }}
              >
                {/* Fish tail — left side, behind the portrait */}
                <svg
                  width="52"
                  height="80"
                  viewBox="0 0 52 80"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '30px',   /* (140 - 80) / 2 — centres tail on portrait */
                    zIndex: 0,
                    fill: 'rgb(70, 130, 200)',   /* same blue as the swimming fish */
                    opacity: 0.78,
                  }}
                >
                  {/*
                    Apex at right-centre (52,40) connecting to portrait's left edge.
                    Two prongs curve left: top tip (0,8), bottom tip (0,72).
                    Notch at (14,40) creates the classic forked-tail silhouette.
                  */}
                  <path d="M52,40 C40,28 18,8 0,8 C12,22 14,36 14,40 C14,44 12,58 0,72 C18,72 40,52 52,40Z" />
                </svg>

                <Image
                  src="/portrait.jpg"
                  alt={site.name}
                  width={140}
                  height={140}
                  loading="eager"
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    display: 'block',
                    // Flat like the illustrations: a navy outline instead of a glow
                    boxShadow: '0 0 0 2px var(--color-ink)',
                  }}
                />
              </div>

              {/* Centred under the portrait (the 42px tail gutter sits to its left) */}
              <div style={{ paddingLeft: '42px', marginTop: '1.1rem' }}>
                <SocialLinks />
              </div>
            </div>

          </div>
        </section>


        {/* Latest projects */}
        <section style={{ marginBottom: '4rem' }}>
          <FeaturedProject />
        </section>

        {/* Only visible once you've scrolled into deep water */}
        <section style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
          <DeepLink href="/skills">Go deeper in my skills</DeepLink>
        </section>


      </div>
    </div>
  )
}
