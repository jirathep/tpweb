
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
const MAP_PLANE_DEPTH = 45; 
const ZONE_BOX_HEIGHT = 0.5; // Reduced zone height to make chairs more prominent
const STAGE_BOX_HEIGHT = 1.5; // Stage height, can be different from zone

// Colors
const SELECTED_ZONE_COLOR = 0xff3b30; 
const DEFAULT_ZONE_COLOR = 0xaaaaaa; 
const STAGE_COLOR = 0x333333;      
const SELECTED_SEAT_MODEL_COLOR = 0x22c55e; 
const UNSELECTED_SEAT_MODEL_COLOR = 0x666666; 

// Seat model properties
const SEAT_MODEL_SCALE_FACTOR = 0.7; // How much of the allocated "cell" a seat model takes up
const CHAIR_TOTAL_HEIGHT_SCALE = 1.5; // Overall height of the chair model relative to ZONE_BOX_HEIGHT

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
    camera.position.set(0, MAP_PLANE_DEPTH * 0.7, MAP_PLANE_DEPTH * 1.0); 

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); 
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(15, 20, 10);
    scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-15, 20, -10);
    scene.add(directionalLight2);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = MAP_PLANE_WIDTH * 1.5;
    controls.maxPolarAngle = Math.PI / 2.05; 
    controls.target.set(0, ZONE_BOX_HEIGHT, 0); // Target slightly above origin for better default view
    controlsRef.current = controls;

    // Venue Group (to center everything)
    const venueGroup = new THREE.Group();
    scene.add(venueGroup);

    // Stage Model
    if (layout.stagePosition) {
      const { top = '0%', left = '50%', width = '30%', height = '10%' } = layout.stagePosition;
      const stageWidth3D = (parseFloat(width) / 100) * MAP_PLANE_WIDTH;
      const stageDepth3D = (parseFloat(height) / 100) * MAP_PLANE_DEPTH;
      
      const stageGeometry = new THREE.BoxGeometry(stageWidth3D, STAGE_BOX_HEIGHT, stageDepth3D);
      const stageMaterial = new THREE.MeshStandardMaterial({ color: STAGE_COLOR, metalness: 0.3, roughness: 0.6 });
      const stageMesh = new THREE.Mesh(stageGeometry, stageMaterial);

      // Calculate stage position (centering logic might need adjustment based on specific 'left' values)
      let stagePosX = (parseFloat(left) / 100) * MAP_PLANE_WIDTH - MAP_PLANE_WIDTH / 2;
      if (left.endsWith('%') && parseFloat(left) !== 0 && parseFloat(left) !== 100) {
         stagePosX += stageWidth3D / 2; // Adjust for percentage-based left positioning if not edge
         if (left === '50%') stagePosX -= stageWidth3D /2; // specific correction if centered with 50%
      } else if (!left.endsWith('%') && parseFloat(left) === 0 ) { // if left is '0' (not '0%')
         stagePosX += stageWidth3D / 2;
      }


      stageMesh.position.x = stagePosX;
      stageMesh.position.z = (parseFloat(top) / 100 + parseFloat(height) / 200) * MAP_PLANE_DEPTH - MAP_PLANE_DEPTH / 2;
      stageMesh.position.y = STAGE_BOX_HEIGHT / 2; // Place bottom of stage at y=0
      venueGroup.add(stageMesh);
    }
    
    // Zones and Chair Models
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
        opacity: isSelectedZone ? 0.6 : 0.4 // Slightly more transparent
      });
      const zoneGeometry = new THREE.BoxGeometry(zoneWidth3D, ZONE_BOX_HEIGHT, zoneDepth3D);
      const zoneMesh = new THREE.Mesh(zoneGeometry, zoneMaterial);

      zoneMesh.position.x = (parseFloat(left) / 100 + parseFloat(width) / 200) * MAP_PLANE_WIDTH - MAP_PLANE_WIDTH / 2;
      zoneMesh.position.z = (parseFloat(top) / 100 + parseFloat(height) / 200) * MAP_PLANE_DEPTH - MAP_PLANE_DEPTH / 2;
      zoneMesh.position.y = ZONE_BOX_HEIGHT / 2; // Place bottom of zone at y=0
      venueGroup.add(zoneMesh);

      if (zoneData.seats) {
        const numRows = zoneData.seats.length;
        const numCols = zoneData.seats[0]?.length || 1;
        
        const cellWidth = zoneWidth3D / numCols;
        const cellDepth = zoneDepth3D / numRows;

        // Chair model dimensions
        const chairCellWidth = cellWidth * SEAT_MODEL_SCALE_FACTOR;
        const chairCellDepth = cellDepth * SEAT_MODEL_SCALE_FACTOR;
        const chairTotalHeight = ZONE_BOX_HEIGHT * CHAIR_TOTAL_HEIGHT_SCALE;

        const seatBaseHeight = chairTotalHeight * 0.35;
        const seatBackHeight = chairTotalHeight * 0.65;
        const seatBackThickness = chairCellDepth * 0.15;


        zoneData.seats.forEach((row: Seat[], rowIndex: number) => {
          row.forEach((seat: Seat, colIndex: number) => {
            if (seat.aisle) return; 

            const isThisSeatSelected = selectedSeats.find(ss => ss.zoneId === zoneData.id && ss.seatId === seat.id);
            const chairColor = isThisSeatSelected ? SELECTED_SEAT_MODEL_COLOR : UNSELECTED_SEAT_MODEL_COLOR;
            
            const chairGroup = new THREE.Group();

            // Seat Base
            const seatBaseGeo = new THREE.BoxGeometry(chairCellWidth, seatBaseHeight, chairCellDepth);
            const seatMaterial = new THREE.MeshStandardMaterial({ color: chairColor, metalness: 0.1, roughness: 0.8 });
            const seatBaseMesh = new THREE.Mesh(seatBaseGeo, seatMaterial);
            seatBaseMesh.position.y = seatBaseHeight / 2; // Relative to chairGroup origin
            chairGroup.add(seatBaseMesh);

            // Seat Back
            const seatBackGeo = new THREE.BoxGeometry(chairCellWidth, seatBackHeight, seatBackThickness);
            const seatBackMesh = new THREE.Mesh(seatBackGeo, seatMaterial);
            seatBackMesh.position.y = seatBaseHeight + (seatBackHeight / 2); // Position on top of base
            seatBackMesh.position.z = -(chairCellDepth / 2) + (seatBackThickness / 2); // Position at the back of the base
            chairGroup.add(seatBackMesh);
            
            // Calculate position relative to the zone's center, then add zone's world position
            const chairX_local = (colIndex + 0.5) * cellWidth - (zoneWidth3D / 2);
            const chairZ_local = (rowIndex + 0.5) * cellDepth - (zoneDepth3D / 2);
            
            chairGroup.position.set(
              zoneMesh.position.x + chairX_local,
              zoneMesh.position.y + (ZONE_BOX_HEIGHT / 2), // Bottom of chair base sits on top of zone box
              zoneMesh.position.z + chairZ_local
            );
            venueGroup.add(chairGroup);
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
         if (object instanceof THREE.Group) {
          // Dispose children of groups as well
          object.children.forEach(child => {
             if (child instanceof THREE.Mesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                   if (Array.isArray(child.material)) {
                      child.material.forEach(material => material.dispose());
                   } else if (child.material && typeof (child.material as THREE.Material).dispose === 'function') {
                      (child.material as THREE.Material).dispose();
                   }
                }
             }
          });
        }
      });
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
    };
  // IMPORTANT: Add selectedZoneIds to dependency array if zone appearance depends on it directly (e.g. color)
  // and that appearance is determined in this useEffect.
  }, [layout, selectedSeats, selectedZoneIds]); 


  return <div ref={mountRef} className={cn("w-full h-[300px] md:h-[400px] rounded-md overflow-hidden border border-border bg-muted/20", className)} data-ai-hint="3d venue map preview seats stage" />;
}

