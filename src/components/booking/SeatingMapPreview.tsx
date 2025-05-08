
'use client';

import type { SeatingLayout, SelectedSeatInfo, Zone } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface SeatingMapPreviewProps {
  layout: SeatingLayout;
  selectedSeats: SelectedSeatInfo[];
}

export default function SeatingMapPreview({ layout, selectedSeats }: SeatingMapPreviewProps) {
  const tSelectSeats = useTranslations('SelectSeatsPage'); // For stage label
  const { zones, stagePosition } = layout;

  const selectedZoneIds = new Set(selectedSeats.map(seat => seat.zoneId));

  const mapContainerStyle: React.CSSProperties = {
    transform: 'rotateX(45deg) rotateZ(0deg) scale(0.75)',
    transformStyle: 'preserve-3d',
    margin: '2rem auto', // Add some margin to prevent clipping with card edges
  };

  const stageDynamicStyle: React.CSSProperties = {
    top: stagePosition?.top || 'auto',
    bottom: stagePosition?.bottom || 'auto',
    left: stagePosition?.left || 'auto',
    right: stagePosition?.right || 'auto',
    width: stagePosition?.width || '30%',
    height: stagePosition?.height || '8%',
    transform: `translateZ(20px)${stagePosition?.left && !stagePosition?.right ? ' translateX(-50%)' : ''}`,
  };
  
  const zoneDynamicStyle = (zone: Zone): React.CSSProperties => ({
    top: zone.mapPosition?.top,
    left: zone.mapPosition?.left,
    width: zone.mapPosition?.width,
    height: zone.mapPosition?.height,
    transform: 'translateZ(10px)', // Lift zones slightly
  });


  return (
    <Card className="bg-muted/20 border-border shadow-inner overflow-visible"> {/* Allow content to overflow if needed due to transform */}
      <CardContent className="p-4" style={{ perspective: '1200px', overflow: 'visible' }}> {/* Perspective on parent */}
        <div 
            className={cn(
              "relative bg-background p-4 rounded-lg aspect-[16/10] w-full border border-border shadow-sm"
            )}
            style={mapContainerStyle}
            data-ai-hint="venue layout 3d preview"
        >
          {stagePosition && (
            <div
              className="absolute bg-foreground text-background text-xs flex items-center justify-center rounded shadow-md"
              style={stageDynamicStyle}
              data-ai-hint="stage location 3d"
            >
              {tSelectSeats('stageLabel')}
            </div>
          )}
          {zones.map(zone => {
            const isSelectedZone = selectedZoneIds.has(zone.id);
            return (
              <div
                key={zone.id}
                className={cn(
                  "absolute border-2 text-[0.6rem] sm:text-xs flex items-center justify-center rounded transition-all duration-150 ease-in-out shadow",
                  isSelectedZone 
                    ? 'bg-primary/80 border-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background' 
                    : 'bg-accent/40 border-accent text-accent-foreground',
                )}
                style={zoneDynamicStyle(zone)}
                aria-label={`Zone ${zone.name}${isSelectedZone ? ', contains selected seats' : ''}`}
                 data-ai-hint="seating zone 3d preview"
              >
                <span className="truncate px-1">{zone.name}</span>
              </div>
            );
          })}
        </div>
         <p className="text-xs text-muted-foreground mt-4 text-center"> {/* Increased margin-top for spacing */}
            {tSelectSeats('legendTitle')}{' '}
            <span className="inline-block w-3 h-3 rounded-sm bg-primary align-middle mr-1"></span>{' '}
            {tSelectSeats('legendSelected')} zone(s)
        </p>
      </CardContent>
    </Card>
  );
}

