import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ChairSettings, useIoTHardware } from '@/hooks/useIoTHardware';
import { Settings, RotateCcw, Play, Pause, User, Wrench } from 'lucide-react';

export const SmartDentalChair: React.FC = () => {
  const { chairs, positionChair } = useIoTHardware();
  const [selectedChair, setSelectedChair] = useState<string | null>(null);
  const [tempPosition, setTempPosition] = useState<ChairSettings['position'] | null>(null);

  const getStatusColor = (status: ChairSettings['status']) => {
    switch (status) {
      case 'occupied': return 'bg-primary text-primary-foreground';
      case 'positioning': return 'bg-yellow-500 text-white';
      case 'maintenance': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status: ChairSettings['status']) => {
    switch (status) {
      case 'occupied': return <User className="h-4 w-4" />;
      case 'positioning': return <Settings className="h-4 w-4 animate-spin" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      default: return <Pause className="h-4 w-4" />;
    }
  };

  const handlePositionChange = (chairId: string, key: keyof ChairSettings['position'], value: number) => {
    const chair = chairs.find(c => c.id === chairId);
    if (!chair) return;

    const newPosition = { ...chair.position, [key]: value };
    setTempPosition(newPosition);
  };

  const applyPosition = (chairId: string) => {
    if (tempPosition) {
      positionChair(chairId, tempPosition);
      setTempPosition(null);
    }
  };

  const resetToDefault = (chairId: string) => {
    const defaultPosition = { backrest: 45, legrest: 20, height: 75, tilt: 15 };
    positionChair(chairId, defaultPosition);
    setTempPosition(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Smart Dental Chair Control</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {chairs.map((chair) => {
          const currentPosition = tempPosition && selectedChair === chair.id ? tempPosition : chair.position;
          
          return (
            <Card key={chair.id} className="p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{chair.name}</CardTitle>
                  <Badge className={getStatusColor(chair.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(chair.status)}
                      {chair.status}
                    </div>
                  </Badge>
                </div>
                <CardDescription>
                  Last calibration: {new Date(chair.last_calibration).toLocaleDateString()}
                  {chair.patient_id && <span className="block">Patient ID: {chair.patient_id}</span>}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Position Controls */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center justify-between">
                      Backrest Angle
                      <span className="text-muted-foreground">{currentPosition.backrest}°</span>
                    </label>
                    <Slider
                      value={[currentPosition.backrest]}
                      onValueChange={(value) => {
                        setSelectedChair(chair.id);
                        handlePositionChange(chair.id, 'backrest', value[0]);
                      }}
                      max={90}
                      min={0}
                      step={5}
                      className="w-full"
                      disabled={chair.status === 'positioning'}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center justify-between">
                      Legrest Angle
                      <span className="text-muted-foreground">{currentPosition.legrest}°</span>
                    </label>
                    <Slider
                      value={[currentPosition.legrest]}
                      onValueChange={(value) => {
                        setSelectedChair(chair.id);
                        handlePositionChange(chair.id, 'legrest', value[0]);
                      }}
                      max={45}
                      min={0}
                      step={5}
                      className="w-full"
                      disabled={chair.status === 'positioning'}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center justify-between">
                      Height
                      <span className="text-muted-foreground">{currentPosition.height}cm</span>
                    </label>
                    <Slider
                      value={[currentPosition.height]}
                      onValueChange={(value) => {
                        setSelectedChair(chair.id);
                        handlePositionChange(chair.id, 'height', value[0]);
                      }}
                      max={100}
                      min={50}
                      step={5}
                      className="w-full"
                      disabled={chair.status === 'positioning'}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center justify-between">
                      Tilt Angle
                      <span className="text-muted-foreground">{currentPosition.tilt}°</span>
                    </label>
                    <Slider
                      value={[currentPosition.tilt]}
                      onValueChange={(value) => {
                        setSelectedChair(chair.id);
                        handlePositionChange(chair.id, 'tilt', value[0]);
                      }}
                      max={45}
                      min={-15}
                      step={5}
                      className="w-full"
                      disabled={chair.status === 'positioning'}
                    />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => applyPosition(chair.id)}
                    disabled={!tempPosition || selectedChair !== chair.id || chair.status === 'positioning'}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Apply Position
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => resetToDefault(chair.id)}
                    disabled={chair.status === 'positioning'}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedChair(chair.id);
                      setTempPosition({ backrest: 90, legrest: 0, height: 100, tilt: 0 });
                    }}
                    disabled={chair.status === 'positioning'}
                  >
                    Upright
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedChair(chair.id);
                      setTempPosition({ backrest: 15, legrest: 30, height: 60, tilt: 30 });
                    }}
                    disabled={chair.status === 'positioning'}
                  >
                    Reclined
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedChair(chair.id);
                      setTempPosition({ backrest: 45, legrest: 20, height: 75, tilt: 15 });
                    }}
                    disabled={chair.status === 'positioning'}
                  >
                    Standard
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};