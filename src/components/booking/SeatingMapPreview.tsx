
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

  return (
    <Card className="bg-muted/20 border-border shadow-inner">
      <CardContent className="p-4">
        <div 
            className="relative bg-background p-4 rounded-lg aspect-[16/10] w-full overflow-hidden border border-border shadow-sm"
            data-ai-hint="venue layout preview"
        >
          {stagePosition && (
            <div
              className="absolute bg-foreground text-background text-xs flex items-center justify-center rounded shadow-md"
              style={{
                top: stagePosition.top || 'auto',
                bottom: stagePosition.bottom || 'auto',
                left: stagePosition.left ? `calc(${stagePosition.left} - (${stagePosition.width || '30%'}/2))` : 'auto',
                right: stagePosition.right || 'auto',
                width: stagePosition.width || '30%',
                height: stagePosition.height || '8%',
                transform: stagePosition.left && !stagePosition.right ? 'translateX(-50%)' : 'none',
              }}
              data-ai-hint="stage location"
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
                style={{
                  top: zone.mapPosition?.top,
                  left: zone.mapPosition?.left,
                  width: zone.mapPosition?.width,
                  height: zone.mapPosition?.height,
                }}
                aria-label={`Zone ${zone.name}${isSelectedZone ? ', contains selected seats' : ''}`}
                 data-ai-hint="seating zone preview"
              >
                <span className="truncate px-1">{zone.name}</span>
              </div>
            );
          })}
        </div>
         <p className="text-xs text-muted-foreground mt-2 text-center">
            {tSelectSeats('legendTitle')}{' '}
            <span className="inline-block w-3 h-3 rounded-sm bg-primary align-middle mr-1"></span>{' '}
            {tSelectSeats('legendSelected')} zone(s)
        </p>
      </CardContent>
    </Card>
  );
}
