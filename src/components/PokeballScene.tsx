import { OrbitControls, ContactShadows, Float } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

type PokeballSceneProps = {
  accentColor: string;
  isOpen: boolean;
  autoRotate: boolean;
};

type PokeballModelProps = PokeballSceneProps;

function PokeballModel({ accentColor, isOpen, autoRotate }: PokeballModelProps) {
  const model = useRef<Group>(null);
  const topHalf = useRef<Group>(null);
  const bottomHalf = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!model.current || !topHalf.current || !bottomHalf.current) return;
    const targetOffset = isOpen ? 0.48 : 0;
    const blend = 1 - Math.exp(-delta * 7);
    topHalf.current.position.y += (targetOffset - topHalf.current.position.y) * blend;
    bottomHalf.current.position.y += (-targetOffset - bottomHalf.current.position.y) * blend;
    if (autoRotate) model.current.rotation.y += delta * 0.45;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.2}>
      <group ref={model} rotation={[0.1, -0.45, 0]}>
        <group ref={topHalf}>
          <mesh castShadow>
            <sphereGeometry args={[1.35, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={accentColor} roughness={0.28} metalness={0.18} />
          </mesh>
        </group>
        <group ref={bottomHalf}>
          <mesh castShadow>
            <sphereGeometry args={[1.35, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.08} />
          </mesh>
        </group>

        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[1.19, 0.16, 16, 64]} />
          <meshStandardMaterial color="#111827" roughness={0.22} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 1.27]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.37, 0.37, 0.16, 40]} />
          <meshStandardMaterial color="#111827" metalness={0.55} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 1.37]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 40]} />
          <meshStandardMaterial color={isOpen ? '#fef08a' : '#f8fafc'} emissive={isOpen ? '#facc15' : '#000000'} emissiveIntensity={isOpen ? 1.8 : 0} />
        </mesh>
        {isOpen && <pointLight position={[0, 0.35, 0]} intensity={2.5} color="#fde047" distance={5} />}
      </group>
    </Float>
  );
}

export function PokeballScene({ accentColor, isOpen, autoRotate }: PokeballSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 5.2], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      shadows
    >
      <color attach="background" args={['#09111f']} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 5, 4]} intensity={3.2} castShadow shadow-mapSize={[512, 512]} />
      <pointLight position={[-3, 1, 2]} intensity={2} color="#818cf8" />
      <PokeballModel accentColor={accentColor} isOpen={isOpen} autoRotate={autoRotate} />
      <ContactShadows position={[0, -1.75, 0]} opacity={0.45} scale={6} blur={2.5} far={4} />
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3.8}
        maxDistance={7}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI * 0.7}
      />
    </Canvas>
  );
}
