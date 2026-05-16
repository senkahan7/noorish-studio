/**
 * Hero.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Noorish Studio — Cinematic Hero Section
 *
 * Composition:
 *   <Hero>
 *     ├── <nav>          — fixed navigation (transparent → blur on scroll)
 *     ├── <HeroScene>    — R3F canvas (video plane, bloom, parallax)
 *     ├── .hero__grain   — animated film grain overlay (CSS)
 *     ├── .hero__vignette— radial + linear gradient depth
 *     └── .hero__content — HTML text layer (eyebrow, title, subtitle, CTA)
 *
 * GSAP timeline fires once on mount:
 *   0.3s  → eyebrow slides + fades in
 *   0.6s  → title chars reveal with rotateX stagger
 *   1.8s  → subtitle clips in from left
 *   2.2s  → CTA fades + rises
 *   2.5s  → scroll indicator fades
 *
 * ScrollTrigger:
 *   Pinned for 120vh. As user scrolls through that pin, scrollProgress ref
 *   (0 → 1) is updated — HeroScene reads it each frame for the camera push.
 *
 * Usage:
 *   import Hero from '@/components/Hero/Hero'
 *   <Hero videoSrc="/videos/showreel.mp4" onViewWork={() => scrollToWorks()} />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  useRef,
  useEffect,
  useCallback,
  MutableRefObject,
} from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroScene from './HeroScene'
import './hero.css'

// Register GSAP plugins — safe to call multiple times
gsap.registerPlugin(ScrollTrigger)

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroProps {
  /** Path to showreel video. Served from /public — e.g. "/videos/showreel.mp4" */
  videoSrc?: string
  /** Fires when the "View Work" CTA is clicked */
  onViewWork?: () => void
}

// ─── Char split helper ────────────────────────────────────────────────────────

/**
 * Splits a string into individual <span> characters with data attributes.
 * Pure React — no split-type dependency needed for a single heading.
 * Each char gets class="char" so GSAP can target them.
 */
function SplitChars({ text }: { text: string }) {
  return (
    <>
      {text.split('').map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="char"
          data-char={char}
          style={{ display: 'inline-block' }}
          aria-hidden="true"   /* screen readers read the parent h1 text */
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero({
  videoSrc = '/videos/showreel.mp4',
  onViewWork,
}: HeroProps) {

  // ── Refs to DOM elements for GSAP targeting ────────────────────────────────
  const heroRef      = useRef<HTMLElement>(null)
  const navRef       = useRef<HTMLElement>(null)
  const eyebrowRef   = useRef<HTMLDivElement>(null)
  const titleRef     = useRef<HTMLHeadingElement>(null)
  const subtitleRef  = useRef<HTMLParagraphElement>(null)
  const ctaRef       = useRef<HTMLButtonElement>(null)
  const scrollIndRef = useRef<HTMLDivElement>(null)

  /**
   * Passed into HeroScene — GSAP ScrollTrigger writes to this ref,
   * R3F reads it every frame. No React state = no re-renders on scroll.
   */
  const scrollProgress: MutableRefObject<number> = useRef(0)

  // ── Reduced-motion preference ──────────────────────────────────────────────
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  // ── Entry animation timeline ───────────────────────────────────────────────
  useEffect(() => {
    if (!heroRef.current) return

    // Skip heavy animations for users with motion sensitivity
    if (prefersReducedMotion.current) {
      // Still fade everything in — just instantly
      const allEls = [
        eyebrowRef.current,
        titleRef.current?.querySelectorAll('.char'),
        subtitleRef.current,
        ctaRef.current,
        scrollIndRef.current,
      ]
      gsap.set(allEls, { opacity: 1, y: 0, clipPath: 'none', rotateX: 0 })
      return
    }

    const ctx = gsap.context(() => {
      const chars = titleRef.current?.querySelectorAll('.char') ?? []

      const tl = gsap.timeline({ delay: 0.25 })

      // 1. Eyebrow
      tl.to(eyebrowRef.current, {
        opacity   : 1,
        y         : 0,
        duration  : 0.7,
        ease      : 'power3.out',
      })

      // 2. Title chars — rotateX stagger gives a "falling into place" feel
      //    Each char starts flipped 80° away from camera and rotates forward
      tl.fromTo(
        chars,
        {
          opacity  : 0,
          yPercent : 110,
          rotateX  : -80,
        },
        {
          opacity  : 1,
          yPercent : 0,
          rotateX  : 0,
          duration : 1.1,
          stagger  : 0.038,
          ease     : 'power4.out',
          transformOrigin: 'top center',
        },
        '-=0.4'   // overlap with eyebrow finish
      )

      // 3. Subtitle — clip-path reveal from left + opacity
      tl.to(subtitleRef.current, {
        opacity  : 1,
        clipPath : 'inset(0 0% 0 0)',
        duration : 1.0,
        ease     : 'expo.out',
      }, '-=0.5')

      // 4. CTA button
      tl.to(ctaRef.current, {
        opacity  : 1,
        y        : 0,
        duration : 0.8,
        ease     : 'power3.out',
      }, '-=0.55')

      // 5. Scroll indicator — delayed so it's the last thing the eye catches
      tl.to(scrollIndRef.current, {
        opacity  : 1,
        duration : 0.9,
        ease     : 'power2.out',
      }, '-=0.3')

    }, heroRef)

    return () => ctx.revert()
  }, [])

  // ── Scroll camera push ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!heroRef.current) return

    // Pin the hero for 120vh of scroll distance.
    // During this pin, scrollProgress.current advances 0 → 1.
    // The R3F CameraRig reads this value each frame.
    const st = ScrollTrigger.create({
      trigger    : heroRef.current,
      start      : 'top top',
      end        : '+=120%',    // 120vh of scroll = full camera push
      pin        : true,
      pinSpacing : true,
      scrub      : 1.2,         // lag behind scroll for cinematic easing
      onUpdate   : (self) => {
        scrollProgress.current = self.progress
      },
    })

    return () => st.kill()
  }, [])

  // ── CTA handler ────────────────────────────────────────────────────────────
  const handleViewWork = useCallback(() => {
    if (onViewWork) {
      onViewWork()
    } else {
      // Default: smooth-scroll to the next section
      const works = document.getElementById('works')
      works?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [onViewWork])

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav ref={navRef} className="hero__nav" role="navigation" aria-label="Main navigation">
        <a href="/" className="hero__nav-logo" aria-label="Noorish Studio — Home">
          <span className="hero__nav-logo-mark" aria-hidden="true">N</span>
          Noorish Studio
        </a>

        <ul className="hero__nav-links" role="list">
          <li><a href="#works">Work</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#gallery">Gallery</a></li>
          <li>
            <a href="#contact" className="hero__nav-contact">
              Contact ↗
            </a>
          </li>
        </ul>
      </nav>

      {/* ── Hero section ───────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="hero"
        aria-label="Noorish Studio — Cinematic video editing and motion design"
      >
        {/* R3F canvas — absolutely positioned behind content */}
        <div className="hero__canvas" aria-hidden="true">
          <HeroScene videoSrc={videoSrc} scrollProgress={scrollProgress} />
        </div>

        {/* Film grain (CSS pseudo-element via class) */}
        <div className="hero__grain" aria-hidden="true" />

        {/* Vignette depth overlay */}
        <div className="hero__vignette" aria-hidden="true" />

        {/* ── Text content ─────────────────────────────────────────────── */}
        <div className="hero__content">

          {/* Eyebrow line */}
          <div ref={eyebrowRef} className="hero__eyebrow" aria-hidden="true">
            <span className="hero__eyebrow-line" />
            <span className="hero__eyebrow-text">Est. 2024</span>
          </div>

          {/* Main title — visually hidden duplicate for screen readers */}
          <h1
            ref={titleRef}
            className="hero__title"
          >
            {/* Accessible text sits in the h1 naturally */}
            <span className="sr-only">Noorish Studio</span>
            {/* Animated chars (aria-hidden so screen readers skip duplicates) */}
            <span aria-hidden="true">
              <SplitChars text="Noorish Studio" />
            </span>
          </h1>

          {/* Subtitle */}
          <p ref={subtitleRef} className="hero__subtitle">
            Video Editing
            <span className="sep" aria-hidden="true"> • </span>
            Motion Design
            <span className="sep" aria-hidden="true"> • </span>
            Creative Direction
          </p>

          {/* CTA */}
          <button
            ref={ctaRef}
            className="hero__cta"
            onClick={handleViewWork}
            aria-label="View Noorish Studio's work"
          >
            <span className="hero__cta-text">View Work</span>
            <span className="hero__cta-line" aria-hidden="true" />
            <svg
              className="hero__cta-arrow"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              width="22"
              height="22"
            >
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

        </div>

        {/* ── Scroll indicator ────────────────────────────────────────── */}
        <div ref={scrollIndRef} className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-text">Scroll</span>
          <div className="hero__scroll-line" />
        </div>

      </section>
    </>
  )
}
