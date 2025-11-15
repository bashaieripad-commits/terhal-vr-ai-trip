import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

// Simple hotel room scene
const HotelRoom = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#d4b896" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.5, -5]}>
        <boxGeometry args={[10, 5, 0.1]} />
        <meshStandardMaterial color="#e8d5be" />
      </mesh>
      <mesh position={[-5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[10, 5, 0.1]} />
        <meshStandardMaterial color="#e8d5be" />
      </mesh>

      {/* Bed */}
      <group position={[0, 0.5, -3]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3, 0.5, 4]} />
          <meshStandardMaterial color="#8b7355" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[3, 0.2, 4]} />
          <meshStandardMaterial color="#f5e6d3" />
        </mesh>
        {/* Pillows */}
        <mesh position={[-0.8, 0.7, -1.3]}>
          <boxGeometry args={[0.8, 0.3, 0.6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.8, 0.7, -1.3]}>
          <boxGeometry args={[0.8, 0.3, 0.6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Window */}
      <mesh position={[-4.9, 2.5, -2]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.3} />
      </mesh>

      {/* Nightstand */}
      <mesh position={[2.5, 0.4, -3]}>
        <boxGeometry args={[0.8, 0.8, 0.6]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Lamp */}
      <group position={[2.5, 1, -3]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.6]} />
          <meshStandardMaterial color="#d4af37" />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <coneGeometry args={[0.3, 0.4, 32]} />
          <meshStandardMaterial color="#f5deb3" emissive="#fff5e1" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[2.5, 1.5, -3]} intensity={0.5} color="#fff5e1" />
    </group>
  );
};

export const VRViewer = () => {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-warm-beige/20 to-desert-sand/20 border-2 border-terracotta/20">
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">تجربة VR - غرفة فاخرة</h3>
            <p className="text-sm text-muted-foreground">VR Experience - Luxury Room</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" title="Rotate">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Fullscreen">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="relative w-full h-[500px] bg-gradient-to-b from-warm-beige/30 to-desert-sand/30">
        <Canvas shadows>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 1.6, 4]} />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={8}
              target={[0, 1.5, -2]}
            />
            <Environment preset="apartment" />
            <HotelRoom />
          </Suspense>
        </Canvas>
        
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
          <p className="text-sm font-medium">استخدم الماوس للتحكم | Use mouse to control</p>
          <p className="text-xs text-muted-foreground">اسحب للدوران • تكبير/تصغير | Drag to rotate • Scroll to zoom</p>
        </div>
      </div>
    </Card>
  );
};
