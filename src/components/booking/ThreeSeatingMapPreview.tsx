
'use client';

import type { SeatingLayout, SelectedSeatInfo, Zone as LayoutZone, Seat } from '@/lib/types';
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

// Colors
const SELECTED_ZONE_COLOR = 0xff3b30; // Primary Red (used for zone box if it contains selection)
const DEFAULT_ZONE_COLOR = 0xaaaaaa; // Light Grey
const STAGE_COLOR = 0x333333;      // Dark Grey
const SELECTED_SEAT_MODEL_COLOR = 0x22c55e; // Green for selected seat models
const UNSELECTED_SEAT_MODEL_COLOR = 0x666666; // Gray for unselected/available seats

// Seat model properties
const SEAT_MODEL_SCALE_FACTOR = 0.6; // How much of the allocated "cell" a seat model takes up
const SEAT_MODEL_HEIGHT_SCALE = 0.8; // Height of the seat model box relative to zone box height

export default function ThreeSeatingMapPreview({ layout, selectedSeats, className }: ThreeSeatingMapPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const selectedZoneIds = useMemo(() => new Set(selectedSeats.map(seat => seat.zoneId)), [selectedSeats]);

  useEffect(() => {
    if (!mountRef.current || !layout) return;

    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x171717); 

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50, 
      currentMount.clientWidth / currentMount.clientHeight, 
      0.1, 
      1000 
    );
    camera.position.set(0, MAP_PLANE_DEPTH * 0.8, MAP_PLANE_DEPTH * 1.1); 

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9); 
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-10, 15, -10);
    scene.add(directionalLight2);


    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = MAP_PLANE_WIDTH * 1.5;
    controls.maxPolarAngle = Math.PI / 2.1; 
    controls.target.set(0, 0, 0); 
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

      stageMesh.position.x = (parseFloat(left) / 100) * MAP_PLANE_WIDTH - MAP_PLANE_WIDTH / 2 + (parseFloat(width) / 200) * MAP_PLANE_WIDTH - (parseFloat(left) === "50%" ? (parseFloat(width) / 200) * MAP_PLANE_WIDTH : 0) ; // Adjust if left is 50% for true center
      stageMesh.position.z = (parseFloat(top) / 100 + parseFloat(height) / 200) * MAP_PLANE_DEPTH - MAP_PLANE_DEPTH / 2;
      stageMesh.position.y = STAGE_BOX_HEIGHT / 2;
      venueGroup.add(stageMesh);
    }
    
    // Zones and Seat Models
    layout.zones.forEach((zoneData: LayoutZone) => {
      if (!zoneData.mapPosition) return;
      const { top = '0%', left = '0%', width = '10%', height = '10%' } = zoneData.mapPosition;

      const zoneWidth3D = (parseFloat(width) / 100) * MAP_PLANE_WIDTH;
      const zoneDepth3D = (parseFloat(height) / 100) * MAP_PLANE_DEPTH;

      const isSelectedZone = selectedZoneIds.has(zoneData.id);
      const zoneMaterial = new THREE.MeshStandardMaterial({
        color: isSelectedZone ? SELECTED_ZONE_COLOR : DEFAULT_ZONE_COLOR,
        metalness: 0.2,
        roughness: 0.7,
        transparent: true,
        opacity: isSelectedZone ? 0.8 : 0.6
      });
      const zoneGeometry = new THREE.BoxGeometry(zoneWidth3D, ZONE_BOX_HEIGHT, zoneDepth3D);
      const zoneMesh = new THREE.Mesh(zoneGeometry, zoneMaterial);

      zoneMesh.position.x = (parseFloat(left) / 100 + parseFloat(width) / 200) * MAP_PLANE_WIDTH - MAP_PLANE_WIDTH / 2;
      zoneMesh.position.z = (parseFloat(top) / 100 + parseFloat(height) / 200) * MAP_PLANE_DEPTH - MAP_PLANE_DEPTH / 2;
      zoneMesh.position.y = ZONE_BOX_HEIGHT / 2;
      venueGroup.add(zoneMesh);

      // Add ALL seat models for this zone
      if (zoneData.seats) {
        const numRows = zoneData.seats.length;
        const numCols = zoneData.seats[0]?.length || 1;
        
        const cellWidth = zoneWidth3D / numCols;
        const cellDepth = zoneDepth3D / numRows;

        const seatModelVisualWidth = cellWidth * SEAT_MODEL_SCALE_FACTOR;
        const seatModelVisualDepth = cellDepth * SEAT_MODEL_SCALE_FACTOR;
        const seatModelVisualHeight = ZONE_BOX_HEIGHT * SEAT_MODEL_HEIGHT_SCALE;

        zoneData.seats.forEach((row: Seat[], rowIndex: number) => {
          row.forEach((seat: Seat, colIndex: number) => {
            if (seat.aisle) return; // Skip aisle markers

            const isThisSeatSelected = selectedSeats.find(ss => ss.zoneId === zoneData.id && ss.seatId === seat.id);
            
            const seatColor = isThisSeatSelected ? SELECTED_SEAT_MODEL_COLOR : UNSELECTED_SEAT_MODEL_COLOR;
            
            const seatGeometry = new THREE.BoxGeometry(seatModelVisualWidth, seatModelVisualHeight, seatModelVisualDepth);
            const seatMaterial = new THREE.MeshStandardMaterial({ 
              color: seatColor, 
              metalness: 0.1, 
              roughness: 0.8 
            });
            const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);

            // Calculate position relative to the zone's center
            const seatX_local = (colIndex + 0.5) * cellWidth - (zoneWidth3D / 2);
            const seatZ_local = (rowIndex + 0.5) * cellDepth - (zoneDepth3D / 2);
            
            seatMesh.position.set(
              zoneMesh.position.x + seatX_local,
              zoneMesh.position.y + (ZONE_BOX_HEIGHT / 2) + (seatModelVisualHeight / 2), // Sit on top of zone box
              zoneMesh.position.z + seatZ_local
            );
            venueGroup.add(seatMesh);
          });
        });
      }
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
      controls.update(); 
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement.parentNode === currentMount) {
         currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
             if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
             } else if (object.material && typeof (object.material as THREE.Material).dispose === 'function') {
                (object.material as THREE.Material).dispose();
             }
          }
        }
      });
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
    };
  }, [layout, selectedSeats, selectedZoneIds]); 

  return <div ref={mountRef} className={cn("w-full h-[300px] md:h-[400px] rounded-md overflow-hidden border border-border bg-muted/20", className)} data-ai-hint="3d venue map preview seats" />;
}

