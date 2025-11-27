'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  useGLTF, 
  PresentationControls,
  Stage,
  Html,
  useProgress
} from '@react-three/drei';
import { motion } from 'framer-motion';
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import * as THREE from 'three';

interface ModelViewerProps {
  modelUrl: string;
  fallbackImage?: string;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 border-4 border-brand-pink/20 border-t-brand-pink rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">
          {progress.toFixed(0)}%
        </span>
      </div>
    </Html>
  );
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <primitive 
      ref={meshRef}
      object={scene} 
      scale={1}
      position={[0, 0, 0]}
    />
  );
}

export function ModelViewer({ modelUrl, fallbackImage }: ModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleResetCamera = () => {
    // Reset camera position through OrbitControls ref
    if (canvasRef.current) {
      // Trigger re-render
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-muted/50 to-muted"
    >
      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        shadows
        className="touch-none"
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <PresentationControls
            global
            zoom={0.8}
            rotation={[0, -Math.PI / 4, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <Stage environment="city" intensity={0.5} shadows={false}>
              <Model url={modelUrl} />
            </Stage>
          </PresentationControls>
          
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={10}
            makeDefault
          />
          
          <Environment preset="city" />
        </Suspense>
      </Canvas>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button
          onClick={handleResetCamera}
          className="p-2 rounded-lg bg-card/90 backdrop-blur-sm hover:bg-brand-pink text-foreground hover:text-white transition-colors shadow-lg border border-border"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          className="p-2 rounded-lg bg-card/90 backdrop-blur-sm hover:bg-brand-pink text-foreground hover:text-white transition-colors shadow-lg border border-border"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          className="p-2 rounded-lg bg-card/90 backdrop-blur-sm hover:bg-brand-pink text-foreground hover:text-white transition-colors shadow-lg border border-border"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          className="p-2 rounded-lg bg-card/90 backdrop-blur-sm hover:bg-brand-pink text-foreground hover:text-white transition-colors shadow-lg border border-border"
          title="Fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Hint */}
      <div className="absolute top-4 left-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
        Drag to rotate • Scroll to zoom
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-brand-pink/20 blur-3xl" />
      </div>
    </motion.div>
  );
}

// Fallback component when 3D isn't available
export function ModelViewerFallback({ image }: { image: string }) {
  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted">
      <img
        src={image}
        alt="Product"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <p className="text-white text-sm">3D view not available</p>
      </div>
    </div>
  );
}

