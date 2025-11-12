import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box } from '@chakra-ui/react';
import * as THREE from 'three';

function AnimatedWave() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;
            const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
            const positions = geometry.attributes.position;

            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const wave1 = Math.sin(x * 0.5 + time * 0.5) * 0.3;
                const wave2 = Math.sin(y * 0.3 + time * 0.3) * 0.2;
                positions.setZ(i, wave1 + wave2);
            }

            positions.needsUpdate = true;
            geometry.computeVertexNormals();
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 4, 0, 0]} position={[0, -2, -5]}>
            <planeGeometry args={[20, 20, 32, 32]} />
            <meshPhysicalMaterial
                color="#14B8A6"
                transparent
                opacity={0.1}
                wireframe
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

export default function WaveBackground() {
    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={0}
            pointerEvents="none"
            opacity={0.6}
        >
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={0.8} />
                <AnimatedWave />
            </Canvas>
        </Box>
    );
}
