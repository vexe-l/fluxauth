import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box } from '@chakra-ui/react';
import * as THREE from 'three';

function FloatingCard() {
    const meshRef = useRef<THREE.Mesh>(null);

    // Subtle animation
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
            meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    const geometry = useMemo(() => new THREE.BoxGeometry(4, 3, 0.2), []);
    const material = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: 0xD65A31,
                transparent: true,
                opacity: 0.12,
                roughness: 0.1,
                metalness: 0.1,
                clearcoat: 1,
                clearcoatRoughness: 0.1
            }),
        []
    );

    return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

export default function GlassmorphismBackground() {
    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={0}
            pointerEvents="none"
        >
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <FloatingCard />
            </Canvas>
        </Box>
    );
}
