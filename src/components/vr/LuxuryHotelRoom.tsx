import { useRef, useMemo } from "react";
import * as THREE from "three";

// ─── Canvas-based texture generator ───
const useCanvasTexture = (
  w: number, h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  repeat?: [number, number]
) => useMemo(() => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}, []);

// ─── Wood plank texture (light oak) ───
const useWoodTexture = () => useCanvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = "#c9a87c";
  ctx.fillRect(0, 0, w, h);
  const pH = 42;
  for (let y = 0; y < h; y += pH) {
    const off = (Math.floor(y / pH) % 2) * (w / 3);
    for (let x = -off; x < w + w / 3; x += w / 2.5) {
      const r = 170 + Math.random() * 25, g = r - 30, b = r - 65;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y + 0.8, w / 2.5 - 1.5, pH - 1.5);
      ctx.strokeStyle = `rgba(100,70,35,${0.04 + Math.random() * 0.04})`;
      ctx.lineWidth = 0.4;
      for (let g2 = 0; g2 < 6; g2++) {
        const gy = y + 3 + Math.random() * (pH - 6);
        ctx.beginPath(); ctx.moveTo(x, gy);
        ctx.bezierCurveTo(x + w / 8, gy + (Math.random() - .5) * 2, x + w / 5, gy + (Math.random() - .5) * 2, x + w / 2.5, gy);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "rgba(80,55,30,0.12)";
    ctx.fillRect(0, y, w, 0.8);
  }
}, [4, 4]);

// ─── Carpet texture (dark patterned) ───
const useCarpetTexture = () => useCanvasTexture(256, 256, (ctx, w, h) => {
  ctx.fillStyle = "#3a3632";
  ctx.fillRect(0, 0, w, h);
  // Subtle pattern
  for (let y = 0; y < h; y += 8) {
    for (let x = 0; x < w; x += 8) {
      const v = Math.sin(x * 0.15) * Math.cos(y * 0.15) * 15;
      ctx.fillStyle = `rgba(${55 + v},${50 + v},${48 + v},0.5)`;
      ctx.fillRect(x, y, 8, 8);
    }
  }
  // Pile noise
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = `rgba(${40 + Math.random() * 30},${38 + Math.random() * 25},${35 + Math.random() * 20},0.08)`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1.5);
  }
}, [3, 3]);

// ─── Wood panel accent texture ───
const useWoodPanelTexture = () => useCanvasTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = "#b08860";
  ctx.fillRect(0, 0, w, h);
  // Vertical panels
  const panelW = w / 6;
  for (let i = 0; i < 6; i++) {
    const shade = 155 + Math.random() * 20;
    ctx.fillStyle = `rgb(${shade + 15},${shade - 20},${shade - 55})`;
    ctx.fillRect(i * panelW + 1, 0, panelW - 2, h);
    // Wood grain
    ctx.strokeStyle = `rgba(90,60,30,0.06)`;
    ctx.lineWidth = 0.5;
    for (let g = 0; g < 15; g++) {
      const gx = i * panelW + 4 + Math.random() * (panelW - 8);
      ctx.beginPath(); ctx.moveTo(gx, 0);
      ctx.bezierCurveTo(gx + (Math.random() - .5) * 4, h / 3, gx + (Math.random() - .5) * 4, h * 2 / 3, gx + (Math.random() - .5) * 2, h);
      ctx.stroke();
    }
    // Panel gap
    ctx.fillStyle = "rgba(60,40,20,0.3)";
    ctx.fillRect(i * panelW, 0, 1.2, h);
  }
}, [1, 1]);

// ─── Fabric weave texture ───
const useFabricTex = (base: string) => useCanvasTexture(64, 64, (ctx, w, h) => {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 2)
    for (let x = 0; x < w; x += 2) {
      ctx.fillStyle = (x + y) % 4 === 0 ? `rgba(255,255,255,0.03)` : `rgba(0,0,0,0.02)`;
      ctx.fillRect(x, y, 2, 2);
    }
}, [8, 8]);

// ─── Wall subtle texture ───
const useWallTex = () => useCanvasTexture(128, 128, (ctx, w, h) => {
  ctx.fillStyle = "#f0ece6";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = Math.random() > .5 ? `rgba(255,255,255,${0.015 + Math.random() * 0.02})` : `rgba(0,0,0,${0.01 + Math.random() * 0.015})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
  }
}, [6, 6]);

// ─── Landscape art texture ───
const useArtTexture = () => useCanvasTexture(400, 250, (ctx, w, h) => {
  // Soft abstract landscape / desert
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  sky.addColorStop(0, "#d4c8b8"); sky.addColorStop(1, "#e8ddd0");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h * 0.5);
  // Horizon
  const land = ctx.createLinearGradient(0, h * 0.45, 0, h);
  land.addColorStop(0, "#c4a87c"); land.addColorStop(0.5, "#b8956a"); land.addColorStop(1, "#a07850");
  ctx.fillStyle = land; ctx.fillRect(0, h * 0.45, w, h * 0.55);
  // Dunes
  ctx.fillStyle = "rgba(180,145,100,0.5)";
  ctx.beginPath(); ctx.moveTo(0, h * 0.6);
  ctx.bezierCurveTo(w * .2, h * .45, w * .4, h * .55, w * .6, h * .48);
  ctx.bezierCurveTo(w * .8, h * .42, w * .9, h * .5, w, h * .45);
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  // Sun
  ctx.fillStyle = "rgba(255,240,210,0.5)";
  ctx.beginPath(); ctx.arc(w * .65, h * .2, 30, 0, Math.PI * 2); ctx.fill();
  // Soft haze
  const haze = ctx.createLinearGradient(0, h * 0.4, 0, h * 0.55);
  haze.addColorStop(0, "rgba(220,210,195,0.4)"); haze.addColorStop(1, "rgba(220,210,195,0)");
  ctx.fillStyle = haze; ctx.fillRect(0, h * 0.4, w, h * 0.15);
});

// ─── Recessed ceiling downlight ───
const Downlight = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh>
      <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
      <meshStandardMaterial color="#e0e0e0" roughness={0.3} metalness={0.4} />
    </mesh>
    <mesh position={[0, -0.02, 0]}>
      <circleGeometry args={[0.05, 16]} />
      <meshStandardMaterial color="#fffaf0" emissive="#fff8e8" emissiveIntensity={1.5} />
    </mesh>
    <spotLight
      position={[0, -0.05, 0]}
      angle={0.7}
      penumbra={0.9}
      intensity={0.35}
      distance={5}
      color="#fff5e1"
      castShadow
      shadow-mapSize-width={512}
      shadow-mapSize-height={512}
    />
  </group>
);

// ─── Modern bedside lamp ───
const ModernLamp = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {/* Base */}
    <mesh castShadow>
      <cylinderGeometry args={[0.08, 0.09, 0.02, 24]} />
      <meshStandardMaterial color="#c0c0c0" metalness={0.85} roughness={0.12} />
    </mesh>
    {/* Stem */}
    <mesh position={[0, 0.18, 0]} castShadow>
      <cylinderGeometry args={[0.012, 0.012, 0.36, 12]} />
      <meshStandardMaterial color="#c0c0c0" metalness={0.85} roughness={0.12} />
    </mesh>
    {/* Shade - cylindrical modern */}
    <mesh position={[0, 0.42, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 0.22, 24, 1, true]} />
      <meshStandardMaterial
        color="#f5f0e8" roughness={0.9} metalness={0}
        side={THREE.DoubleSide} transparent opacity={0.85}
        emissive="#fff5e1" emissiveIntensity={0.35}
      />
    </mesh>
    {/* Top cap */}
    <mesh position={[0, 0.53, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.01, 0.12, 24]} />
      <meshStandardMaterial color="#f0ebe0" roughness={0.8} side={THREE.DoubleSide} />
    </mesh>
    <pointLight position={[0, 0.4, 0]} intensity={0.4} distance={3} color="#ffe8c8" castShadow />
    <pointLight position={[0, 0.3, 0]} intensity={0.15} distance={1.2} color="#fff5e1" />
  </group>
);

// ─── Modern sofa ───
const ModernSofa = ({ position, rotation = [0, 0, 0] as [number, number, number] }: any) => {
  const fab = useFabricTex("#8a8278");
  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.4, 0.65]} />
        <meshStandardMaterial color="#6b6560" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Seat cushion */}
      <mesh position={[0, 0.43, 0.03]} castShadow>
        <boxGeometry args={[1.3, 0.08, 0.55]} />
        <meshStandardMaterial map={fab} color="#9a9488" roughness={0.9} />
      </mesh>
      {/* Back cushions */}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={i} position={[x, 0.55, -0.22]} castShadow>
          <boxGeometry args={[0.58, 0.3, 0.12]} />
          <meshStandardMaterial map={fab} color="#9a9488" roughness={0.92} />
        </mesh>
      ))}
      {/* Armrests */}
      {[-0.65, 0.65].map((x, i) => (
        <mesh key={`arm-${i}`} position={[x, 0.35, 0]} castShadow>
          <boxGeometry args={[0.08, 0.12, 0.6]} />
          <meshStandardMaterial color="#6b6560" roughness={0.55} metalness={0.05} />
        </mesh>
      ))}
      {/* Legs */}
      {[[-0.6, 0, -0.25], [0.6, 0, -0.25], [-0.6, 0, 0.25], [0.6, 0, 0.25]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.015, 0.012, 0.04, 8]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      {/* Throw pillow */}
      <mesh position={[-0.35, 0.52, 0.05]} rotation={[0.1, 0.2, 0.05]} castShadow>
        <boxGeometry args={[0.28, 0.28, 0.07]} />
        <meshStandardMaterial color="#c4a87c" roughness={0.88} />
      </mesh>
    </group>
  );
};

// ─── Small round table ───
const RoundTable = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.42, 0]} castShadow>
      <cylinderGeometry args={[0.28, 0.28, 0.025, 32]} />
      <meshStandardMaterial color="#ddd5ca" roughness={0.3} metalness={0.05} />
    </mesh>
    <mesh position={[0, 0.21, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 0.42, 12]} />
      <meshStandardMaterial color="#888" metalness={0.75} roughness={0.15} />
    </mesh>
    <mesh position={[0, 0.01, 0]}>
      <cylinderGeometry args={[0.18, 0.18, 0.015, 24]} />
      <meshStandardMaterial color="#888" metalness={0.75} roughness={0.15} />
    </mesh>
  </group>
);

// ─── Sheer curtain (translucent, light-catching) ───
const SheerCurtain = ({ position, width = 1.8, height = 5 }: any) => {
  const folds = 20;
  return (
    <group position={position}>
      {Array.from({ length: folds }).map((_, i) => {
        const x = (i / (folds - 1) - 0.5) * width;
        const z = Math.sin(i * 0.8) * 0.015;
        const opacity = 0.08 + Math.sin(i * 0.6) * 0.03;
        return (
          <mesh key={i} position={[x, height / 2, z]}>
            <planeGeometry args={[width / folds + 0.005, height]} />
            <meshStandardMaterial
              color="#fff8f0" roughness={0.95} metalness={0}
              transparent opacity={opacity} side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ─── Heavy curtain panel ───
const HeavyCurtain = ({ position, width = 0.7, height = 5, color = "#b0a898" }: any) => {
  const fab = useFabricTex(color);
  const folds = 8;
  return (
    <group position={position}>
      {Array.from({ length: folds }).map((_, i) => {
        const x = (i / (folds - 1) - 0.5) * width;
        const z = Math.sin(i * 1.2) * 0.02;
        const brightness = 0.9 + Math.sin(i * 1.2) * 0.1;
        return (
          <mesh key={i} position={[x, height / 2, z]} castShadow>
            <boxGeometry args={[width / folds + 0.008, height, 0.015]} />
            <meshStandardMaterial
              map={fab}
              color={new THREE.Color(color).multiplyScalar(brightness)}
              roughness={0.88} metalness={0} side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ═══════════════════════════════════════════════
// MAIN ROOM
// ═══════════════════════════════════════════════
export const LuxuryHotelRoom = () => {
  const ref = useRef<THREE.Group>(null);
  const woodFloor = useWoodTexture();
  const carpet = useCarpetTexture();
  const woodPanel = useWoodPanelTexture();
  const wallTex = useWallTex();
  const sheetFab = useFabricTex("#f5f0ea");
  const duvetFab = useFabricTex("#e8e2d8");
  const artTex = useArtTexture();

  const roomW = 10, roomD = 10, roomH = 4.5;
  const hw = roomW / 2, hd = roomD / 2;

  return (
    <group ref={ref}>

      {/* ═══ FLOOR ═══ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial map={woodFloor} color="#c0a07a" roughness={0.45} metalness={0.03} />
      </mesh>

      {/* ═══ CARPET (bed area) ═══ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -1.5]} receiveShadow>
        <planeGeometry args={[4.5, 5]} />
        <meshStandardMaterial map={carpet} color="#3a3632" roughness={0.95} metalness={0} />
      </mesh>

      {/* ═══ WALLS ═══ */}
      {/* Back wall */}
      <mesh position={[0, roomH / 2, -hd]} receiveShadow>
        <boxGeometry args={[roomW, roomH, 0.12]} />
        <meshStandardMaterial map={wallTex} color="#f0ece6" roughness={0.7} />
      </mesh>
      {/* Back wall - wood accent panel behind bed */}
      <mesh position={[0, roomH / 2, -hd + 0.07]}>
        <boxGeometry args={[3.8, roomH, 0.04]} />
        <meshStandardMaterial map={woodPanel} color="#b08860" roughness={0.45} metalness={0.05} />
      </mesh>

      {/* Left wall (window wall) */}
      <mesh position={[-hw, roomH / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[roomD, roomH, 0.12]} />
        <meshStandardMaterial map={wallTex} color="#eee8e0" roughness={0.7} />
      </mesh>

      {/* Right wall */}
      <mesh position={[hw, roomH / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[roomD, roomH, 0.12]} />
        <meshStandardMaterial map={wallTex} color="#eee8e0" roughness={0.7} />
      </mesh>

      {/* ═══ CEILING ═══ */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, roomH, 0]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#f5f2ee" roughness={0.9} />
      </mesh>
      {/* Ceiling recess (cove lighting channel) */}
      <mesh position={[0, roomH - 0.08, -hd + 2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[roomW - 0.5, 0.06, 4]} />
        <meshStandardMaterial color="#edeae5" roughness={0.85} />
      </mesh>

      {/* Baseboards */}
      {[
        [0, 0.04, -hd + 0.07, roomW, 0.08, 0.02],
        [-hw + 0.07, 0.04, 0, 0.02, 0.08, roomD],
        [hw - 0.07, 0.04, 0, 0.02, 0.08, roomD],
      ].map((b, i) => (
        <mesh key={`bb-${i}`} position={[b[0], b[1], b[2]] as [number, number, number]}>
          <boxGeometry args={[b[3], b[4], b[5]] as [number, number, number]} />
          <meshStandardMaterial color="#e0dbd4" roughness={0.45} metalness={0.03} />
        </mesh>
      ))}

      {/* ═══ WINDOW (full wall, left side) ═══ */}
      <group position={[-hw + 0.08, roomH / 2, -1]}>
        {/* Window frame */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[4.5, roomH - 0.4, 0.06]} />
          <meshStandardMaterial color="#e8e4de" roughness={0.35} metalness={0.08} />
        </mesh>
        {/* Glass */}
        <mesh position={[0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4.2, roomH - 0.7]} />
          <meshPhysicalMaterial
            color="#c8dce8" roughness={0.02} metalness={0.1}
            transmission={0.5} transparent opacity={0.6}
            emissive="#d0e4f0" emissiveIntensity={0.3}
          />
        </mesh>
        {/* Window divider */}
        <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.03, roomH - 0.6, 0.03]} />
          <meshStandardMaterial color="#d8d4ce" roughness={0.35} metalness={0.08} />
        </mesh>
      </group>

      {/* ═══ CURTAINS ═══ */}
      {/* Sheer (across window) */}
      <SheerCurtain position={[-hw + 0.2, 0, -1]} width={4.5} height={roomH - 0.2} />
      {/* Heavy curtains (sides) */}
      <HeavyCurtain position={[-hw + 0.25, 0, -3.5]} width={0.8} height={roomH - 0.2} color="#a09888" />
      <HeavyCurtain position={[-hw + 0.25, 0, 1.5]} width={0.8} height={roomH - 0.2} color="#a09888" />
      {/* Curtain rod */}
      <mesh position={[-hw + 0.18, roomH - 0.15, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 5.5, 12]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.15} />
      </mesh>

      {/* ═══ BED ═══ */}
      <group position={[0, 0, -3.2]}>
        {/* Platform / base */}
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.24, 2.1]} />
          <meshStandardMaterial color="#e8e2da" roughness={0.5} metalness={0.03} />
        </mesh>

        {/* Mattress */}
        <mesh position={[0, 0.36, 0]} castShadow>
          <boxGeometry args={[2.6, 0.22, 1.95]} />
          <meshStandardMaterial color="#faf6f0" roughness={0.92} />
        </mesh>
        {/* Mattress edge piping */}
        <mesh position={[0, 0.36, 0.975]}>
          <boxGeometry args={[2.6, 0.2, 0.015]} />
          <meshStandardMaterial color="#e8e2da" roughness={0.8} />
        </mesh>

        {/* Fitted sheet */}
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[2.55, 0.02, 1.9]} />
          <meshStandardMaterial map={sheetFab} color="#ffffff" roughness={0.95} />
        </mesh>

        {/* Top sheet */}
        <mesh position={[0, 0.52, 0.12]} castShadow>
          <boxGeometry args={[2.5, 0.015, 1.55]} />
          <meshStandardMaterial map={sheetFab} color="#f8f5f0" roughness={0.95} />
        </mesh>

        {/* Duvet */}
        <mesh position={[0, 0.56, 0.15]} castShadow>
          <boxGeometry args={[2.45, 0.1, 1.4]} />
          <meshStandardMaterial map={duvetFab} color="#f0ebe2" roughness={0.92} />
        </mesh>
        {/* Duvet fold/drape at edges */}
        <mesh position={[1.22, 0.48, 0.15]}>
          <boxGeometry args={[0.04, 0.18, 1.3]} />
          <meshStandardMaterial map={duvetFab} color="#e8e2d8" roughness={0.92} />
        </mesh>
        <mesh position={[-1.22, 0.48, 0.15]}>
          <boxGeometry args={[0.04, 0.18, 1.3]} />
          <meshStandardMaterial map={duvetFab} color="#e8e2d8" roughness={0.92} />
        </mesh>
        {/* Duvet fold top */}
        <mesh position={[0, 0.58, -0.52]}>
          <boxGeometry args={[2.45, 0.06, 0.18]} />
          <meshStandardMaterial map={sheetFab} color="#f5f0ea" roughness={0.92} />
        </mesh>
        {/* Foot drape */}
        <mesh position={[0, 0.45, 0.88]}>
          <boxGeometry args={[2.4, 0.15, 0.08]} />
          <meshStandardMaterial map={duvetFab} color="#e4ded4" roughness={0.92} />
        </mesh>

        {/* Bed runner (accent) */}
        <mesh position={[0, 0.62, 0.35]}>
          <boxGeometry args={[2.45, 0.02, 0.5]} />
          <meshStandardMaterial color="#8a7e70" roughness={0.85} />
        </mesh>

        {/* ── Euro shams (back) ── */}
        {[-0.65, 0, 0.65].map((x, i) => (
          <mesh key={`euro-${i}`} position={[x, 0.72, -0.6]} rotation={[-0.2, 0, 0]} castShadow>
            <boxGeometry args={[0.55, 0.52, 0.08]} />
            <meshStandardMaterial color="#f0ebe2" roughness={0.92} />
          </mesh>
        ))}

        {/* ── Sleeping pillows ── */}
        {[-0.45, 0.45].map((x, i) => (
          <group key={`pil-${i}`} position={[x, 0.66, -0.32]}>
            <mesh rotation={[-0.12, 0, 0]} castShadow>
              <boxGeometry args={[0.55, 0.12, 0.32]} />
              <meshStandardMaterial map={sheetFab} color="#ffffff" roughness={0.94} />
            </mesh>
            {/* Pillow puff */}
            <mesh position={[0, 0.04, 0]} rotation={[-0.12, 0, 0]} scale={[2, 0.6, 1.2]}>
              <sphereGeometry args={[0.12, 14, 10]} />
              <meshStandardMaterial map={sheetFab} color="#ffffff" roughness={0.94} />
            </mesh>
          </group>
        ))}

        {/* ── Accent cushions ── */}
        <mesh position={[-0.22, 0.66, -0.05]} rotation={[0.2, 0.12, 0]} castShadow>
          <boxGeometry args={[0.28, 0.28, 0.06]} />
          <meshStandardMaterial color="#c4a87c" roughness={0.88} />
        </mesh>
        <mesh position={[0.22, 0.66, -0.05]} rotation={[0.2, -0.12, 0]} castShadow>
          <boxGeometry args={[0.28, 0.28, 0.06]} />
          <meshStandardMaterial color="#7a8878" roughness={0.88} />
        </mesh>
      </group>

      {/* ═══ NIGHTSTANDS ═══ */}
      {[-1.8, 1.8].map((x, i) => (
        <group key={`ns-${i}`} position={[x, 0, -3.5]}>
          <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 0.56, 0.4]} />
            <meshStandardMaterial color="#e8e2da" roughness={0.4} metalness={0.03} />
          </mesh>
          {/* Top */}
          <mesh position={[0, 0.57, 0]}>
            <boxGeometry args={[0.52, 0.015, 0.42]} />
            <meshStandardMaterial color="#ddd6cc" roughness={0.35} metalness={0.05} />
          </mesh>
          {/* Drawer */}
          <mesh position={[0, 0.28, 0.2]}>
            <boxGeometry args={[0.42, 0.2, 0.012]} />
            <meshStandardMaterial color="#dad3c8" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.28, 0.21]}>
            <boxGeometry args={[0.1, 0.012, 0.012]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.15} />
          </mesh>
          {/* Legs */}
          {[[-0.2, 0, -0.15], [0.2, 0, -0.15], [-0.2, 0, 0.15], [0.2, 0, 0.15]].map((p, j) => (
            <mesh key={j} position={p as [number, number, number]}>
              <cylinderGeometry args={[0.012, 0.01, 0.04, 8]} />
              <meshStandardMaterial color="#a0a0a0" metalness={0.7} roughness={0.2} />
            </mesh>
          ))}
          <ModernLamp position={[0, 0.58, 0]} />
        </group>
      ))}

      {/* ═══ WALL ART (behind bed, above headboard) ═══ */}
      <group position={[0, 2.8, -hd + 0.12]}>
        {/* Frame */}
        <mesh castShadow>
          <boxGeometry args={[1.6, 1.0, 0.035]} />
          <meshStandardMaterial color="#3a3530" roughness={0.35} metalness={0.1} />
        </mesh>
        {/* Mat */}
        <mesh position={[0, 0, 0.015]}>
          <boxGeometry args={[1.5, 0.9, 0.01]} />
          <meshStandardMaterial color="#f5f2ee" roughness={0.8} />
        </mesh>
        {/* Art */}
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[1.35, 0.78]} />
          <meshStandardMaterial map={artTex} roughness={0.55} />
        </mesh>
      </group>

      {/* Vertical LED strip lights flanking wood panel */}
      {[-1.92, 1.92].map((x, i) => (
        <group key={`led-${i}`} position={[x, roomH / 2, -hd + 0.06]}>
          <mesh>
            <boxGeometry args={[0.02, roomH - 0.5, 0.01]} />
            <meshStandardMaterial color="#fff5e1" emissive="#fff0d8" emissiveIntensity={0.8} transparent opacity={0.6} />
          </mesh>
          <pointLight position={[0, 0, 0.05]} intensity={0.12} distance={2} color="#fff0d8" />
        </group>
      ))}

      {/* ═══ TV + CONSOLE (right wall) ═══ */}
      {/* TV console */}
      <mesh position={[hw - 0.35, 0.35, -2]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.7, 1.8]} />
        <meshStandardMaterial color="#e0dbd4" roughness={0.4} metalness={0.03} />
      </mesh>
      <mesh position={[hw - 0.35, 0.71, -2]}>
        <boxGeometry args={[0.52, 0.015, 1.82]} />
        <meshStandardMaterial color="#d8d2ca" roughness={0.35} metalness={0.05} />
      </mesh>
      {/* TV */}
      <mesh position={[hw - 0.08, 2.0, -2]} rotation={[0, -Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.5, 0.85, 0.03]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.6} />
      </mesh>
      <mesh position={[hw - 0.1, 2.0, -2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.42, 0.78]} />
        <meshStandardMaterial color="#0a0a12" roughness={0.08} metalness={0.15} emissive="#060610" emissiveIntensity={0.03} />
      </mesh>

      {/* ═══ SOFA + TABLE (near window) ═══ */}
      <ModernSofa position={[-3, 0, 2.5]} rotation={[0, Math.PI / 4, 0]} />
      <RoundTable position={[-2, 0, 3]} />

      {/* ═══ DESK (right side) ═══ */}
      <group position={[hw - 0.6, 0, 2.5]}>
        {/* Desktop */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.035, 0.5]} />
          <meshStandardMaterial color="#c0a07a" roughness={0.35} metalness={0.05} />
        </mesh>
        {/* Legs */}
        {[[-0.45, 0.375, -0.2], [0.45, 0.375, -0.2], [-0.45, 0.375, 0.2], [0.45, 0.375, 0.2]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <boxGeometry args={[0.03, 0.75, 0.03]} />
            <meshStandardMaterial color="#b0946e" roughness={0.38} metalness={0.05} />
          </mesh>
        ))}
        {/* Chair */}
        <group position={[0, 0, 0.55]}>
          <mesh position={[0, 0.38, 0]} castShadow>
            <boxGeometry args={[0.44, 0.04, 0.42]} />
            <meshStandardMaterial color="#6b6560" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.6, -0.18]} castShadow>
            <boxGeometry args={[0.42, 0.4, 0.04]} />
            <meshStandardMaterial color="#6b6560" roughness={0.55} />
          </mesh>
          {[[-0.18, 0.19, -0.18], [0.18, 0.19, -0.18], [-0.18, 0.19, 0.18], [0.18, 0.19, 0.18]].map((p, i) => (
            <mesh key={i} position={p as [number, number, number]}>
              <cylinderGeometry args={[0.015, 0.012, 0.38, 8]} />
              <meshStandardMaterial color="#888" metalness={0.7} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ═══ BED BENCH ═══ */}
      <group position={[0, 0, -1.5]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[1.4, 0.06, 0.4]} />
          <meshStandardMaterial color="#5c5550" roughness={0.4} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[1.3, 0.06, 0.35]} />
          <meshStandardMaterial color="#8a8278" roughness={0.88} />
        </mesh>
        {[[-0.6, 0.1, -0.15], [0.6, 0.1, -0.15], [-0.6, 0.1, 0.15], [0.6, 0.1, 0.15]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <cylinderGeometry args={[0.015, 0.012, 0.2, 8]} />
            <meshStandardMaterial color="#888" metalness={0.7} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ═══ MIRROR (right wall near desk) ═══ */}
      <group position={[hw - 0.06, 2.2, 2.5]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 1.2, 0.025]} />
          <meshStandardMaterial color="#3a3530" roughness={0.3} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[0.52, 1.12]} />
          <meshPhysicalMaterial color="#d5dae0" roughness={0.02} metalness={0.95} />
        </mesh>
      </group>

      {/* ═══ RECESSED CEILING DOWNLIGHTS ═══ */}
      {[
        [-2, roomH - 0.02, -3],
        [2, roomH - 0.02, -3],
        [0, roomH - 0.02, -1],
        [-2, roomH - 0.02, 1],
        [2, roomH - 0.02, 1],
        [0, roomH - 0.02, 3],
      ].map((p, i) => (
        <Downlight key={`dl-${i}`} position={p as [number, number, number]} />
      ))}

      {/* ═══ LIGHTING ═══ */}
      {/* Soft warm ambient */}
      <ambientLight intensity={0.18} color="#fff0d8" />

      {/* Key light - window daylight */}
      <directionalLight
        position={[-10, 8, -1]}
        intensity={0.6}
        color="#f8f4f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={22}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      {/* Window fill */}
      <pointLight position={[-hw + 0.5, 3, -1]} intensity={0.3} distance={8} color="#e0ecf8" />
      <pointLight position={[-hw + 0.5, 1, -1]} intensity={0.12} distance={5} color="#f0e8d8" />

      {/* Cove lighting (indirect ceiling) */}
      <pointLight position={[0, roomH - 0.2, -3]} intensity={0.08} distance={5} color="#fff5e1" />
      <pointLight position={[0, roomH - 0.2, 1]} intensity={0.06} distance={4} color="#fff5e1" />
      <pointLight position={[-3, roomH - 0.2, 0]} intensity={0.05} distance={4} color="#fff5e1" />
      <pointLight position={[3, roomH - 0.2, 0]} intensity={0.05} distance={4} color="#fff5e1" />

      {/* Floor bounce (subtle warmth) */}
      <pointLight position={[0, 0.2, -2]} intensity={0.04} distance={4} color="#d4b896" />

      {/* Soft fill (prevents harsh dark areas) */}
      <hemisphereLight args={["#e8e4e0", "#c0b8a8", 0.15]} />
    </group>
  );
};
