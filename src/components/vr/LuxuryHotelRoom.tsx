import { useRef, useMemo } from "react";
import * as THREE from "three";

// ─── Utility: Create a subtle noise-like texture via canvas ───
const useCanvasTexture = (
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  repeat?: [number, number]
) => {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    draw(ctx, width, height);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    if (repeat) tex.repeat.set(repeat[0], repeat[1]);
    return tex;
  }, []);
};

// ─── Wood floor texture ───
const useWoodFloorTexture = () =>
  useCanvasTexture(512, 512, (ctx, w, h) => {
    // Base warm wood
    ctx.fillStyle = "#a5845b";
    ctx.fillRect(0, 0, w, h);
    // Planks
    const plankH = 64;
    for (let y = 0; y < h; y += plankH) {
      const offset = (Math.floor(y / plankH) % 2) * (w / 3);
      // Plank variation
      for (let x = -offset; x < w + w / 3; x += w / 2) {
        const shade = 140 + Math.random() * 30;
        ctx.fillStyle = `rgb(${shade + 25}, ${shade - 5}, ${shade - 40})`;
        ctx.fillRect(x, y + 1, w / 2 - 2, plankH - 2);
        // Grain lines
        ctx.strokeStyle = `rgba(80,55,30,${0.08 + Math.random() * 0.06})`;
        ctx.lineWidth = 0.5;
        for (let g = 0; g < 8; g++) {
          const gy = y + 4 + Math.random() * (plankH - 8);
          ctx.beginPath();
          ctx.moveTo(x + 2, gy);
          ctx.bezierCurveTo(x + w / 8, gy + (Math.random() - 0.5) * 3, x + w / 4, gy + (Math.random() - 0.5) * 3, x + w / 2 - 4, gy + (Math.random() - 0.5) * 2);
          ctx.stroke();
        }
      }
      // Gap between planks
      ctx.fillStyle = "rgba(50,30,15,0.35)";
      ctx.fillRect(0, y, w, 1.5);
    }
  }, [3, 3]);

// ─── Wall texture ───
const useWallTexture = () =>
  useCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#e8ddd0";
    ctx.fillRect(0, 0, w, h);
    // Subtle stucco noise
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const a = 0.02 + Math.random() * 0.04;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 0.7})`;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }, [4, 4]);

// ─── Fabric texture ───
const useFabricTexture = (baseColor: string) =>
  useCanvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, w, h);
    // Weave pattern
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        if ((x + y) % 4 === 0) {
          ctx.fillStyle = `rgba(255,255,255,0.04)`;
        } else {
          ctx.fillStyle = `rgba(0,0,0,0.03)`;
        }
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }, [6, 6]);

// ─── Carpet/rug texture ───
const useRugTexture = () =>
  useCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#7a6245";
    ctx.fillRect(0, 0, w, h);
    // Border pattern
    ctx.strokeStyle = "#5e4a30";
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, w - 40, h - 40);
    ctx.strokeStyle = "#c4a06a";
    ctx.lineWidth = 3;
    ctx.strokeRect(26, 26, w - 52, h - 52);
    // Inner geometric pattern
    ctx.strokeStyle = "rgba(196,160,106,0.3)";
    ctx.lineWidth = 1;
    for (let i = 40; i < w - 40; i += 16) {
      for (let j = 40; j < h - 40; j += 16) {
        if ((i + j) % 32 === 0) {
          ctx.fillStyle = "rgba(100,75,45,0.15)";
          ctx.fillRect(i, j, 12, 12);
        }
      }
    }
    // Pile texture noise
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = `rgba(${60 + Math.random() * 40},${45 + Math.random() * 30},${25 + Math.random() * 20},0.06)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 2);
    }
  }, [1, 1]);

// ─── Art canvas texture ───
const useArtTexture = () =>
  useCanvasTexture(256, 192, (ctx, w, h) => {
    // Abstract desert/landscape art
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#c9a96e");
    grad.addColorStop(0.4, "#d4b88a");
    grad.addColorStop(0.6, "#b8956a");
    grad.addColorStop(1, "#8b6f4e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Dunes
    ctx.fillStyle = "rgba(180,140,90,0.4)";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.bezierCurveTo(w * 0.25, h * 0.5, w * 0.5, h * 0.65, w, h * 0.55);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
    // Sun/moon circle
    ctx.fillStyle = "rgba(245,220,180,0.6)";
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.25, 25, 0, Math.PI * 2);
    ctx.fill();
  });

// ─── Curtain component with realistic draping ───
const RealisticCurtain = ({ position, width = 0.8, height = 3.8, color = "#c4a87c" }: any) => {
  const fabricTex = useFabricTexture(color);
  const folds = 10;
  return (
    <group position={position}>
      {Array.from({ length: folds }).map((_, i) => {
        const x = (i / (folds - 1) - 0.5) * width;
        const depth = Math.sin((i / (folds - 1)) * Math.PI * 3) * 0.025;
        const shade = 0.92 + Math.sin((i / (folds - 1)) * Math.PI * 3) * 0.08;
        return (
          <mesh key={i} position={[x, height / 2, depth]} castShadow>
            <boxGeometry args={[width / folds + 0.01, height, 0.02]} />
            <meshStandardMaterial
              map={fabricTex}
              color={new THREE.Color(color).multiplyScalar(shade)}
              roughness={0.88}
              metalness={0}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
      {/* Tieback */}
      <mesh position={[0, height * 0.35, 0.04]}>
        <torusGeometry args={[0.06, 0.012, 8, 16]} />
        <meshStandardMaterial color="#b8963e" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

// ─── Realistic bedside lamp ───
const RealisticLamp = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Base - polished metal */}
    <mesh castShadow>
      <cylinderGeometry args={[0.1, 0.12, 0.025, 32]} />
      <meshStandardMaterial color="#b8963e" metalness={0.9} roughness={0.1} />
    </mesh>
    {/* Stem */}
    <mesh position={[0, 0.2, 0]} castShadow>
      <cylinderGeometry args={[0.015, 0.018, 0.4, 16]} />
      <meshStandardMaterial color="#b8963e" metalness={0.9} roughness={0.1} />
    </mesh>
    {/* Stem detail ring */}
    <mesh position={[0, 0.1, 0]}>
      <torusGeometry args={[0.02, 0.005, 8, 16]} />
      <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
    </mesh>
    {/* Shade - fabric with inner glow */}
    <mesh position={[0, 0.45, 0]}>
      <cylinderGeometry args={[0.06, 0.16, 0.28, 32, 1, true]} />
      <meshStandardMaterial
        color="#f0e4d0"
        roughness={0.92}
        metalness={0}
        side={THREE.DoubleSide}
        transparent
        opacity={0.88}
        emissive="#ffe8c8"
        emissiveIntensity={0.4}
      />
    </mesh>
    {/* Inner shade glow */}
    <mesh position={[0, 0.45, 0]}>
      <cylinderGeometry args={[0.055, 0.14, 0.26, 32, 1, true]} />
      <meshStandardMaterial
        color="#fff5e1"
        emissive="#fff5e1"
        emissiveIntensity={0.6}
        transparent
        opacity={0.3}
        side={THREE.BackSide}
      />
    </mesh>
    <pointLight position={[0, 0.42, 0]} intensity={0.5} distance={3.5} color="#ffe4b5" castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
    <pointLight position={[0, 0.3, 0]} intensity={0.2} distance={1.5} color="#fff5e1" />
  </group>
);

// ─── Armchair ───
const Armchair = ({ position, rotation = [0, 0, 0] as [number, number, number] }: any) => {
  const fabricTex = useFabricTexture("#6b5d4f");
  return (
    <group position={position} rotation={rotation}>
      {/* Seat base */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.7, 0.44, 0.7]} />
        <meshStandardMaterial color="#4a3c30" roughness={0.5} metalness={0.05} />
      </mesh>
      {/* Seat cushion */}
      <mesh position={[0, 0.47, 0.02]} castShadow>
        <boxGeometry args={[0.62, 0.1, 0.6]} />
        <meshStandardMaterial map={fabricTex} color="#7a6b5a" roughness={0.9} metalness={0} />
      </mesh>
      {/* Cushion softness detail */}
      <mesh position={[0, 0.5, 0.02]}>
        <sphereGeometry args={[0.28, 16, 8]} />
        <meshStandardMaterial map={fabricTex} color="#7a6b5a" roughness={0.92} metalness={0} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.65, -0.28]} castShadow>
        <boxGeometry args={[0.66, 0.5, 0.14]} />
        <meshStandardMaterial map={fabricTex} color="#7a6b5a" roughness={0.9} metalness={0} />
      </mesh>
      {/* Back cushion */}
      <mesh position={[0, 0.7, -0.2]} castShadow>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial map={fabricTex} color="#8a7b6a" roughness={0.92} metalness={0} />
      </mesh>
      {/* Armrests */}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[x, 0.48, -0.05]} castShadow>
          <boxGeometry args={[0.08, 0.12, 0.6]} />
          <meshStandardMaterial color="#4a3c30" roughness={0.5} metalness={0.05} />
        </mesh>
      ))}
      {/* Legs */}
      {[[-0.28, 0, -0.28], [0.28, 0, -0.28], [-0.28, 0, 0.28], [0.28, 0, 0.28]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.02, 0.015, 0.06, 8]} />
          <meshStandardMaterial color="#b8963e" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

// ─── Coffee table ───
const CoffeeTable = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Glass top */}
    <mesh position={[0, 0.42, 0]} castShadow>
      <cylinderGeometry args={[0.35, 0.35, 0.02, 32]} />
      <meshPhysicalMaterial color="#c8d8e0" roughness={0.05} metalness={0.1} transmission={0.6} thickness={0.5} transparent opacity={0.7} />
    </mesh>
    {/* Metal frame */}
    <mesh position={[0, 0.21, 0]}>
      <cylinderGeometry args={[0.03, 0.03, 0.42, 16]} />
      <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
    </mesh>
    {/* Base */}
    <mesh position={[0, 0.01, 0]}>
      <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
      <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
    </mesh>
    {/* Decorative book stack */}
    <group position={[-0.08, 0.46, 0.05]}>
      {[0, 0.025, 0.05].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[0, i * 0.3, 0]}>
          <boxGeometry args={[0.14, 0.02, 0.1]} />
          <meshStandardMaterial color={["#5c3d2e", "#8b6f4e", "#3a5c4a"][i]} roughness={0.7} />
        </mesh>
      ))}
    </group>
  </group>
);

// ─── Realistic framed art ───
const RealisticFramedArt = ({ position, rotation = [0, 0, 0] as [number, number, number], size = [1.0, 0.7] }: any) => {
  const artTex = useArtTexture();
  return (
    <group position={position} rotation={rotation}>
      {/* Outer frame */}
      <mesh castShadow>
        <boxGeometry args={[size[0] + 0.1, size[1] + 0.1, 0.04]} />
        <meshStandardMaterial color="#4a3728" roughness={0.35} metalness={0.15} />
      </mesh>
      {/* Inner frame / mat */}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[size[0] + 0.02, size[1] + 0.02, 0.015]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.8} metalness={0} />
      </mesh>
      {/* Art canvas */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[size[0] - 0.06, size[1] - 0.06]} />
        <meshStandardMaterial map={artTex} roughness={0.6} metalness={0} />
      </mesh>
      {/* Glass cover */}
      <mesh position={[0, 0, 0.028]}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.02} metalness={0.05} transmission={0.9} transparent opacity={0.08} />
      </mesh>
    </group>
  );
};

// ─── Wall mirror (realistic) ───
const RealisticMirror = ({ position, rotation = [0, 0, 0] as [number, number, number] }: any) => (
  <group position={position} rotation={rotation}>
    {/* Frame */}
    <mesh castShadow>
      <boxGeometry args={[0.85, 1.3, 0.04]} />
      <meshStandardMaterial color="#b8963e" roughness={0.2} metalness={0.85} />
    </mesh>
    {/* Mirror surface */}
    <mesh position={[0, 0, 0.025]}>
      <planeGeometry args={[0.72, 1.17]} />
      <meshPhysicalMaterial color="#d8dce0" roughness={0.02} metalness={0.98} />
    </mesh>
  </group>
);

// ─── Decorative plant ───
const LuxuryPlant = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Pot */}
    <mesh castShadow>
      <cylinderGeometry args={[0.1, 0.08, 0.2, 16]} />
      <meshStandardMaterial color="#f5f0e8" roughness={0.3} metalness={0.05} />
    </mesh>
    {/* Pot rim */}
    <mesh position={[0, 0.1, 0]}>
      <torusGeometry args={[0.1, 0.012, 8, 16]} />
      <meshStandardMaterial color="#f0ebe0" roughness={0.3} metalness={0.05} />
    </mesh>
    {/* Soil */}
    <mesh position={[0, 0.08, 0]}>
      <cylinderGeometry args={[0.085, 0.085, 0.04, 16]} />
      <meshStandardMaterial color="#3d2b1f" roughness={0.95} />
    </mesh>
    {/* Leaves - layered and natural */}
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
      const lean = 0.25 + Math.random() * 0.3;
      const h = 0.18 + Math.random() * 0.12;
      return (
        <mesh key={i} position={[Math.cos(angle) * 0.05, 0.15 + h / 2, Math.sin(angle) * 0.05]} rotation={[lean * Math.cos(angle), angle, lean * Math.sin(angle)]}>
          <planeGeometry args={[0.06, h]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#4a6741" : "#3d5a35"} roughness={0.75} side={THREE.DoubleSide} />
        </mesh>
      );
    })}
  </group>
);

// ─── Luxury bench at foot of bed ───
const BedBench = ({ position }: { position: [number, number, number] }) => {
  const fabricTex = useFabricTexture("#6b5040");
  return (
    <group position={position}>
      {/* Frame */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[1.6, 0.08, 0.5]} />
        <meshStandardMaterial color="#4a3020" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Upholstered top */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.5, 0.08, 0.44]} />
        <meshStandardMaterial map={fabricTex} color="#7a6050" roughness={0.9} metalness={0} />
      </mesh>
      {/* Quilted top details */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-0.5 + i * 0.25, 0.295, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.008, 8]} />
          <meshStandardMaterial color="#5a4030" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
      {/* Legs */}
      {[[-0.7, 0.07, -0.2], [0.7, 0.07, -0.2], [-0.7, 0.07, 0.2], [0.7, 0.07, 0.2]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.02, 0.015, 0.14, 8]} />
          <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
    </group>
  );
};

// ─── Wall sconce ───
const WallSconce = ({ position, rotation = [0, 0, 0] as [number, number, number] }: any) => (
  <group position={position} rotation={rotation}>
    {/* Backplate */}
    <mesh>
      <boxGeometry args={[0.08, 0.14, 0.03]} />
      <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
    </mesh>
    {/* Arm */}
    <mesh position={[0, 0.02, 0.06]}>
      <boxGeometry args={[0.02, 0.02, 0.1]} />
      <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
    </mesh>
    {/* Shade */}
    <mesh position={[0, 0.06, 0.11]}>
      <cylinderGeometry args={[0.03, 0.065, 0.1, 16, 1, true]} />
      <meshStandardMaterial color="#f0e4d0" roughness={0.9} transparent opacity={0.85} emissive="#ffe8c8" emissiveIntensity={0.5} side={THREE.DoubleSide} />
    </mesh>
    <pointLight position={[0, 0.08, 0.12]} intensity={0.25} distance={2.5} color="#ffe4b5" />
  </group>
);

// ─── Main Room Component ───
export const LuxuryHotelRoom = () => {
  const groupRef = useRef<THREE.Group>(null);
  const woodTex = useWoodFloorTexture();
  const wallTex = useWallTexture();
  const rugTex = useRugTexture();
  const sheetTex = useFabricTexture("#f5f0e6");
  const duvetTex = useFabricTexture("#e8dcc8");
  const headboardTex = useFabricTexture("#7a6245");

  return (
    <group ref={groupRef}>
      {/* ═══════ FLOOR ═══════ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial map={woodTex} color="#a5845b" roughness={0.5} metalness={0.04} />
      </mesh>

      {/* ═══════ WALLS ═══════ */}
      {/* Back wall */}
      <mesh position={[0, 2.75, -6]} receiveShadow>
        <boxGeometry args={[12, 5.5, 0.15]} />
        <meshStandardMaterial map={wallTex} color="#e8ddd0" roughness={0.72} metalness={0} />
      </mesh>
      {/* Wall wainscoting / panel (back) */}
      <mesh position={[0, 1.2, -5.9]}>
        <boxGeometry args={[11.6, 2.4, 0.06]} />
        <meshStandardMaterial map={wallTex} color="#ddd0c0" roughness={0.65} metalness={0.02} />
      </mesh>
      {/* Panel trim line */}
      <mesh position={[0, 2.42, -5.87]}>
        <boxGeometry args={[11.6, 0.04, 0.03]} />
        <meshStandardMaterial color="#c8b8a0" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-6, 2.75, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[12, 5.5, 0.15]} />
        <meshStandardMaterial map={wallTex} color="#e5d8ca" roughness={0.72} metalness={0} />
      </mesh>
      {/* Left wall panel */}
      <mesh position={[-5.9, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[11.6, 2.4, 0.06]} />
        <meshStandardMaterial map={wallTex} color="#ddd0c0" roughness={0.65} metalness={0.02} />
      </mesh>

      {/* Right wall */}
      <mesh position={[6, 2.75, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[12, 5.5, 0.15]} />
        <meshStandardMaterial map={wallTex} color="#e5d8ca" roughness={0.72} metalness={0} />
      </mesh>

      {/* ═══════ CEILING ═══════ */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.5, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} metalness={0} />
      </mesh>
      {/* Crown molding */}
      {[
        { pos: [0, 5.42, -5.92] as [number, number, number], args: [12, 0.12, 0.12] as [number, number, number] },
        { pos: [-5.92, 5.42, 0] as [number, number, number], args: [0.12, 0.12, 12] as [number, number, number] },
        { pos: [5.92, 5.42, 0] as [number, number, number], args: [0.12, 0.12, 12] as [number, number, number] },
      ].map((m, i) => (
        <mesh key={`molding-${i}`} position={m.pos}>
          <boxGeometry args={m.args} />
          <meshStandardMaterial color="#f0e8d8" roughness={0.5} metalness={0.05} />
        </mesh>
      ))}
      {/* Baseboard */}
      {[
        { pos: [0, 0.06, -5.9] as [number, number, number], args: [12, 0.12, 0.06] as [number, number, number] },
        { pos: [-5.92, 0.06, 0] as [number, number, number], args: [0.06, 0.12, 12] as [number, number, number] },
        { pos: [5.92, 0.06, 0] as [number, number, number], args: [0.06, 0.12, 12] as [number, number, number] },
      ].map((m, i) => (
        <mesh key={`base-${i}`} position={m.pos}>
          <boxGeometry args={m.args} />
          <meshStandardMaterial color="#d8cbb8" roughness={0.45} metalness={0.05} />
        </mesh>
      ))}

      {/* ═══════ BED ═══════ */}
      <group position={[0, 0, -4]}>
        {/* Headboard - upholstered panels */}
        <mesh position={[0, 1.5, -0.95]} castShadow>
          <boxGeometry args={[3.4, 2.5, 0.1]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.45} metalness={0.1} />
        </mesh>
        {/* Headboard upholstery panels (3 vertical) */}
        {[-0.85, 0, 0.85].map((x, i) => (
          <mesh key={`hb-${i}`} position={[x, 1.5, -0.88]} castShadow>
            <boxGeometry args={[0.8, 2.0, 0.06]} />
            <meshStandardMaterial map={headboardTex} color="#8b6f47" roughness={0.85} metalness={0} />
          </mesh>
        ))}
        {/* Tufting buttons */}
        {[-0.85, 0, 0.85].flatMap((x, xi) =>
          [0.8, 1.3, 1.8, 2.2].map((y, yi) => (
            <mesh key={`btn-${xi}-${yi}`} position={[x, y, -0.84]}>
              <sphereGeometry args={[0.018, 12, 12]} />
              <meshStandardMaterial color="#6b5535" roughness={0.5} metalness={0.35} />
            </mesh>
          ))
        )}

        {/* Bed platform */}
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.3, 0.3, 2.3]} />
          <meshStandardMaterial color="#4a3020" roughness={0.4} metalness={0.08} />
        </mesh>
        {/* Mattress */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[3.0, 0.24, 2.0]} />
          <meshStandardMaterial color="#f8f4ee" roughness={0.92} metalness={0} />
        </mesh>
        {/* Mattress piping edge */}
        <mesh position={[0, 0.42, 1.0]}>
          <boxGeometry args={[3.0, 0.22, 0.02]} />
          <meshStandardMaterial color="#e8e0d4" roughness={0.85} />
        </mesh>

        {/* Bottom fitted sheet */}
        <mesh position={[0, 0.56, 0]}>
          <boxGeometry args={[2.95, 0.03, 1.95]} />
          <meshStandardMaterial map={sheetTex} color="#fff8f0" roughness={0.95} metalness={0} />
        </mesh>

        {/* Top sheet (slightly pulled back) */}
        <mesh position={[0, 0.6, 0.15]} castShadow>
          <boxGeometry args={[2.9, 0.02, 1.6]} />
          <meshStandardMaterial map={sheetTex} color="#f5efe5" roughness={0.95} metalness={0} />
        </mesh>
        {/* Sheet fold at top */}
        <mesh position={[0, 0.62, -0.55]}>
          <boxGeometry args={[2.9, 0.03, 0.15]} />
          <meshStandardMaterial map={sheetTex} color="#f0ebe0" roughness={0.92} />
        </mesh>

        {/* Duvet */}
        <mesh position={[0, 0.66, 0.2]} castShadow>
          <boxGeometry args={[2.85, 0.1, 1.4]} />
          <meshStandardMaterial map={duvetTex} color="#ece0d0" roughness={0.92} metalness={0} />
        </mesh>
        {/* Duvet fold/drape at foot */}
        <mesh position={[0, 0.58, 0.95]}>
          <boxGeometry args={[2.85, 0.18, 0.12]} />
          <meshStandardMaterial map={duvetTex} color="#e4d8c6" roughness={0.92} />
        </mesh>

        {/* Bed runner */}
        <mesh position={[0, 0.72, 0.5]}>
          <boxGeometry args={[2.85, 0.025, 0.6]} />
          <meshStandardMaterial color="#6b4226" roughness={0.82} metalness={0.05} />
        </mesh>
        {/* Runner edge trim */}
        <mesh position={[0, 0.72, 0.2]}>
          <boxGeometry args={[2.85, 0.02, 0.01]} />
          <meshStandardMaterial color="#b8963e" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* ── Pillows: back euro shams ── */}
        {[-0.75, 0, 0.75].map((x, i) => (
          <group key={`euro-${i}`} position={[x, 0.82, -0.65]}>
            <mesh rotation={[-0.15, 0, 0]} castShadow>
              <boxGeometry args={[0.55, 0.5, 0.1]} />
              <meshStandardMaterial color="#f0ebe0" roughness={0.92} metalness={0} />
            </mesh>
          </group>
        ))}
        {/* Standard pillows */}
        {[-0.5, 0.5].map((x, i) => (
          <group key={`pillow-${i}`} position={[x, 0.78, -0.35]}>
            <mesh rotation={[-0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.6, 0.14, 0.35]} />
              <meshStandardMaterial map={sheetTex} color="#fff8f0" roughness={0.94} metalness={0} />
            </mesh>
            {/* Pillow puff */}
            <mesh position={[0, 0.04, 0]} rotation={[-0.1, 0, 0]}>
              <sphereGeometry args={[0.18, 16, 10]} />
              <meshStandardMaterial map={sheetTex} color="#fff8f0" roughness={0.94} metalness={0} />
            </mesh>
          </group>
        ))}
        {/* Decorative cushions */}
        <mesh position={[-0.25, 0.78, -0.08]} rotation={[0.2, 0.15, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.08]} />
          <meshStandardMaterial color="#b8963e" roughness={0.88} metalness={0.05} />
        </mesh>
        <mesh position={[0.25, 0.78, -0.08]} rotation={[0.2, -0.15, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.08]} />
          <meshStandardMaterial color="#8b4513" roughness={0.88} metalness={0.05} />
        </mesh>
      </group>

      {/* ═══════ NIGHTSTANDS ═══════ */}
      {[-2.3, 2.3].map((x, i) => (
        <group key={`ns-${i}`} position={[x, 0, -4.3]}>
          {/* Body */}
          <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.64, 0.45]} />
            <meshStandardMaterial color="#5c3d2e" roughness={0.35} metalness={0.08} />
          </mesh>
          {/* Top surface */}
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[0.62, 0.02, 0.47]} />
            <meshStandardMaterial color="#6b4a35" roughness={0.3} metalness={0.1} />
          </mesh>
          {/* Drawer face */}
          <mesh position={[0, 0.4, 0.225]}>
            <boxGeometry args={[0.5, 0.22, 0.015]} />
            <meshStandardMaterial color="#4a3020" roughness={0.38} metalness={0.08} />
          </mesh>
          {/* Drawer handle */}
          <mesh position={[0, 0.4, 0.24]}>
            <boxGeometry args={[0.12, 0.015, 0.015]} />
            <meshStandardMaterial color="#b8963e" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Lower drawer */}
          <mesh position={[0, 0.15, 0.225]}>
            <boxGeometry args={[0.5, 0.22, 0.015]} />
            <meshStandardMaterial color="#4a3020" roughness={0.38} metalness={0.08} />
          </mesh>
          <mesh position={[0, 0.15, 0.24]}>
            <boxGeometry args={[0.12, 0.015, 0.015]} />
            <meshStandardMaterial color="#b8963e" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Legs */}
          {[[-0.25, 0, -0.18], [0.25, 0, -0.18], [-0.25, 0, 0.18], [0.25, 0, 0.18]].map((p, j) => (
            <mesh key={j} position={p as [number, number, number]}>
              <cylinderGeometry args={[0.015, 0.012, 0.04, 8]} />
              <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
            </mesh>
          ))}
          {/* Lamp */}
          <RealisticLamp position={[0, 0.66, 0]} />
        </group>
      ))}

      {/* ═══════ WINDOW ═══════ */}
      <group position={[-5.85, 2.8, -2]}>
        {/* Window recess */}
        <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[3.8, 4.2, 0.2]} />
          <meshStandardMaterial map={wallTex} color="#ddd0c0" roughness={0.7} />
        </mesh>
        {/* Window frame */}
        <mesh position={[0.12, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[3.5, 3.9, 0.06]} />
          <meshStandardMaterial color="#5c4a32" roughness={0.3} metalness={0.12} />
        </mesh>
        {/* Glass panes */}
        {[[-0.88, 0], [0.88, 0]].map(([xOff, _], i) => (
          <mesh key={i} position={[0.15, 0, xOff]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.6, 3.7]} />
            <meshPhysicalMaterial color="#b0d8f0" roughness={0.02} metalness={0.15} transmission={0.4} transparent opacity={0.75} emissive="#c0e8ff" emissiveIntensity={0.25} />
          </mesh>
        ))}
        {/* Window mullion (center vertical) */}
        <mesh position={[0.14, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.04, 3.8, 0.04]} />
          <meshStandardMaterial color="#5c4a32" roughness={0.3} metalness={0.12} />
        </mesh>
        {/* Horizontal divider */}
        <mesh position={[0.14, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[3.4, 0.04, 0.04]} />
          <meshStandardMaterial color="#5c4a32" roughness={0.3} metalness={0.12} />
        </mesh>
        {/* Window sill */}
        <mesh position={[0.2, -2.0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[3.6, 0.06, 0.2]} />
          <meshStandardMaterial color="#d8cbb8" roughness={0.4} metalness={0.05} />
        </mesh>
      </group>

      {/* ═══════ CURTAINS ═══════ */}
      <RealisticCurtain position={[-5.72, 0.1, -4.2]} width={0.9} height={4.8} color="#c4a87c" />
      <RealisticCurtain position={[-5.72, 0.1, 0.2]} width={0.9} height={4.8} color="#c4a87c" />
      {/* Sheer curtains */}
      <mesh position={[-5.78, 2.7, -2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.8, 4.6]} />
        <meshStandardMaterial color="#fff8f0" roughness={0.95} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      {/* Curtain rod */}
      <mesh position={[-5.65, 4.6, -2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
        <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[-5.65, 4.6, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 5, 16]} />
        <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Finials */}
      {[-4.5, 0.5].map((z, i) => (
        <mesh key={`finial-${i}`} position={[-5.65, 4.6, z]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color="#b8963e" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}

      {/* ═══════ BED BENCH ═══════ */}
      <BedBench position={[0, 0, -2.5]} />

      {/* ═══════ RUG ═══════ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -3]} receiveShadow>
        <planeGeometry args={[3.5, 3.5]} />
        <meshStandardMaterial map={rugTex} color="#7a6245" roughness={0.95} metalness={0} />
      </mesh>

      {/* ═══════ SEATING AREA ═══════ */}
      <Armchair position={[4.2, 0, 1.5]} rotation={[0, -Math.PI / 3, 0]} />
      <Armchair position={[4.2, 0, -0.5]} rotation={[0, -Math.PI / 2.5, 0]} />
      <CoffeeTable position={[3.5, 0, 0.5]} />

      {/* ═══════ TV AREA ═══════ */}
      {/* TV console */}
      <mesh position={[5.3, 0.45, -4]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.9, 2.2]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.35} metalness={0.08} />
      </mesh>
      <mesh position={[5.3, 0.91, -4]}>
        <boxGeometry args={[0.62, 0.02, 2.22]} />
        <meshStandardMaterial color="#6b4a35" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* TV */}
      <mesh position={[5.85, 2.3, -4]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.8, 1.0, 0.04]} />
        <meshStandardMaterial color="#111111" roughness={0.25} metalness={0.65} />
      </mesh>
      <mesh position={[5.82, 2.3, -4]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.72, 0.92]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.08} metalness={0.2} emissive="#050510" emissiveIntensity={0.05} />
      </mesh>

      {/* ═══════ DESK ═══════ */}
      <group position={[5, 0, 2.5]}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.04, 0.55]} />
          <meshStandardMaterial color="#5c3d2e" roughness={0.32} metalness={0.08} />
        </mesh>
        {/* Legs */}
        {[[-0.55, 0.375, -0.22], [0.55, 0.375, -0.22], [-0.55, 0.375, 0.22], [0.55, 0.375, 0.22]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} castShadow>
            <boxGeometry args={[0.035, 0.75, 0.035]} />
            <meshStandardMaterial color="#5c3d2e" roughness={0.35} metalness={0.08} />
          </mesh>
        ))}
        {/* Desk lamp */}
        <group position={[0.4, 0.77, 0]}>
          <mesh><cylinderGeometry args={[0.06, 0.07, 0.015, 16]} /><meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.6} /></mesh>
          <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.008, 0.008, 0.3, 8]} /><meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.6} /></mesh>
          <mesh position={[0, 0.3, 0.05]} rotation={[0.3, 0, 0]}><coneGeometry args={[0.08, 0.12, 16, 1, true]} /><meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.5} side={THREE.DoubleSide} /></mesh>
          <pointLight position={[0, 0.25, 0.1]} intensity={0.15} distance={2} color="#fff5e1" />
        </group>
      </group>

      {/* ═══════ WALL DECOR ═══════ */}
      <RealisticFramedArt position={[0, 3.4, -5.86]} size={[1.2, 0.8]} />
      <RealisticFramedArt position={[-2.5, 3.2, -5.86]} size={[0.6, 0.8]} />
      <RealisticFramedArt position={[2.5, 3.2, -5.86]} size={[0.6, 0.8]} />
      <RealisticMirror position={[5.88, 2.8, 2.5]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Wall sconces flanking bed */}
      <WallSconce position={[-1.5, 3.0, -5.83]} />
      <WallSconce position={[1.5, 3.0, -5.83]} />

      {/* ═══════ ACCESSORIES ═══════ */}
      <LuxuryPlant position={[-5.2, 0, 3]} />
      <LuxuryPlant position={[4.8, 0.92, -4.8]} />

      {/* Decorative tray on nightstand */}
      <group position={[-2.3, 0.67, -4.3]}>
        <mesh><boxGeometry args={[0.25, 0.015, 0.18]} /><meshStandardMaterial color="#b8963e" metalness={0.8} roughness={0.15} /></mesh>
      </group>

      {/* ═══════ LIGHTING ═══════ */}
      {/* Warm ambient */}
      <ambientLight intensity={0.2} color="#fff0d8" />

      {/* Window daylight - key light */}
      <directionalLight
        position={[-10, 10, 0]}
        intensity={0.7}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={25}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />

      {/* Window fill light */}
      <pointLight position={[-5, 3.5, -2]} intensity={0.35} distance={10} color="#e8f0ff" />
      <pointLight position={[-4, 1.5, -2]} intensity={0.15} distance={6} color="#ffecd2" />

      {/* Ceiling indirect */}
      <pointLight position={[0, 5.2, -3]} intensity={0.15} distance={8} color="#fff5e1" />
      <pointLight position={[3, 5.2, 0]} intensity={0.1} distance={6} color="#fff5e1" />

      {/* Accent / rim */}
      <spotLight position={[4, 5, 3]} angle={0.5} penumbra={0.9} intensity={0.15} color="#ffe4b5" />

      {/* Floor bounce */}
      <pointLight position={[0, 0.3, -3]} intensity={0.06} distance={5} color="#d4b896" />
      <pointLight position={[4, 0.3, 0]} intensity={0.04} distance={4} color="#d4b896" />
    </group>
  );
};
