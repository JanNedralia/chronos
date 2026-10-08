import type { Metadata } from "next"
import Link from "next/link"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "Chronos — time, well spent",
  description: "A thoughtfully simple way to track your work. Chronos is free, always.",
}

function ClockMark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="16.5" stroke="currentColor" strokeWidth="2" />
      <path d="M20 10v10l7 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h11m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ProductPage() {
  return (
    <main className={styles.site}>
      <header className={styles.nav}>
        <Link className={styles.brand} href="/product" aria-label="Chronos home">
          <span className={styles.brandMark}><ClockMark /></span>
          <span>chronos</span>
        </Link>
        <nav className={styles.navLinks} aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className={styles.navActions}>
          <Link className={styles.signIn} href="/login">Sign in</Link>
          <Link className={styles.navCta} href="/signup">Get started <ArrowIcon /></Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span className={styles.sparkle}>✳</span> A little more clarity in your day</div>
          <h1>Make time<br />for <span>what matters.</span></h1>
          <p className={styles.heroText}>
            The thoughtful, no-fuss way to know where your workday went—and make the next one count.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} href="/signup">Start tracking for free <ArrowIcon /></Link>
            <a className={styles.textCta} href="#features">Take a closer look <span>↓</span></a>
          </div>
          <div className={styles.freeNote}><span aria-hidden="true">✦</span> Free to use. No trial, no price tag.</div>
        </div>

        <div className={styles.heroVisual} aria-label="Preview of the Chronos time tracking dashboard">
          <div className={`${styles.orbit} ${styles.orbitOne}`} />
          <div className={`${styles.orbit} ${styles.orbitTwo}`} />
          <div className={styles.visualGlow} />
          <div className={styles.dashboard}>
            <div className={styles.dashboardTop}>
              <div className={styles.windowDots}><i /><i /><i /></div>
              <span>YOUR WEEK AT A GLANCE</span>
              <span className={styles.moreDots}>···</span>
            </div>
            <div className={styles.dashboardBody}>
              <div className={styles.dashSidebar}>
                <div className={styles.dashLogo}><ClockMark /></div>
                <div className={`${styles.sideItem} ${styles.selected}`}><span>◷</span> Overview</div>
                <div className={styles.sideItem}><span>◫</span> Time entries</div>
                <div className={styles.sideItem}><span>⌑</span> Clients</div>
                <div className={styles.sideItem}><span>▤</span> Reports</div>
                <div className={styles.sideBottom}><span className={styles.avatar}>J</span><span>Jamie Parker</span></div>
              </div>
              <div className={styles.dashMain}>
                <div className={styles.dashHeading}>
                  <div><span className={styles.dashKicker}>MONDAY, JUNE 10</span><h2>Good morning, Jamie</h2></div>
                  <span className={styles.weekPill}>This week⌄</span>
                </div>
                <div className={styles.totalCard}>
                  <div><span className={styles.dashKicker}>TOTAL THIS WEEK</span><strong>24<span>h</span> 36<span>m</span></strong></div>
                  <div className={styles.progressRing}><span>62%</span></div>
                  <span className={styles.totalFoot}>of your 40h goal</span>
                </div>
                <div className={styles.chartCard}>
                  <div className={styles.chartTitle}><span>Hours by day</span><span>10 Jun — 16 Jun</span></div>
                  <div className={styles.chart}>
                    {[48, 72, 57, 91, 66, 34, 20].map((height, index) => (
                      <div className={styles.barGroup} key={index}>
                        <div className={`${styles.bar} ${index === 3 ? styles.barCurrent : ""}`} style={{ height: `${height}%` }} />
                        <span>{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.recent}>
                  <div className={styles.recentHeading}><span>Recent activity</span><span>View all →</span></div>
                  <div className={styles.activityRow}><i className={styles.purpleDot} /><span>Brand refresh</span><small>Northstar Studio</small><b>2h 30m</b></div>
                  <div className={styles.activityRow}><i className={styles.orangeDot} /><span>Product planning</span><small>Personal</small><b>1h 45m</b></div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.floatingNote}><span>✦</span><div><b>Looking good.</b><small>You’re right on track this week.</small></div></div>
        </div>
        <div className={styles.scrollCue}><span /> Scroll to explore</div>
      </section>

      <section className={styles.features} id="features">
        <div className={styles.sectionIntro}>
          <span className={styles.sectionLabel}>A clearer picture</span>
          <h2>Less wondering.<br /><span>More knowing.</span></h2>
          <p>All the insight you need to feel good about your time, without making time tracking a job of its own.</p>
        </div>
        <div className={styles.featureGrid} id="how-it-works">
          <article className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.iconLavender}`}><span>◷</span></div>
            <span className={styles.featureNumber}>01 / TRACK</span>
            <h3>Stay in the moment.</h3>
            <p>Log time to a client or project in just a few clicks. No clutter, no complicated setup—just the details you need.</p>
            <div className={styles.miniTimer}><span className={styles.timerDot} /> Brand refresh <b>01:24:08</b><span className={styles.pause}>Ⅱ</span></div>
          </article>
          <article className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.iconPeach}`}><span>◫</span></div>
            <span className={styles.featureNumber}>02 / ORGANIZE</span>
            <h3>Your work, in its place.</h3>
            <p>Keep clients and projects together, so every hour has a home and the bigger picture stays easy to find.</p>
            <div className={styles.miniProjects}><span><i className={styles.purpleDot} /> Northstar Studio</span><b>12h 40m</b><span><i className={styles.orangeDot} /> Paper & Pine</span><b>8h 15m</b></div>
          </article>
          <article className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.iconMint}`}><span>↗</span></div>
            <span className={styles.featureNumber}>03 / UNDERSTAND</span>
            <h3>See the whole story.</h3>
            <p>Turn your time entries into simple reports. Spot your patterns and make your next plan with confidence.</p>
            <div className={styles.miniReport}><span>This week</span><b>24h 36m</b><div><i /><i /><i /><i /><i /><i /><i /></div></div>
          </article>
        </div>
      </section>

      <section className={styles.closing}>
        <div className={styles.closingMark}><ClockMark /></div>
        <p className={styles.sectionLabel}>A better relationship with your time starts here</p>
        <h2>Make today<br /> <span>add up.</span></h2>
        <p className={styles.closingText}>A little more clarity can change the way your whole week feels.</p>
        <Link className={styles.primaryCta} href="/signup">Get started—it&apos;s free <ArrowIcon /></Link>
        <span className={styles.closingFine}>Free to use. Ready when you are.</span>
      </section>

      <footer className={styles.footer}>
        <Link className={styles.brand} href="/product"><span className={styles.brandMark}><ClockMark /></span><span>chronos</span></Link>
        <span>Make time for what matters.</span>
        <span>© {new Date().getFullYear()} Chronos</span>
      </footer>
    </main>
  )
}
