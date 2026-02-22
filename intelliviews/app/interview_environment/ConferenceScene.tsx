"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  Text,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";

/* ════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════ */
export interface InterviewerDef {
  id: string;
  name: string;
  role: string;
  accent: string;
  seatX: number;
  skinTone: string;
  hairColor: string;
  hairStyle: "short" | "medium" | "long";
  shirtColor: string;
}

interface SceneProps {
  interviewers: InterviewerDef[];
  onSelect: (id: string) => void;
}

/* ════════════════════════════════════════════════════════════
   CHARACTER — clean, simple, no facial expressions
   ════════════════════════════════════════════════════════════ */
function Character({
  position,
  skinTone,
  hairColor,
  hairStyle,
  shirtColor,
  onClick,
}: {
  position: [number, number, number];
  skinTone: string;
  hairColor: string;
  hairStyle: "short" | "medium" | "long";
  shirtColor: string;
  onClick: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y =
      position[1] + Math.sin(t * 0.8 + position[0] * 2) * 0.003;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Head */}
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshStandardMaterial color={skinTone} roughness={0.5} />
      </mesh>

      {/* Hair */}
      <HairMesh hairColor={hairColor} hairStyle={hairStyle} />

      {/* Ears */}
      {[-0.155, 0.155].map((x) => (
        <mesh key={x} position={[x, 1.42, 0]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color={skinTone} roughness={0.55} />
        </mesh>
      ))}

      {/* Eyes */}
      {[-0.05, 0.05].map((x) => (
        <mesh key={x} position={[x, 1.45, 0.145]}>
          <sphereGeometry args={[0.015, 10, 10]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}

      {/* Mouth */}
      <mesh position={[0, 1.35, 0.14]}>
        <capsuleGeometry args={[0.006, 0.03, 6, 8]} />
        <meshStandardMaterial color="#b05050" roughness={0.7} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.1, 10]} />
        <meshStandardMaterial color={skinTone} roughness={0.55} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.26, 10, 14]} />
        <meshStandardMaterial color={shirtColor} roughness={0.65} />
      </mesh>

      {/* Arms */}
      {[
        { x: -0.24, rz: 0.2 },
        { x: 0.24, rz: -0.2 },
      ].map(({ x, rz }) => (
        <mesh key={x} position={[x, 0.97, 0]} rotation={[0, 0, rz]} castShadow>
          <capsuleGeometry args={[0.045, 0.18, 8, 10]} />
          <meshStandardMaterial color={shirtColor} roughness={0.65} />
        </mesh>
      ))}
      {[
        { x: -0.28, rx: 1.1, rz: 0.1 },
        { x: 0.28, rx: 1.1, rz: -0.1 },
      ].map(({ x, rx, rz }) => (
        <mesh key={x} position={[x, 0.8, 0.18]} rotation={[rx, 0, rz]}>
          <capsuleGeometry args={[0.038, 0.18, 8, 10]} />
          <meshStandardMaterial color={shirtColor} roughness={0.65} />
        </mesh>
      ))}
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.76, 0.34]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color={skinTone} roughness={0.55} />
        </mesh>
      ))}

      {/* Legs (seated) */}
      {[-0.09, 0.09].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.63, 0.12]} rotation={[1.5, 0, 0]}>
            <capsuleGeometry args={[0.055, 0.18, 8, 10]} />
            <meshStandardMaterial color="#2c3040" roughness={0.8} />
          </mesh>
          <mesh position={[x, 0.37, 0.3]} rotation={[0.1, 0, 0]}>
            <capsuleGeometry args={[0.045, 0.2, 8, 10]} />
            <meshStandardMaterial color="#2c3040" roughness={0.8} />
          </mesh>
          <mesh position={[x, 0.09, 0.37]}>
            <capsuleGeometry args={[0.035, 0.07, 6, 8]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.5} />
          </mesh>
        </group>
      ))}

    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   HAIR
   ════════════════════════════════════════════════════════════ */
function HairMesh({
  hairColor,
  hairStyle,
}: {
  hairColor: string;
  hairStyle: "short" | "medium" | "long";
}) {
  return (
    <group position={[0, 1.42, 0]}>
      <mesh position={[0, 0.05, -0.01]}>
        <sphereGeometry
          args={[0.165, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.52]}
        />
        <meshStandardMaterial color={hairColor} roughness={0.85} />
      </mesh>

      {hairStyle === "medium" && (
        <mesh position={[0, -0.03, -0.1]}>
          <sphereGeometry args={[0.14, 14, 10]} />
          <meshStandardMaterial color={hairColor} roughness={0.85} />
        </mesh>
      )}

      {hairStyle === "long" && (
        <>
          <mesh position={[0, -0.05, -0.1]}>
            <sphereGeometry args={[0.15, 14, 10]} />
            <meshStandardMaterial color={hairColor} roughness={0.85} />
          </mesh>
          {[-0.12, 0.12].map((x) => (
            <mesh key={x} position={[x, -0.15, -0.03]}>
              <capsuleGeometry args={[0.04, 0.14, 6, 8]} />
              <meshStandardMaterial color={hairColor} roughness={0.85} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   ROOM — clean, bright, minimal
   ════════════════════════════════════════════════════════════ */
function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#d4c8b0" roughness={0.7} />
      </mesh>

      <mesh position={[0, 2.5, -4.5]}>
        <planeGeometry args={[14, 5]} />
        <meshStandardMaterial color="#f5f2ed" roughness={0.95} />
      </mesh>

      <mesh position={[-7, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#f2eee8" roughness={0.95} />
      </mesh>
      <mesh position={[7, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#f2eee8" roughness={0.95} />
      </mesh>

      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#faf9f7" roughness={1} />
      </mesh>

      {/* Windows */}
      {[-3.5, 3.5].map((x) => (
        <group key={x}>
          <mesh position={[x, 3.2, -4.44]}>
            <planeGeometry args={[2.0, 2.2]} />
            <meshStandardMaterial
              color="#daeaf2"
              roughness={0.1}
              emissive="#e8f2f8"
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh position={[x, 3.2, -4.43]}>
            <planeGeometry args={[2.15, 2.35]} />
            <meshStandardMaterial color="#c0b090" roughness={0.5} />
          </mesh>
          <mesh position={[x, 3.2, -4.42]}>
            <boxGeometry args={[0.02, 2.2, 0.015]} />
            <meshStandardMaterial color="#c0b090" />
          </mesh>
          <mesh position={[x, 3.2, -4.42]}>
            <boxGeometry args={[2.0, 0.02, 0.015]} />
            <meshStandardMaterial color="#c0b090" />
          </mesh>
          <pointLight position={[x, 3.2, -3.8]} intensity={12} color="#fff8e8" distance={7} />
        </group>
      ))}

      <Text position={[0, 3.8, -4.44]} fontSize={0.18} color="#5b7a6a" anchorX="center" anchorY="middle">
        INTELLIVIEW
      </Text>
      <Text position={[0, 3.55, -4.44]} fontSize={0.06} color="#a0b0a5" anchorX="center" anchorY="middle">
        Where Great Careers Begin
      </Text>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   TABLE
   ════════════════════════════════════════════════════════════ */
function ConferenceTable() {
  return (
    <group>
      <RoundedBox args={[4.2, 0.07, 1.8]} radius={0.035} position={[0, 0.75, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#7a5c38" roughness={0.35} />
      </RoundedBox>

      {(
        [
          [-1.7, 0.375, -0.65],
          [1.7, 0.375, -0.65],
          [-1.7, 0.375, 0.65],
          [1.7, 0.375, 0.65],
        ] as [number, number, number][]
      ).map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.75, 10]} />
          <meshStandardMaterial color="#5a4028" roughness={0.5} />
        </mesh>
      ))}

      {[-0.8, 0.3, 1.0].map((x, i) => (
        <RoundedBox
          key={i}
          args={[0.2, 0.002, 0.28]}
          radius={0.002}
          position={[x, 0.79, -0.3]}
          rotation={[0, (i - 1) * 0.04, 0]}
        >
          <meshStandardMaterial color="#fff" roughness={0.9} />
        </RoundedBox>
      ))}

      <group position={[0, 0.79, 0.35]} rotation={[0, Math.PI, 0]}>
        <RoundedBox args={[0.32, 0.01, 0.22]} radius={0.004}>
          <meshStandardMaterial color="#bbb" metalness={0.85} roughness={0.15} />
        </RoundedBox>
        <RoundedBox
          args={[0.31, 0.2, 0.004]}
          radius={0.004}
          position={[0, 0.11, -0.11]}
          rotation={[-0.25, 0, 0]}
        >
          <meshStandardMaterial color="#222" metalness={0.3} roughness={0.3} />
        </RoundedBox>
      </group>
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   CHAIR
   ════════════════════════════════════════════════════════════ */
function Chair({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[0.42, 0.05, 0.42]} radius={0.02} position={[0, 0.45, 0]}>
        <meshStandardMaterial color="#3a3a3a" roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.4, 0.45, 0.035]} radius={0.02} position={[0, 0.72, -0.19]}>
        <meshStandardMaterial color="#3a3a3a" roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.44, 8]} />
        <meshStandardMaterial color="#666" metalness={0.85} roughness={0.15} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * 0.2, 0.03, Math.cos(a) * 0.2]}
            rotation={[0, -a, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.012, 0.012, 0.2, 6]} />
            <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   LIGHTING
   ════════════════════════════════════════════════════════════ */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.8} color="#fff8f0" />
      <directionalLight
        position={[0, 4, 3]}
        intensity={2.5}
        color="#fff8f0"
        castShadow
        shadow-mapSize={1024}
      />
      <directionalLight position={[-3, 4, -2]} intensity={1.8} color="#fffaf0" />
      <directionalLight position={[3, 4, -2]} intensity={1.8} color="#fffaf0" />
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   CAMERA RIG
   ════════════════════════════════════════════════════════════ */
function CameraRig() {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      Math.sin(t * 0.08) * 0.1,
      0.012,
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      1.6 + Math.sin(t * 0.12) * 0.015,
      0.012,
    );
    camera.lookAt(0, 1.1, -0.5);
  });

  return null;
}

/* ════════════════════════════════════════════════════════════
   MAIN SCENE
   ════════════════════════════════════════════════════════════ */
export default function ConferenceScene({
  interviewers,
  onSelect,
}: SceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 1.6, 3.0], fov: 52 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
        }}
      >
        <color attach="background" args={["#eae4d8"]} />
        <CameraRig />
        <Lighting />
        <Environment preset="apartment" background={false} environmentIntensity={0.5} />

        <Room />
        <ConferenceTable />

        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.25}
          scale={10}
          blur={2}
          far={4}
          color="#8a7a6a"
        />

        <Chair position={[-1.6, 0, -0.85]} rotation={[0, Math.PI, 0]} />
        <Chair position={[0, 0, -0.85]} rotation={[0, Math.PI, 0]} />
        <Chair position={[1.6, 0, -0.85]} rotation={[0, Math.PI, 0]} />
        <Chair position={[0, 0, 1.15]} rotation={[0, 0, 0]} />

        {interviewers.map((p) => (
          <Character
            key={p.id}
            position={[p.seatX, 0, -0.82]}
            skinTone={p.skinTone}
            hairColor={p.hairColor}
            hairStyle={p.hairStyle}
            shirtColor={p.shirtColor}
            onClick={() => onSelect(p.id)}
          />
        ))}
      </Canvas>
    </div>
  );
}
