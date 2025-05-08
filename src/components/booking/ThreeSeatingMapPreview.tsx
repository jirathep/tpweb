
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
const ZONE_BOX_HEIGHT = 0.5; 
const STAGE_BOX_HEIGHT = 1.5; 

// Colors
const SELECTED_ZONE_COLOR = 0xff3b30; 
const DEFAULT_ZONE_COLOR = 0xaaaaaa; 
const STAGE_COLOR = 0x333333;      
const SELECTED_SEAT_MODEL_COLOR = 0x22c55e; 
const UNSELECTED_SEAT_MODEL_COLOR = 0x666666; 

// Seat model properties
const SEAT_MODEL_SCALE_FACTOR = 0.7; 
const CHAIR_TOTAL_HEIGHT_SCALE = 1.5; 

// Function to create text sprite
function createTextSprite(text: string, config: { fontSize?: number; textColor?: string; fontFamily?: string; padding?: number; rectColor?: string, scaleToWidth?: number, scaleToHeight?: number }) {
  const {
    fontSize = 64, // Increased font size for better resolution on texture
    textColor = 'rgba(255, 255, 255, 1)', // White text
    fontFamily = 'Arial',
    padding = 10,
    rectColor = 'rgba(0, 0, 0, 0.0)', // Transparent background by default
    scaleToWidth = 10, // Default width for the sprite in 3D scene
    scaleToHeight = 2.5 // Default height for the sprite in 3D scene
  } = config;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.font = `Bold ${fontSize}px ${fontFamily}`;
  const textMetrics = context.measureText(text);
  
  canvas.width = textMetrics.width + padding * 2;
  canvas.height = fontSize + padding * 2; // Adjusted for better vertical centering

  // Background (optional)
  context.fillStyle = rectColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Text
  context.font = `Bold ${fontSize}px ${fontFamily}`; // Re-set font after canvas resize
  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  
  // Scale sprite to desired dimensions in the scene
  sprite.scale.set(scaleToWidth, scaleToHeight, 1);

  return sprite;
}


export default function ThreeSeatingMapPreview({ layout, selectedSeats, className }: ThreeSeatingMapPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const stageMeshRef = useRef<THREE.Mesh | null>(null);
  const stageTextSpriteRef = useRef<THREE.Sprite | null>(null);


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
    controls.target.set(0, ZONE_BOX_HEIGHT, 0); 
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

      let stagePosX = (parseFloat(left) / 100) * MAP_PLANE_WIDTH - MAP_PLANE_WIDTH / 2;
      if (left.endsWith('%') && parseFloat(left) !== 0 && parseFloat(left) !== 100) {
         stagePosX += stageWidth3D / 2;
         if (left === '50%') stagePosX -= stageWidth3D /2; 
      } else if (!left.endsWith('%') && parseFloat(left) === 0 ) {
         stagePosX += stageWidth3D / 2;
      }

      stageMesh.position.x = stagePosX;
      stageMesh.position.z = (parseFloat(top) / 100 + parseFloat(height) / 200) * MAP_PLANE_DEPTH - MAP_PLANE_DEPTH / 2;
      stageMesh.position.y = STAGE_BOX_HEIGHT / 2; 
      venueGroup.add(stageMesh);
      stageMeshRef.current = stageMesh;

      // Add "STAGE" text sprite
      const stageTextSprite = createTextSprite("STAGE", {
        fontSize: 48, 
        textColor: 'rgba(255,255,255,0.9)',
        fontFamily: 'Geist, Arial, sans-serif',
        scaleToWidth: stageWidth3D * 0.6, // Scale text relative to stage width
        scaleToHeight: STAGE_BOX_HEIGHT * 0.8
      });
      if (stageTextSprite) {
        stageTextSprite.position.set(
          stageMesh.position.x,
          stageMesh.position.y + STAGE_BOX_HEIGHT / 2 + 0.2, // Slightly above the stage
          stageMesh.position.z
        );
        venueGroup.add(stageTextSprite);
        stageTextSpriteRef.current = stageTextSprite;
      }
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
        opacity: isSelectedZone ? 0.6 : 0.4 
      });
      const zoneGeometry = new THREE.BoxGeometry(zoneWidth3D, ZONE_BOX_HEIGHT, zoneDepth3D);
      const zoneMesh = new THREE.Mesh(zoneGeometry, zoneMaterial);

      zoneMesh.position.x = (parseFloat(left) / 100 + parseFloat(width) / 200) * MAP_PLANE_WIDTH - MAP_PLANE_WIDTH / 2;
      zoneMesh.position.z = (parseFloat(top) / 100 + parseFloat(height) / 200) * MAP_PLANE_DEPTH - MAP_PLANE_DEPTH / 2;
      zoneMesh.position.y = ZONE_BOX_HEIGHT / 2; 
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

        const legThickness = Math.min(chairCellWidth, chairCellDepth) * 0.08;
        const legHeightActual = seatBaseHeight * 0.9; // Height of the leg itself

        zoneData.seats.forEach((row: Seat[], rowIndex: number) => {
          row.forEach((seat: Seat, colIndex: number) => {
            if (seat.aisle) return; 

            const isThisSeatSelected = selectedSeats.find(ss => ss.zoneId === zoneData.id && ss.seatId === seat.id);
            const chairColor = isThisSeatSelected ? SELECTED_SEAT_MODEL_COLOR : UNSELECTED_SEAT_MODEL_COLOR;
            
            const chairGroup = new THREE.Group();
            const seatMaterial = new THREE.MeshStandardMaterial({ color: chairColor, metalness: 0.1, roughness: 0.8 });

            // Seat Base
            const seatBaseGeo = new THREE.BoxGeometry(chairCellWidth, seatBaseHeight, chairCellDepth);
            const seatBaseMesh = new THREE.Mesh(seatBaseGeo, seatMaterial);
            seatBaseMesh.position.y = legHeightActual + seatBaseHeight / 2;
            chairGroup.add(seatBaseMesh);

            // Seat Back
            const seatBackGeo = new THREE.BoxGeometry(chairCellWidth, seatBackHeight, seatBackThickness);
            const seatBackMesh = new THREE.Mesh(seatBackGeo, seatMaterial);
            seatBackMesh.position.y = legHeightActual + seatBaseHeight + seatBackHeight / 2;
            seatBackMesh.position.z = -(chairCellDepth / 2) + (seatBackThickness / 2);
            chairGroup.add(seatBackMesh);
            
            // Legs
            const legGeo = new THREE.BoxGeometry(legThickness, legHeightActual, legThickness);
            const legPositions = [
              { x: -chairCellWidth / 2 + legThickness / 2, z: chairCellDepth / 2 - legThickness / 2 }, // Front-left
              { x: chairCellWidth / 2 - legThickness / 2, z: chairCellDepth / 2 - legThickness / 2 },  // Front-right
              { x: -chairCellWidth / 2 + legThickness / 2, z: -chairCellDepth / 2 + legThickness / 2 },// Back-left
              { x: chairCellWidth / 2 - legThickness / 2, z: -chairCellDepth / 2 + legThickness / 2 }  // Back-right
            ];

            legPositions.forEach(pos => {
              const legMesh = new THREE.Mesh(legGeo, seatMaterial); // Use same material for legs
              legMesh.position.set(pos.x, legHeightActual / 2, pos.z);
              chairGroup.add(legMesh);
            });
            
            const chairX_local = (colIndex + 0.5) * cellWidth - (zoneWidth3D / 2);
            const chairZ_local = (rowIndex + 0.5) * cellDepth - (zoneDepth3D / 2);
            
            chairGroup.position.set(
              zoneMesh.position.x + chairX_local,
              zoneMesh.position.y + (ZONE_BOX_HEIGHT / 2), // Place bottom of legs on zone surface
              zoneMesh.position.z + chairZ_local
            );

            // Orient chairs to face "north" (global -Z axis)
            // Assuming chair model's front is local +Z: rotate PI around Y to face global -Z.
            chairGroup.rotation.y = Math.PI; 
            
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

      if (stageTextSpriteRef.current) {
        if (stageTextSpriteRef.current.material.map) {
          stageTextSpriteRef.current.material.map.dispose();
        }
        stageTextSpriteRef.current.material.dispose();
        stageTextSpriteRef.current = null;
      }
      
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
        } else if (object instanceof THREE.Sprite) {
            if (object.material.map) object.material.map.dispose();
            object.material.dispose();
        }
         if (object instanceof THREE.Group) {
          // Groups themselves don't have geometry/material to dispose, 
          // but their children are handled by the general traversal.
        }
      });
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      stageMeshRef.current = null;
    };
  }, [layout, selectedSeats, selectedZoneIds]); 


  return <div ref={mountRef} className={cn("w-full h-[300px] md:h-[400px] rounded-md overflow-hidden border border-border bg-muted/20", className)} data-ai-hint="3d venue map preview seats stage" />;
}

