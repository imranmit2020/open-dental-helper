import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface ChairSettings {
  id: string;
  name: string;
  position: {
    backrest: number; // 0-90 degrees
    legrest: number; // 0-45 degrees
    height: number; // 0-100 cm
    tilt: number; // -15 to 45 degrees
  };
  status: 'idle' | 'positioning' | 'occupied' | 'maintenance';
  patient_id?: string;
  last_calibration: string;
}

export interface EnvironmentalData {
  sensor_id: string;
  location: string;
  temperature: number; // Celsius
  humidity: number; // Percentage
  air_quality: number; // AQI 0-500
  co2_level: number; // PPM
  last_updated: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface SmartCabinet {
  id: string;
  name: string;
  location: string;
  access_method: 'RFID' | 'NFC' | 'Biometric';
  status: 'locked' | 'unlocked' | 'error';
  last_access: string;
  authorized_users: string[];
  inventory_items: string[];
  access_log: AccessLog[];
}

export interface AccessLog {
  id: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  action: 'unlock' | 'lock' | 'access_denied';
  method: string;
}

export interface EquipmentCalibration {
  id: string;
  equipment_name: string;
  equipment_type: string;
  location: string;
  last_calibration: string;
  next_calibration: string;
  status: 'calibrated' | 'due' | 'overdue' | 'maintenance';
  calibration_history: CalibrationRecord[];
  alerts_enabled: boolean;
}

export interface CalibrationRecord {
  id: string;
  date: string;
  technician: string;
  results: Record<string, any>;
  passed: boolean;
  notes?: string;
}

export const useIoTHardware = () => {
  const [chairs, setChairs] = useState<ChairSettings[]>([]);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData[]>([]);
  const [smartCabinets, setSmartCabinets] = useState<SmartCabinet[]>([]);
  const [equipmentCalibration, setEquipmentCalibration] = useState<EquipmentCalibration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize mock data
  useEffect(() => {
    const initializeData = () => {
      // Mock dental chairs
      const mockChairs: ChairSettings[] = [
        {
          id: 'chair-01',
          name: 'Chair 1 - Room A',
          position: { backrest: 45, legrest: 20, height: 75, tilt: 15 },
          status: 'occupied',
          patient_id: 'patient-123',
          last_calibration: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'chair-02',
          name: 'Chair 2 - Room B',
          position: { backrest: 30, legrest: 15, height: 80, tilt: 10 },
          status: 'idle',
          last_calibration: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Mock environmental sensors
      const mockEnvironmental: EnvironmentalData[] = [
        {
          sensor_id: 'env-01',
          location: 'Room A',
          temperature: 22.5,
          humidity: 45,
          air_quality: 25,
          co2_level: 400,
          last_updated: new Date().toISOString(),
          status: 'normal',
        },
        {
          sensor_id: 'env-02',
          location: 'Room B',
          temperature: 23.1,
          humidity: 48,
          air_quality: 35,
          co2_level: 450,
          last_updated: new Date().toISOString(),
          status: 'normal',
        },
        {
          sensor_id: 'env-03',
          location: 'Waiting Area',
          temperature: 24.8,
          humidity: 52,
          air_quality: 65,
          co2_level: 600,
          last_updated: new Date().toISOString(),
          status: 'warning',
        },
      ];

      // Mock smart cabinets
      const mockCabinets: SmartCabinet[] = [
        {
          id: 'cabinet-01',
          name: 'Medication Cabinet',
          location: 'Room A',
          access_method: 'RFID',
          status: 'locked',
          last_access: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          authorized_users: ['Dr. Smith', 'Nurse Johnson'],
          inventory_items: ['Local Anesthetic', 'Antibiotics', 'Pain Relievers'],
          access_log: [
            {
              id: 'log-01',
              user_id: 'user-01',
              user_name: 'Dr. Smith',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              action: 'unlock',
              method: 'RFID',
            },
          ],
        },
        {
          id: 'cabinet-02',
          name: 'Surgical Instruments',
          location: 'Room B',
          access_method: 'NFC',
          status: 'locked',
          last_access: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          authorized_users: ['Dr. Smith', 'Dr. Wilson'],
          inventory_items: ['Dental Forceps', 'Scalpels', 'Suture Kits'],
          access_log: [],
        },
      ];

      // Mock equipment calibration
      const mockEquipment: EquipmentCalibration[] = [
        {
          id: 'eq-01',
          equipment_name: 'Digital X-Ray Machine',
          equipment_type: 'Imaging',
          location: 'Room A',
          last_calibration: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          next_calibration: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'calibrated',
          calibration_history: [
            {
              id: 'cal-01',
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              technician: 'Tech Services Inc.',
              results: { exposure_accuracy: '98.5%', resolution: 'Pass' },
              passed: true,
            },
          ],
          alerts_enabled: true,
        },
        {
          id: 'eq-02',
          equipment_name: 'Ultrasonic Scaler',
          equipment_type: 'Cleaning',
          location: 'Room B',
          last_calibration: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          next_calibration: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'overdue',
          calibration_history: [],
          alerts_enabled: true,
        },
      ];

      setChairs(mockChairs);
      setEnvironmentalData(mockEnvironmental);
      setSmartCabinets(mockCabinets);
      setEquipmentCalibration(mockEquipment);
      setIsLoading(false);
    };

    initializeData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setEnvironmentalData(prev => prev.map(sensor => ({
        ...sensor,
        temperature: Math.round((sensor.temperature + (Math.random() - 0.5) * 0.5) * 10) / 10,
        humidity: Math.max(30, Math.min(70, sensor.humidity + (Math.random() - 0.5) * 2)),
        air_quality: Math.max(0, Math.min(100, sensor.air_quality + (Math.random() - 0.5) * 5)),
        co2_level: Math.max(300, Math.min(800, sensor.co2_level + (Math.random() - 0.5) * 20)),
        last_updated: new Date().toISOString(),
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const positionChair = async (chairId: string, position: Partial<ChairSettings['position']>) => {
    setChairs(prev => prev.map(chair => 
      chair.id === chairId 
        ? { 
            ...chair, 
            position: { ...chair.position, ...position },
            status: 'positioning' as const
          }
        : chair
    ));

    // Simulate positioning delay
    setTimeout(() => {
      setChairs(prev => prev.map(chair => 
        chair.id === chairId 
          ? { ...chair, status: 'occupied' as const }
          : chair
      ));
      toast({
        title: "Chair Positioned",
        description: "Chair has been successfully positioned.",
      });
    }, 2000);
  };

  const unlockCabinet = async (cabinetId: string, userId: string, method: string) => {
    const cabinet = smartCabinets.find(c => c.id === cabinetId);
    if (!cabinet) return;

    const newAccessLog: AccessLog = {
      id: `log-${Date.now()}`,
      user_id: userId,
      user_name: 'Current User',
      timestamp: new Date().toISOString(),
      action: 'unlock',
      method,
    };

    setSmartCabinets(prev => prev.map(c => 
      c.id === cabinetId 
        ? { 
            ...c, 
            status: 'unlocked' as const,
            last_access: new Date().toISOString(),
            access_log: [newAccessLog, ...c.access_log].slice(0, 10)
          }
        : c
    ));

    toast({
      title: "Cabinet Unlocked",
      description: `${cabinet.name} has been unlocked using ${method}.`,
    });

    // Auto-lock after 30 seconds
    setTimeout(() => {
      setSmartCabinets(prev => prev.map(c => 
        c.id === cabinetId 
          ? { ...c, status: 'locked' as const }
          : c
      ));
    }, 30000);
  };

  const scheduleCalibration = async (equipmentId: string, date: string) => {
    setEquipmentCalibration(prev => prev.map(eq => 
      eq.id === equipmentId 
        ? { 
            ...eq, 
            next_calibration: date,
            status: new Date(date) < new Date() ? 'overdue' : 'due'
          }
        : eq
    ));

    toast({
      title: "Calibration Scheduled",
      description: "Equipment calibration has been scheduled.",
    });
  };

  return {
    chairs,
    environmentalData,
    smartCabinets,
    equipmentCalibration,
    isLoading,
    positionChair,
    unlockCabinet,
    scheduleCalibration,
  };
};