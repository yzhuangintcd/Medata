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

      {/* Arms - hanging by the sides */}
      {[
        { x: -0.18, rz: -0.1 },
        { x: 0.18, rz: 0.1 },
      ].map(({ x, rz }) => (
        <mesh key={x} position={[x, 0.97, 0]} rotation={[0, 0, rz]} castShadow>
          <capsuleGeometry args={[0.045, 0.3, 8, 10]} />
          <meshStandardMaterial color={shirtColor} roughness={0.65} />
        </mesh>
      ))}
      {/* Hands */}
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.77, 0]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color={skinTone} roughness={0.55} />
        </mesh>
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
   ROOM COMPONENTS
   ════════════════════════════════════════════════════════════ */

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[14, 10]} />
      <meshStandardMaterial color="#8B7355" roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

function BackWall() {
  return (
    <group>
      {/* Main wall - solid white background */}
      <mesh position={[0, 2.5, -4.5]}>
        <planeGeometry args={[14, 5]} />
        <meshStandardMaterial color="#f5f2ed" roughness={0.95} />
      </mesh>

      {/* Windows on back wall */}
      {[
        { x: -4.5 },  // Left window
        { x: 4.5 }    // Right window
      ].map(({ x }) => (
        <group key={x}>
          {/* Sky background */}
          <mesh position={[x, 3.2, -4.48]}>
            <planeGeometry args={[2.1, 2.3]} />
            <meshStandardMaterial color="#87CEEB" roughness={1} />
          </mesh>

          {/* Frame border - top */}
          <mesh position={[x, 4.35, -4.42]}>
            <boxGeometry args={[2.2, 0.1, 0.1]} />
            <meshStandardMaterial color="#8a7a60" roughness={0.4} metalness={0.05} />
          </mesh>

          {/* Frame border - bottom */}
          <mesh position={[x, 2.05, -4.42]}>
            <boxGeometry args={[2.2, 0.1, 0.1]} />
            <meshStandardMaterial color="#8a7a60" roughness={0.4} metalness={0.05} />
          </mesh>

          {/* Frame border - left */}
          <mesh position={[x - 1.05, 3.2, -4.42]}>
            <boxGeometry args={[0.1, 2.3, 0.1]} />
            <meshStandardMaterial color="#8a7a60" roughness={0.4} metalness={0.05} />
          </mesh>

          {/* Frame border - right */}
          <mesh position={[x + 1.05, 3.2, -4.42]}>
            <boxGeometry args={[0.1, 2.3, 0.1]} />
            <meshStandardMaterial color="#8a7a60" roughness={0.4} metalness={0.05} />
          </mesh>

          {/* Vertical mullion - center */}
          <mesh position={[x, 3.2, -4.4]}>
            <boxGeometry args={[0.05, 2.3, 0.06]} />
            <meshStandardMaterial color="#8a7a60" roughness={0.4} metalness={0.05} />
          </mesh>

          {/* Horizontal mullion - center */}
          <mesh position={[x, 3.2, -4.4]}>
            <boxGeometry args={[2.1, 0.05, 0.06]} />
            <meshStandardMaterial color="#8a7a60" roughness={0.4} metalness={0.05} />
          </mesh>

          {/* Window sill */}
          <mesh position={[x, 2.0, -4.38]}>
            <boxGeometry args={[2.4, 0.1, 0.18]} />
            <meshStandardMaterial color="#c0b090" roughness={0.5} />
          </mesh>

          {/* Natural light */}
          <pointLight position={[x, 3.2, -4.1]} intensity={12} color="#fff8e8" distance={8} />
        </group>
      ))}
    </group>
  );
}

function LeftWall() {
  return (
    <mesh position={[-7, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[10, 5]} />
      <meshStandardMaterial color="#f2eee8" roughness={0.95} />
    </mesh>
  );
}

function RightWall() {
  return (
    <mesh position={[7, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[10, 5]} />
      <meshStandardMaterial color="#f2eee8" roughness={0.95} />
    </mesh>
  );
}

function Ceiling() {
  return (
    <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[14, 10]} />
      <meshStandardMaterial color="#faf9f7" roughness={1} />
    </mesh>
  );
}


function Room() {
  return (
    <group>
      <Floor />
      <BackWall />
      <LeftWall />
      <RightWall />
      <Ceiling />
    </group>
  );
}

/* ════════════════════════════════════════════════════════════
   TABLE
   ════════════════════════════════════════════════════════════ */
function ConferenceTable() {
  return (
    <group>
      {/* Oval table top */}
      <mesh position={[0, 0.75, 0]} scale={[1, 1, 0.43]} castShadow receiveShadow>
        <cylinderGeometry args={[2.1, 2.1, 0.07, 64]} />
        <meshStandardMaterial color="#7a5c38" roughness={0.35} />
      </mesh>

      {(
        [
          [-1.4, 0.375, -0.5],
          [1.4, 0.375, -0.5],
          [-1.4, 0.375, 0.5],
          [1.4, 0.375, 0.5],
        ] as [number, number, number][]
      ).map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.75, 10]} />
          <meshStandardMaterial color="#5a4028" roughness={0.5} />
        </mesh>
      ))}

      {[-1.6, 0, 1.6].map((x, i) => (
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
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
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
        <color attach="background" args={["#18181b"]} />
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

        <Chair position={[-1.6, 0, -1.1]} rotation={[0, 0, 0]} scale={1.25} />
        <Chair position={[0, 0, -1.1]} rotation={[0, 0, 0]} scale={1.25} />
        <Chair position={[1.6, 0, -1.1]} rotation={[0, 0, 0]} scale={1.25} />
        <Chair position={[0, 0, 1.3]} rotation={[0, Math.PI, 0]} />

        {/* Interviewers */}
        {interviewers.map((p) => {
          // Rotate interviewers to face the candidate
          const rotation = p.seatX === -1.6 ? 0.3 : p.seatX === 1.6 ? -0.3 : 0;
          return (
            <group key={p.id} position={[p.seatX, -0.15, -1.15]} rotation={[0, rotation, 0]}>
              <Character
                position={[0, 0, 0]}
                skinTone={p.skinTone}
                hairColor={p.hairColor}
                hairStyle={p.hairStyle}
                shirtColor={p.shirtColor}
                onClick={() => {}}
              />
            </group>
          );
        })}

        {/* Candidate */}
        <group position={[0, -0.25, 1.35]} rotation={[0, Math.PI, 0]}>
          <Character
            position={[0, 0, 0]}
            skinTone="#f4c4a0"
            hairColor="#3a2618"
            hairStyle="short"
            shirtColor="#4a5568"
            onClick={() => {}}
          />
        </group>
      </Canvas>
    </div>
  );
}
