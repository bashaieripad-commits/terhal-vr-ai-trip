import { useRef } from "react";
import * as THREE from "three";

// Reusable rounded box helper
const RoundedBox = ({ args, radius = 0.02, position, rotation, material }: any) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <boxGeometry args={args} />
    {material}
  </mesh>
);

// Curtain panel
const Curtain = ({ position, color = "#c4a87c" }: { position: [number, number, number]; color?: string }) => (
  <group position={position}>
    {/* Main curtain fabric with folds */}
    {Array.from({ length: 6 }).map((_, i) => (
      <mesh key={i} position={[i * 0.12 - 0.3, 0, Math.sin(i * 0.8) * 0.03]} castShadow>
        <boxGeometry args={[0.1, 3.2, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.0} side={THREE.DoubleSide} />
      </mesh>
    ))}
    {/* Curtain rod */}
    <mesh position={[0, 1.65, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 1, 16]} rotation={[0, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#8b7355" metalness={0.8} roughness={0.2} />
    </mesh>
  </group>
);

// Bedside lamp
const BedsideLamp = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Base */}
    <mesh position={[0, 0, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.14, 0.04, 32]} />
      <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
    </mesh>
    {/* Stem */}
    <mesh position={[0, 0.25, 0]} castShadow>
      <cylinderGeometry args={[0.02, 0.025, 0.5, 16]} />
      <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
    </mesh>
    {/* Shade */}
    <mesh position={[0, 0.55, 0]}>
      <cylinderGeometry args={[0.08, 0.18, 0.3, 32, 1, true]} />
      <meshStandardMaterial
        color="#f5e6c8"
        roughness={0.9}
        metalness={0}
        side={THREE.DoubleSide}
        transparent
        opacity={0.85}
        emissive="#fff5e1"
        emissiveIntensity={0.3}
      />
    </mesh>
    {/* Bulb glow */}
    <pointLight position={[0, 0.5, 0]} intensity={0.6} distance={4} color="#ffe4b5" castShadow />
  </group>
);

// Pillow
const Pillow = ({ position, rotation = [0, 0, 0] as [number, number, number], scale = 1 }: any) => (
  <mesh position={position} rotation={rotation} scale={scale} castShadow>
    <sphereGeometry args={[0.25, 16, 12]} />
    <meshStandardMaterial color="#f8f0e3" roughness={0.95} metalness={0} />
    <mesh scale={[1.6, 0.5, 1.2]}>
      <sphereGeometry args={[0.25, 16, 12]} />
      <meshStandardMaterial color="#f8f0e3" roughness={0.95} metalness={0} />
    </mesh>
  </mesh>
);

// Decorative cushion
const Cushion = ({ position, color = "#8b6f47", rotation = [0, 0, 0] as [number, number, number] }: any) => (
  <mesh position={position} rotation={rotation} castShadow>
    <boxGeometry args={[0.35, 0.35, 0.12]} />
    <meshStandardMaterial color={color} roughness={0.9} metalness={0} />
  </mesh>
);

// Framed art
const FramedArt = ({ position, rotation = [0, 0, 0] as [number, number, number] }: any) => (
  <group position={position} rotation={rotation}>
    {/* Frame */}
    <mesh castShadow>
      <boxGeometry args={[1.2, 0.8, 0.05]} />
      <meshStandardMaterial color="#5c4a32" roughness={0.4} metalness={0.3} />
    </mesh>
    {/* Canvas */}
    <mesh position={[0, 0, 0.03]}>
      <planeGeometry args={[1.0, 0.6]} />
      <meshStandardMaterial color="#c4956a" roughness={0.8} metalness={0} />
    </mesh>
    {/* Abstract art elements */}
    <mesh position={[-0.2, 0.05, 0.035]}>
      <circleGeometry args={[0.15, 32]} />
      <meshStandardMaterial color="#d4a574" roughness={0.7} />
    </mesh>
    <mesh position={[0.15, -0.05, 0.035]}>
      <circleGeometry args={[0.1, 32]} />
      <meshStandardMaterial color="#b8860b" roughness={0.6} metalness={0.2} />
    </mesh>
  </group>
);

// Wall mirror
const WallMirror = ({ position, rotation = [0, 0, 0] as [number, number, number] }: any) => (
  <group position={position} rotation={rotation}>
    <mesh castShadow>
      <boxGeometry args={[0.8, 1.2, 0.04]} />
      <meshStandardMaterial color="#3a2f24" roughness={0.3} metalness={0.4} />
    </mesh>
    <mesh position={[0, 0, 0.025]}>
      <planeGeometry args={[0.65, 1.05]} />
      <meshStandardMaterial color="#a8b8c8" roughness={0.05} metalness={0.95} />
    </mesh>
  </group>
);

// Vase with plant
const VaseWithPlant = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh castShadow>
      <cylinderGeometry args={[0.06, 0.08, 0.25, 16]} />
      <meshStandardMaterial color="#f5f0e8" roughness={0.3} metalness={0.1} />
    </mesh>
    {/* Leaves */}
    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
      <mesh
        key={i}
        position={[
          Math.cos((angle * Math.PI) / 180) * 0.08,
          0.2 + i * 0.03,
          Math.sin((angle * Math.PI) / 180) * 0.08,
        ]}
        rotation={[0.3, (angle * Math.PI) / 180, 0.5]}
      >
        <planeGeometry args={[0.08, 0.18]} />
        <meshStandardMaterial color="#4a6741" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    ))}
  </group>
);

// Desk
const Desk = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Desktop */}
    <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.4, 0.04, 0.6]} />
      <meshStandardMaterial color="#5c3d2e" roughness={0.35} metalness={0.1} />
    </mesh>
    {/* Legs */}
    {[[-0.6, 0.375, -0.25], [0.6, 0.375, -0.25], [-0.6, 0.375, 0.25], [0.6, 0.375, 0.25]].map((pos, i) => (
      <mesh key={i} position={pos as [number, number, number]} castShadow>
        <boxGeometry args={[0.04, 0.75, 0.04]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.35} metalness={0.1} />
      </mesh>
    ))}
    {/* Chair */}
    <group position={[0, 0, 0.6]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#4a3728" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.7, -0.22]} castShadow>
        <boxGeometry args={[0.5, 0.55, 0.06]} />
        <meshStandardMaterial color="#4a3728" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Chair cushion */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.44, 0.06, 0.44]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      {[[-0.2, 0.2, -0.2], [0.2, 0.2, -0.2], [-0.2, 0.2, 0.2], [0.2, 0.2, 0.2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#4a3728" roughness={0.35} metalness={0.15} />
        </mesh>
      ))}
    </group>
  </group>
);

// Luggage bench
const LuggageBench = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.0, 0.06, 0.45]} />
      <meshStandardMaterial color="#3d2b1f" roughness={0.4} metalness={0.15} />
    </mesh>
    {/* Leather top */}
    <mesh position={[0, 0.29, 0]}>
      <boxGeometry args={[0.95, 0.04, 0.4]} />
      <meshStandardMaterial color="#6b4226" roughness={0.7} metalness={0.05} />
    </mesh>
    {/* Cross legs */}
    {[[-0.4, 0.125, 0], [0.4, 0.125, 0]].map((pos, i) => (
      <group key={i} position={pos as [number, number, number]}>
        <mesh rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.03, 0.3, 0.4]} />
          <meshStandardMaterial color="#b8963e" metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[0.03, 0.3, 0.4]} />
          <meshStandardMaterial color="#b8963e" metalness={0.7} roughness={0.25} />
        </mesh>
      </group>
    ))}
  </group>
);

// Soft rug
const Rug = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[3, 2]} />
      <meshStandardMaterial color="#8b6f47" roughness={0.95} metalness={0} />
    </mesh>
    {/* Border */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
      <ringGeometry args={[1.3, 1.5, 4]} />
      <meshStandardMaterial color="#6b4f2f" roughness={0.95} metalness={0} />
    </mesh>
  </group>
);

export const LuxuryHotelRoom = () => {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      {/* ===== FLOOR ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#b39272" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Floor wood planks effect */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`plank-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -5.5 + i]} receiveShadow>
          <planeGeometry args={[12, 0.01]} />
          <meshStandardMaterial color="#8b6f47" roughness={0.6} metalness={0} transparent opacity={0.3} />
        </mesh>
      ))}

      {/* ===== WALLS ===== */}
      {/* Back wall */}
      <mesh position={[0, 2.75, -6]} receiveShadow>
        <boxGeometry args={[12, 5.5, 0.15]} />
        <meshStandardMaterial color="#e8ddd0" roughness={0.75} metalness={0} />
      </mesh>
      {/* Wall panel accent (back) */}
      <mesh position={[0, 1.8, -5.9]}>
        <boxGeometry args={[11.5, 2.2, 0.05]} />
        <meshStandardMaterial color="#d4c4b0" roughness={0.65} metalness={0.02} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-6, 2.75, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[12, 5.5, 0.15]} />
        <meshStandardMaterial color="#e5d8ca" roughness={0.75} metalness={0} />
      </mesh>

      {/* Right wall */}
      <mesh position={[6, 2.75, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[12, 5.5, 0.15]} />
        <meshStandardMaterial color="#e5d8ca" roughness={0.75} metalness={0} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.5, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} metalness={0} />
      </mesh>
      {/* Ceiling molding */}
      <mesh position={[0, 5.4, -5.9]}>
        <boxGeometry args={[12, 0.15, 0.15]} />
        <meshStandardMaterial color="#f0e8d8" roughness={0.5} metalness={0.05} />
      </mesh>

      {/* ===== BED ===== */}
      <group position={[0, 0, -4]}>
        {/* Headboard */}
        <mesh position={[0, 1.4, -0.9]} castShadow>
          <boxGeometry args={[3.2, 2.2, 0.12]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.5} metalness={0.1} />
        </mesh>
        {/* Headboard upholstery */}
        <mesh position={[0, 1.5, -0.83]}>
          <boxGeometry args={[2.9, 1.8, 0.06]} />
          <meshStandardMaterial color="#8b6f47" roughness={0.85} metalness={0} />
        </mesh>
        {/* Tufting details on headboard */}
        {Array.from({ length: 3 }).map((_, row) =>
          Array.from({ length: 4 }).map((_, col) => (
            <mesh
              key={`tuft-${row}-${col}`}
              position={[-0.9 + col * 0.6, 1.0 + row * 0.5, -0.79]}
            >
              <sphereGeometry args={[0.03, 12, 12]} />
              <meshStandardMaterial color="#7a6040" roughness={0.6} metalness={0.3} />
            </mesh>
          ))
        )}

        {/* Bed frame */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.25, 2.2]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Bed platform */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[3.3, 0.06, 2.3]} />
          <meshStandardMaterial color="#4a3020" roughness={0.45} metalness={0.1} />
        </mesh>

        {/* Mattress */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[3.0, 0.25, 2.0]} />
          <meshStandardMaterial color="#f8f4ee" roughness={0.9} metalness={0} />
        </mesh>

        {/* Bottom sheet */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[2.95, 0.04, 1.95]} />
          <meshStandardMaterial color="#fff8f0" roughness={0.95} metalness={0} />
        </mesh>

        {/* Duvet / comforter */}
        <mesh position={[0, 0.78, 0.25]} castShadow>
          <boxGeometry args={[2.9, 0.12, 1.5]} />
          <meshStandardMaterial color="#f0e6d6" roughness={0.92} metalness={0} />
        </mesh>
        {/* Duvet fold at top */}
        <mesh position={[0, 0.82, -0.45]}>
          <boxGeometry args={[2.9, 0.08, 0.3]} />
          <meshStandardMaterial color="#e8dcc8" roughness={0.92} metalness={0} />
        </mesh>

        {/* Bed runner */}
        <mesh position={[0, 0.85, 0.55]}>
          <boxGeometry args={[2.9, 0.03, 0.55]} />
          <meshStandardMaterial color="#6b4226" roughness={0.8} metalness={0.05} />
        </mesh>

        {/* Pillows - back row */}
        <Pillow position={[-0.7, 0.95, -0.6]} />
        <Pillow position={[0.7, 0.95, -0.6]} />
        {/* Pillows - front row */}
        <Pillow position={[-0.55, 0.9, -0.25]} scale={0.85} />
        <Pillow position={[0.55, 0.9, -0.25]} scale={0.85} />

        {/* Decorative cushions */}
        <Cushion position={[-0.3, 0.92, -0.05]} color="#b8963e" rotation={[0.15, 0.2, 0]} />
        <Cushion position={[0.3, 0.92, -0.05]} color="#8b4513" rotation={[0.15, -0.2, 0]} />
      </group>

      {/* ===== NIGHTSTANDS ===== */}
      {/* Left nightstand */}
      <group position={[-2.2, 0, -4.2]}>
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.65, 0.7, 0.5]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.35} metalness={0.1} />
        </mesh>
        {/* Drawer */}
        <mesh position={[0, 0.35, 0.26]}>
          <boxGeometry args={[0.55, 0.18, 0.02]} />
          <meshStandardMaterial color="#4a3020" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Drawer handle */}
        <mesh position={[0, 0.35, 0.28]}>
          <boxGeometry args={[0.15, 0.02, 0.02]} />
          <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
        </mesh>
        <BedsideLamp position={[0, 0.7, 0]} />
        <VaseWithPlant position={[0.2, 0.7, -0.1]} />
      </group>

      {/* Right nightstand */}
      <group position={[2.2, 0, -4.2]}>
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.65, 0.7, 0.5]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.35} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.35, 0.26]}>
          <boxGeometry args={[0.55, 0.18, 0.02]} />
          <meshStandardMaterial color="#4a3020" roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.35, 0.28]}>
          <boxGeometry args={[0.15, 0.02, 0.02]} />
          <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
        </mesh>
        <BedsideLamp position={[0, 0.7, 0]} />
      </group>

      {/* ===== WINDOW with view ===== */}
      <group position={[-5.85, 2.5, -2]}>
        {/* Window frame */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[3.5, 3.8, 0.08]} />
          <meshStandardMaterial color="#5c4a32" roughness={0.35} metalness={0.15} />
        </mesh>
        {/* Window glass with sky reflection */}
        <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[3.2, 3.5]} />
          <meshStandardMaterial
            color="#87ceeb"
            roughness={0.05}
            metalness={0.3}
            emissive="#b0d8f0"
            emissiveIntensity={0.4}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Window dividers */}
        <mesh position={[0.06, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.03, 3.5, 0.03]} />
          <meshStandardMaterial color="#5c4a32" roughness={0.35} metalness={0.15} />
        </mesh>
        <mesh position={[0.06, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[3.2, 0.03, 0.03]} />
          <meshStandardMaterial color="#5c4a32" roughness={0.35} metalness={0.15} />
        </mesh>
      </group>

      {/* Curtains */}
      <Curtain position={[-5.7, 2.5, -3.8]} color="#c4a87c" />
      <Curtain position={[-5.7, 2.5, -0.2]} color="#c4a87c" />

      {/* ===== DESK AREA ===== */}
      <Desk position={[4.5, 0, -1]} />

      {/* ===== WALL DECOR ===== */}
      <FramedArt position={[0, 3.2, -5.88]} />
      <WallMirror position={[5.88, 2.8, -1]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Wall sconces */}
      {[-1.8, 1.8].map((x, i) => (
        <group key={`sconce-${i}`} position={[x, 3.2, -5.85]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.2, 0.08]} />
            <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.12, 0.06]}>
            <cylinderGeometry args={[0.06, 0.04, 0.12, 16, 1, true]} />
            <meshStandardMaterial
              color="#f5e6c8"
              roughness={0.85}
              transparent
              opacity={0.8}
              emissive="#ffe4b5"
              emissiveIntensity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
          <pointLight position={[0, 0.15, 0.15]} intensity={0.3} distance={3} color="#ffe4b5" />
        </group>
      ))}

      {/* ===== LUGGAGE BENCH ===== */}
      <LuggageBench position={[0, 0, -2]} />

      {/* ===== RUG ===== */}
      <Rug position={[0, 0.005, -2.5]} />

      {/* ===== TV / Entertainment ===== */}
      <group position={[5.85, 2.2, -4]}>
        <mesh rotation={[0, -Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[1.8, 1.0, 0.05]} />
          <meshStandardMaterial color="#111111" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Screen */}
        <mesh position={[-0.03, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.7, 0.9]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.2} emissive="#0a0a15" emissiveIntensity={0.1} />
        </mesh>
      </group>

      {/* TV console */}
      <mesh position={[5.3, 0.5, -4]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 1.0, 2.0]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.35} metalness={0.1} />
      </mesh>

      {/* ===== MINIBAR / SIDE TABLE ===== */}
      <group position={[4.5, 0, 2]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.04, 32]} />
          <meshStandardMaterial color="#b8963e" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.44, 16]} />
          <meshStandardMaterial color="#b8963e" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.03, 32]} />
          <meshStandardMaterial color="#b8963e" metalness={0.7} roughness={0.2} />
        </mesh>
      </group>

      {/* ===== LIGHTING ===== */}
      {/* Main ambient */}
      <ambientLight intensity={0.25} color="#fff5e1" />

      {/* Window daylight */}
      <directionalLight
        position={[-8, 8, 2]}
        intensity={0.8}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.001}
      />

      {/* Warm fill from window */}
      <pointLight position={[-5, 3, -2]} intensity={0.4} distance={10} color="#ffecd2" />

      {/* Ceiling ambient glow */}
      <pointLight position={[0, 5, -2]} intensity={0.3} distance={8} color="#fff5e1" />

      {/* Accent rim light */}
      <spotLight
        position={[3, 5, 2]}
        angle={0.6}
        penumbra={0.8}
        intensity={0.3}
        color="#ffe4b5"
        castShadow={false}
      />

      {/* Floor bounce light */}
      <pointLight position={[0, 0.2, 0]} intensity={0.1} distance={6} color="#d4b896" />
    </group>
  );
};
