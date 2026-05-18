import { useRef, Suspense, MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useVideoTexture } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useMouseParallax, MouseParallaxData } from '../hooks/useMouseParallax'

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroSceneProps {
  /** Path or URL to the showreel video (MP4 recommended, keep ≤ 8MB for web) */
  videoSrc?: string
  /**
   * Ref updated by GSAP ScrollTrigger in Hero.tsx.
   * 0 = top of hero, 1 = bottom of hero.
   * Drives the camera push-in effect.
   */
  scrollProgress: MutableRefObject<number>
}

interface VideoPlaneProps {
  videoSrc: string
  parallax: MouseParallaxData
}

interface FrameGlowProps {
  width: number
  height: number
}

interface CameraRigProps {
  scrollProgress: MutableRefObject<number>
  parallax: MouseParallaxData
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** 16:9 plane dimensions in world units */
const PLANE_W = 7.2
const PLANE_H = PLANE_W * (9 / 16)

/** Camera Z positions: start (idle) → end (scrolled in) */
const CAM_Z_START = 5.8
const CAM_Z_END   = 3.6

/** Initial slight tilt angles (radians) — cinematic "off-level" feel */
const TILT_X =  0.045
const TILT_Y = -0.06

// ─── VideoPlane ───────────────────────────────────────────────────────────────

// Video plane: plays showreel and responds to parallax
function VideoPlane({ videoSrc, parallax }: VideoPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // drei's useVideoTexture creates and manages the <video> element for us.
  // It sets muted, loop, playsInline automatically.
  const texture = useVideoTexture(videoSrc, {
    muted:        true,
    loop:         true,
    start:        true,   // begin playing immediately
    playsInline:  true,
    crossOrigin:  'anonymous',
    unsuspend:    'canplay', // wait for enough data before showing
  })

  // Keep texture mapping correct for a standard video
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter  = THREE.LinearFilter
  texture.magFilter  = THREE.LinearFilter

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()

    // Lerp the parallax smooth values — factor is lower than camera rig so
    // the plane feels heavier / more cinematic than the camera
    parallax.lerp(0.035)

    // Slow sinusoidal float — different freq on each axis to avoid looping feel
    meshRef.current.position.y = Math.sin(t * 0.28) * 0.07
    meshRef.current.position.x = Math.cos(t * 0.19) * 0.025

    // Mouse parallax as subtle rotation on top of the initial tilt
    meshRef.current.rotation.y = TILT_Y + parallax.smooth.x * 0.055
    meshRef.current.rotation.x = TILT_X + parallax.smooth.y * 0.035
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[PLANE_W, PLANE_H]} />
      <meshStandardMaterial
        map={texture}
        toneMapped={false}
        transparent
        opacity={0.88}
      />
    </mesh>
  )
}

// ─── Edge Glow / Frame ────────────────────────────────────────────────────────

// Golden frame glow behind the video
function FrameGlow({ width, height }: FrameGlowProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    // Breathing pulse — very subtle intensity oscillation
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.12 + Math.sin(clock.getElapsedTime() * 0.6) * 0.04
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -0.02]}>
      <planeGeometry args={[width + 0.18, height + 0.18]} />
      <meshStandardMaterial
        color="#c9a96e"
        emissive="#c9a96e"
        emissiveIntensity={0.14}
        transparent
        opacity={0.18}
        toneMapped={false}
      />
    </mesh>
  )
}

// ─── CameraRig ────────────────────────────────────────────────────────────────

// Camera rig: scroll push-in + mouse parallax (no React state)
function CameraRig({ scrollProgress, parallax }: CameraRigProps) {
  const { camera } = useThree()

  useFrame(() => {
    // 1. Scroll push — lerp Z toward target driven by scrollProgress ref
    const targetZ = CAM_Z_START - (CAM_Z_START - CAM_Z_END) * scrollProgress.current
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.07)

    // 2. Mouse parallax — camera drifts opposite to plane rotation
    //    (parallax already lerped in VideoPlane above)
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      -parallax.smooth.x * 0.18,
      0.06
    )
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      -parallax.smooth.y * 0.12,
      0.06
    )

    // Subtle look-at drift — keeps the plane roughly centered even as camera
    // shifts, adds a very natural "breathing camera" quality
    camera.lookAt(
      parallax.smooth.x * 0.06,
      parallax.smooth.y * 0.04,
      0
    )
  })

  return null
}

// ─── Fallback (Suspense) ──────────────────────────────────────────────────────

// Fallback mesh shown while video loads
function VideoFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[PLANE_W, PLANE_H]} />
      <meshBasicMaterial color="#111111" />
    </mesh>
  )
}

// ─── Inner scene (needs to be inside Canvas) ─────────────────────────────────

interface SceneProps {
  videoSrc: string
  scrollProgress: MutableRefObject<number>
}

function Scene({ videoSrc, scrollProgress }: SceneProps) {
  // One parallax instance shared between VideoPlane + CameraRig so both
  // react to the exact same smoothed values
  const parallax = useMouseParallax(0.45)

  return (
    <>
      {/* Lighting — warm key + cool fill gives depth to the emissive frame */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 7]} intensity={1.0} color="#d4b483" />
      <pointLight position={[-4, 3, 4]} intensity={0.3} color="#8ba7c4" />

      {/* Video plane — wrapped in Suspense so fallback shows during load */}
      <Suspense fallback={<VideoFallback />}>
        <VideoPlane videoSrc={videoSrc} parallax={parallax} />
      </Suspense>

      {/* Golden frame glow */}
      <FrameGlow width={PLANE_W} height={PLANE_H} />

      {/* Camera controller */}
      <CameraRig scrollProgress={scrollProgress} parallax={parallax} />

      {/* Post-processing — Bloom gives the emissive frame its cinematic halo */}
      <EffectComposer>
        <Bloom
          intensity={0.45}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.85}
          radius={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

// ─── HeroScene (exported) ─────────────────────────────────────────────────────

// HeroScene: canvas that reads scrollProgress from parent
export default function HeroScene({
  videoSrc = '/videos/showreel.mp4',
  scrollProgress,
}: HeroSceneProps) {
  return (
    <Canvas
      camera={{
        position: [0, 0, CAM_Z_START],
        fov: 48,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias:        true,
        alpha:            true,    // transparent canvas bg — CSS handles the dark bg
        powerPreference:  'high-performance',
        toneMapping:      THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      dpr={[1, 1.5]}             // cap at 1.5× — retina without thrashing mobile GPUs
      frameloop="always"
      style={{ position: 'absolute', inset: 0 }}
    >
      <Scene videoSrc={videoSrc} scrollProgress={scrollProgress} />
    </Canvas>
  )
}
