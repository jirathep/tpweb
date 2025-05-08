
'use client';

import type { SeatingLayout, SelectedSeatInfo, Zone as LayoutZone } from '@/lib/types';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { cn } from '@/lib/utils';

interface ThreeSeatingMapPreviewProps {
  layout: SeatingLayout;
  selectedSeats: SelectedSeatInfo[];
  className?: string;
}

const MAP_PLANE_WIDTH = 60;
const MAP_PLANE_DEPTH = 45; // Adjusted for typical venue aspect ratios
const ZONE_BOX_HEIGHT = 1;
const STAGE_BOX_HEIGHT = 2.5;

// Colors (consider getting from theme if possible, otherwise hardcode)
const SELECTED_ZONE_COLOR = 0xff3b30; // Primary Red
const DEFAULT_ZONE_COLOR = 0xaaaaaa; // Light Grey
const STAGE_COLOR = 0x333333;      // Dark Grey

export default function ThreeSeatingMapPreview({ layout, selectedSeats, className }: ThreeSeatingMapPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const selectedZoneIds = useMemo(() => new Set(selectedSeats.map(seat => seat.zoneId)), [selectedSeats]);

  useEffect(() => {
    if (!mountRef.current || !layout) return;

    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x171717); // Slightly lighter than pure black, or use card background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50, // FOV
      currentMount.clientWidth / currentMount.clientHeight, // Aspect Ratio
      0.1, // Near
      1000 // Far
    );
    camera.position.set(0, MAP_PLANE_DEPTH * 0.8, MAP_PLANE_DEPTH * 1.1); // Adjusted for better initial view

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = MAP_PLANE_WIDTH * 1.5;
    controls.maxPolarAngle = Math.PI / 2.2; // Prevent looking from below too much
    controls.target.set(0, 0, 0); // Look at the center of the map plane
    controlsRef.current = controls;

    // Venue Group (to center everything)
    const venueGroup = new THREE.Group();
    scene.add(venueGroup);

    // Stage
    if (layout.stagePosition) {
      const { top = '0%', left = '50%', width = '30%', height = '10%' } = layout.stagePosition;
      const stageWidth3D = (parseFloat(width) / 100) * MAP_PLANE_WIDTH;
      const stageDepth3D = (parseFloat(height) / 100) * MAP_PLANE_DEPTH;
      
      const stageGeometry = new THREE.BoxGeometry(stageWidth3D, STAGE_BOX_HEIGHT, stageDepth3D);
      const stageMaterial = new THREE.MeshStandardMaterial({ color: STAGE_COLOR, metalness: 0.3, roughness: 0.6 });
      const stageMesh = new THREE.Mesh(stageGeometry, stageMaterial);

      // Assuming stagePosition.left is center, stagePosition.top is top edge
      stageMesh.position.x = (parseFloat(left) / 100) * MAP_PLANE_WIDTH - MAP_PLANE_WIDTH / 2;
      stageMesh.position.z = (parseFloat(top) / 100 + parseFloat(height) / 200) * MAP_PLANE_DEPTH - MAP_PLANE_DEPTH / 2;
      stageMesh.position.y = STAGE_BOX_HEIGHT / 2;
      venueGroup.add(stageMesh);
    }
    
    // Zones
    layout.zones.forEach((zone: LayoutZone) => {
      if (!zone.mapPosition) return;
      const { top = '0%', left = '0%', width = '10%', height = '10%' } = zone.mapPosition;

      const zoneWidth3D = (parseFloat(width) / 100) * MAP_PLANE_WIDTH;
      const zoneDepth3D = (parseFloat(height) / 100) * MAP_PLANE_DEPTH;

      const zoneGeometry = new THREE.BoxGeometry(zoneWidth3D, ZONE_BOX_HEIGHT, zoneDepth3D);
      const isSelected = selectedZoneIds.has(zone.id);
      const zoneMaterial = new THREE.MeshStandardMaterial({
        color: isSelected ? SELECTED_ZONE_COLOR : DEFAULT_ZONE_COLOR,
        metalness: 0.2,
        roughness: 0.7,
        transparent: true,
        opacity: isSelected ? 0.9 : 0.7
      });
      const zoneMesh = new THREE.Mesh(zoneGeometry, zoneMaterial);

      // Assuming mapPosition.left is left edge, mapPosition.top is top edge
      zoneMesh.position.x = (parseFloat(left) / 100 + parseFloat(width) / 200) * MAP_PLANE_WIDTH - MAP_PLANE_WIDTH / 2;
      zoneMesh.position.z = (parseFloat(top) / 100 + parseFloat(height) / 200) * MAP_PLANE_DEPTH - MAP_PLANE_DEPTH / 2;
      zoneMesh.position.y = ZONE_BOX_HEIGHT / 2;
      venueGroup.add(zoneMesh);
    });

    // Handle Resize
    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // only required if controls.enableDamping or controls.autoRotate are set to true
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
             if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
             } else {
                object.material.dispose();
             }
          }
        }
      });
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
    };
  }, [layout, selectedZoneIds]); // Re-run effect if layout or selected zones change

  return <div ref={mountRef} className={cn("w-full h-[300px] md:h-[400px] rounded-md overflow-hidden", className)} data-ai-hint="3d venue map preview" />;
}
