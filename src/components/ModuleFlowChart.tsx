import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Custom Node Components
const ModuleNode = ({ data }: { data: any }) => (
  <div className="px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-2 border-primary/30 min-w-[220px] backdrop-blur-sm cursor-move">
    <div className="flex flex-col items-center gap-2">
      <div className="text-2xl font-bold">{data.icon}</div>
      <div className="text-sm font-bold text-center">{data.label}</div>
      {data.description && (
        <div className="text-xs text-center opacity-90 font-medium">{data.description}</div>
      )}
    </div>
  </div>
);

const ProcessNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-lg rounded-lg bg-card text-card-foreground border-2 border-border min-w-[160px] backdrop-blur-sm cursor-move">
    <div className="text-sm font-semibold text-center mb-1">{data.label}</div>
    {data.details && (
      <div className="text-xs text-center text-muted-foreground font-medium">{data.details}</div>
    )}
  </div>
);

const DecisionNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 shadow-lg bg-gradient-to-br from-accent to-accent/80 text-accent-foreground border-2 border-accent/30 transform rotate-45 w-28 h-28 backdrop-blur-sm cursor-move">
    <div className="transform -rotate-45 text-xs font-bold text-center flex items-center justify-center h-full">
      {data.label}
    </div>
  </div>
);

const ResultNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-lg rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-2 border-emerald-300 min-w-[140px] backdrop-blur-sm cursor-move">
    <div className="text-sm font-semibold text-center">{data.label}</div>
  </div>
);

const nodeTypes = {
  module: ModuleNode,
  process: ProcessNode,
  decision: DecisionNode,
  result: ResultNode,
};

// Module Flow Definitions
const moduleFlows = {
  'patient-management': {
    name: 'Patient Management',
    description: 'Complete patient lifecycle management',
    nodes: [
      {
        id: 'pm-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '👥', label: 'Patient Management', description: 'Central hub for patient data' }
      },
      {
        id: 'pm-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'New Patient Registration', details: 'Demographics, insurance, medical history' }
      },
      {
        id: 'pm-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'Profile Management', details: 'Update information, preferences' }
      },
      {
        id: 'pm-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Medical History', details: 'Allergies, conditions, medications' }
      },
      {
        id: 'pm-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Insurance Valid?' }
      },
      {
        id: 'pm-6',
        type: 'result',
        position: { x: 100, y: 350 },
        data: { label: 'Schedule Appointment' }
      },
      {
        id: 'pm-7',
        type: 'result',
        position: { x: 300, y: 350 },
        data: { label: 'Update Insurance Info' }
      }
    ],
    edges: [
      { id: 'pm-e1', source: 'pm-1', target: 'pm-2', type: 'smoothstep' },
      { id: 'pm-e2', source: 'pm-1', target: 'pm-3', type: 'smoothstep' },
      { id: 'pm-e3', source: 'pm-1', target: 'pm-4', type: 'smoothstep' },
      { id: 'pm-e4', source: 'pm-2', target: 'pm-5', type: 'smoothstep' },
      { id: 'pm-e5', source: 'pm-3', target: 'pm-5', type: 'smoothstep' },
      { id: 'pm-e6', source: 'pm-4', target: 'pm-5', type: 'smoothstep' },
      { id: 'pm-e7', source: 'pm-5', target: 'pm-6', label: 'Yes', type: 'smoothstep' },
      { id: 'pm-e8', source: 'pm-5', target: 'pm-7', label: 'No', type: 'smoothstep' }
    ]
  },
  'appointment-scheduling': {
    name: 'Appointment Scheduling',
    description: 'AI-powered scheduling and calendar management',
    nodes: [
      {
        id: 'as-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '📅', label: 'AI Scheduling', description: 'Smart appointment booking system' }
      },
      {
        id: 'as-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Check Availability', details: 'Real-time calendar sync' }
      },
      {
        id: 'as-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'AI Optimization', details: 'Suggest best time slots' }
      },
      {
        id: 'as-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Staff Assignment', details: 'Match skills to treatment' }
      },
      {
        id: 'as-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Conflict?' }
      },
      {
        id: 'as-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Send Confirmation', details: 'Email, SMS notifications' }
      },
      {
        id: 'as-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Reschedule Options', details: 'Alternative time slots' }
      },
      {
        id: 'as-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Appointment Booked' }
      }
    ],
    edges: [
      { id: 'as-e1', source: 'as-1', target: 'as-2', type: 'smoothstep' },
      { id: 'as-e2', source: 'as-1', target: 'as-3', type: 'smoothstep' },
      { id: 'as-e3', source: 'as-1', target: 'as-4', type: 'smoothstep' },
      { id: 'as-e4', source: 'as-2', target: 'as-5', type: 'smoothstep' },
      { id: 'as-e5', source: 'as-3', target: 'as-5', type: 'smoothstep' },
      { id: 'as-e6', source: 'as-4', target: 'as-5', type: 'smoothstep' },
      { id: 'as-e7', source: 'as-5', target: 'as-6', label: 'No', type: 'smoothstep' },
      { id: 'as-e8', source: 'as-5', target: 'as-7', label: 'Yes', type: 'smoothstep' },
      { id: 'as-e9', source: 'as-6', target: 'as-8', type: 'smoothstep' },
      { id: 'as-e10', source: 'as-7', target: 'as-8', type: 'smoothstep' }
    ]
  },
  'ai-marketing': {
    name: 'AI Marketing',
    description: 'Automated marketing campaigns and lead management',
    nodes: [
      {
        id: 'am-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '🤖', label: 'AI Marketing', description: 'Intelligent campaign management' }
      },
      {
        id: 'am-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Lead Capture', details: 'Website, social media, referrals' }
      },
      {
        id: 'am-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'AI Scoring', details: 'Analyze conversion probability' }
      },
      {
        id: 'am-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Personalization', details: 'Tailor messages by profile' }
      },
      {
        id: 'am-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'High Score?' }
      },
      {
        id: 'am-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Priority Follow-up', details: 'Immediate phone call' }
      },
      {
        id: 'am-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Email Nurture', details: 'Automated email sequence' }
      },
      {
        id: 'am-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Patient Conversion' }
      }
    ],
    edges: [
      { id: 'am-e1', source: 'am-1', target: 'am-2', type: 'smoothstep' },
      { id: 'am-e2', source: 'am-1', target: 'am-3', type: 'smoothstep' },
      { id: 'am-e3', source: 'am-1', target: 'am-4', type: 'smoothstep' },
      { id: 'am-e4', source: 'am-2', target: 'am-5', type: 'smoothstep' },
      { id: 'am-e5', source: 'am-3', target: 'am-5', type: 'smoothstep' },
      { id: 'am-e6', source: 'am-4', target: 'am-5', type: 'smoothstep' },
      { id: 'am-e7', source: 'am-5', target: 'am-6', label: 'Yes', type: 'smoothstep' },
      { id: 'am-e8', source: 'am-5', target: 'am-7', label: 'No', type: 'smoothstep' },
      { id: 'am-e9', source: 'am-6', target: 'am-8', type: 'smoothstep' },
      { id: 'am-e10', source: 'am-7', target: 'am-8', type: 'smoothstep' }
    ]
  },
  'image-analysis': {
    name: 'Image Analysis',
    description: 'AI-powered dental imaging and diagnostics',
    nodes: [
      {
        id: 'ia-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '🔬', label: 'Image Analysis', description: 'AI dental diagnostics' }
      },
      {
        id: 'ia-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Image Upload', details: 'X-rays, photos, CBCT scans' }
      },
      {
        id: 'ia-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'AI Processing', details: 'Computer vision analysis' }
      },
      {
        id: 'ia-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Quality Check', details: 'Image clarity validation' }
      },
      {
        id: 'ia-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Findings?' }
      },
      {
        id: 'ia-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Generate Report', details: 'Detailed analysis summary' }
      },
      {
        id: 'ia-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Flag for Review', details: 'Manual dentist review' }
      },
      {
        id: 'ia-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Diagnostic Report' }
      }
    ],
    edges: [
      { id: 'ia-e1', source: 'ia-1', target: 'ia-2', type: 'smoothstep' },
      { id: 'ia-e2', source: 'ia-1', target: 'ia-3', type: 'smoothstep' },
      { id: 'ia-e3', source: 'ia-1', target: 'ia-4', type: 'smoothstep' },
      { id: 'ia-e4', source: 'ia-2', target: 'ia-5', type: 'smoothstep' },
      { id: 'ia-e5', source: 'ia-3', target: 'ia-5', type: 'smoothstep' },
      { id: 'ia-e6', source: 'ia-4', target: 'ia-5', type: 'smoothstep' },
      { id: 'ia-e7', source: 'ia-5', target: 'ia-6', label: 'Normal', type: 'smoothstep' },
      { id: 'ia-e8', source: 'ia-5', target: 'ia-7', label: 'Abnormal', type: 'smoothstep' },
      { id: 'ia-e9', source: 'ia-6', target: 'ia-8', type: 'smoothstep' },
      { id: 'ia-e10', source: 'ia-7', target: 'ia-8', type: 'smoothstep' }
    ]
  },
  'data-migration': {
    name: 'Data Migration',
    description: 'Seamless data import from legacy systems',
    nodes: [
      {
        id: 'dm-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '📊', label: 'Data Migration', description: 'Legacy system integration' }
      },
      {
        id: 'dm-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'File Upload', details: 'CSV, Excel, database exports' }
      },
      {
        id: 'dm-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'Field Mapping', details: 'AI-assisted field matching' }
      },
      {
        id: 'dm-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Data Validation', details: 'Quality checks and cleanup' }
      },
      {
        id: 'dm-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Valid Data?' }
      },
      {
        id: 'dm-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Import Records', details: 'Batch processing with conflict handling' }
      },
      {
        id: 'dm-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Error Report', details: 'Show validation issues' }
      },
      {
        id: 'dm-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Migration Complete' }
      }
    ],
    edges: [
      { id: 'dm-e1', source: 'dm-1', target: 'dm-2', type: 'smoothstep' },
      { id: 'dm-e2', source: 'dm-1', target: 'dm-3', type: 'smoothstep' },
      { id: 'dm-e3', source: 'dm-1', target: 'dm-4', type: 'smoothstep' },
      { id: 'dm-e4', source: 'dm-2', target: 'dm-5', type: 'smoothstep' },
      { id: 'dm-e5', source: 'dm-3', target: 'dm-5', type: 'smoothstep' },
      { id: 'dm-e6', source: 'dm-4', target: 'dm-5', type: 'smoothstep' },
      { id: 'dm-e7', source: 'dm-5', target: 'dm-6', label: 'Yes', type: 'smoothstep' },
      { id: 'dm-e8', source: 'dm-5', target: 'dm-7', label: 'No', type: 'smoothstep' },
      { id: 'dm-e9', source: 'dm-6', target: 'dm-8', type: 'smoothstep' },
      { id: 'dm-e10', source: 'dm-7', target: 'dm-8', type: 'smoothstep' }
    ]
  },
  'teledentistry': {
    name: 'Teledentistry',
    description: 'Virtual consultations and remote patient care',
    nodes: [
      {
        id: 'td-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '📺', label: 'Teledentistry', description: 'Virtual dental consultations' }
      },
      {
        id: 'td-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Session Request', details: 'Patient initiates virtual visit' }
      },
      {
        id: 'td-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'Device Check', details: 'Camera, audio, connectivity' }
      },
      {
        id: 'td-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Provider Match', details: 'Available dentist assignment' }
      },
      {
        id: 'td-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Connection OK?' }
      },
      {
        id: 'td-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Video Session', details: 'Live consultation with recording' }
      },
      {
        id: 'td-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Tech Support', details: 'Troubleshoot connection' }
      },
      {
        id: 'td-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Consultation Complete' }
      }
    ],
    edges: [
      { id: 'td-e1', source: 'td-1', target: 'td-2', type: 'smoothstep' },
      { id: 'td-e2', source: 'td-1', target: 'td-3', type: 'smoothstep' },
      { id: 'td-e3', source: 'td-1', target: 'td-4', type: 'smoothstep' },
      { id: 'td-e4', source: 'td-2', target: 'td-5', type: 'smoothstep' },
      { id: 'td-e5', source: 'td-3', target: 'td-5', type: 'smoothstep' },
      { id: 'td-e6', source: 'td-4', target: 'td-5', type: 'smoothstep' },
      { id: 'td-e7', source: 'td-5', target: 'td-6', label: 'Yes', type: 'smoothstep' },
      { id: 'td-e8', source: 'td-5', target: 'td-7', label: 'No', type: 'smoothstep' },
      { id: 'td-e9', source: 'td-6', target: 'td-8', type: 'smoothstep' },
      { id: 'td-e10', source: 'td-7', target: 'td-8', type: 'smoothstep' }
    ]
  },
  'voice-transcription': {
    name: 'Voice Transcription',
    description: 'AI-powered voice to text for clinical notes',
    nodes: [
      {
        id: 'vt-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '🎤', label: 'Voice Transcription', description: 'Speech to text conversion' }
      },
      {
        id: 'vt-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Audio Capture', details: 'Real-time microphone input' }
      },
      {
        id: 'vt-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'AI Processing', details: 'Speech recognition engine' }
      },
      {
        id: 'vt-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Medical Context', details: 'Dental terminology recognition' }
      },
      {
        id: 'vt-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Confident?' }
      },
      {
        id: 'vt-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Generate Text', details: 'Structured clinical notes' }
      },
      {
        id: 'vt-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Manual Review', details: 'Flag uncertain sections' }
      },
      {
        id: 'vt-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Notes Created' }
      }
    ],
    edges: [
      { id: 'vt-e1', source: 'vt-1', target: 'vt-2', type: 'smoothstep' },
      { id: 'vt-e2', source: 'vt-1', target: 'vt-3', type: 'smoothstep' },
      { id: 'vt-e3', source: 'vt-1', target: 'vt-4', type: 'smoothstep' },
      { id: 'vt-e4', source: 'vt-2', target: 'vt-5', type: 'smoothstep' },
      { id: 'vt-e5', source: 'vt-3', target: 'vt-5', type: 'smoothstep' },
      { id: 'vt-e6', source: 'vt-4', target: 'vt-5', type: 'smoothstep' },
      { id: 'vt-e7', source: 'vt-5', target: 'vt-6', label: 'High', type: 'smoothstep' },
      { id: 'vt-e8', source: 'vt-5', target: 'vt-7', label: 'Low', type: 'smoothstep' },
      { id: 'vt-e9', source: 'vt-6', target: 'vt-8', type: 'smoothstep' },
      { id: 'vt-e10', source: 'vt-7', target: 'vt-8', type: 'smoothstep' }
    ]
  },
  'practice-analytics': {
    name: 'Practice Analytics',
    description: 'Comprehensive business intelligence and reporting',
    nodes: [
      {
        id: 'pa-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '📈', label: 'Practice Analytics', description: 'Business intelligence dashboard' }
      },
      {
        id: 'pa-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Data Collection', details: 'Appointments, revenue, patients' }
      },
      {
        id: 'pa-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'KPI Calculation', details: 'Performance metrics' }
      },
      {
        id: 'pa-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Trend Analysis', details: 'Historical comparisons' }
      },
      {
        id: 'pa-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Alerts?' }
      },
      {
        id: 'pa-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Generate Reports', details: 'Charts, graphs, summaries' }
      },
      {
        id: 'pa-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Send Notifications', details: 'Important metric changes' }
      },
      {
        id: 'pa-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Insights Delivered' }
      }
    ],
    edges: [
      { id: 'pa-e1', source: 'pa-1', target: 'pa-2', type: 'smoothstep' },
      { id: 'pa-e2', source: 'pa-1', target: 'pa-3', type: 'smoothstep' },
      { id: 'pa-e3', source: 'pa-1', target: 'pa-4', type: 'smoothstep' },
      { id: 'pa-e4', source: 'pa-2', target: 'pa-5', type: 'smoothstep' },
      { id: 'pa-e5', source: 'pa-3', target: 'pa-5', type: 'smoothstep' },
      { id: 'pa-e6', source: 'pa-4', target: 'pa-5', type: 'smoothstep' },
      { id: 'pa-e7', source: 'pa-5', target: 'pa-6', label: 'No', type: 'smoothstep' },
      { id: 'pa-e8', source: 'pa-5', target: 'pa-7', label: 'Yes', type: 'smoothstep' },
      { id: 'pa-e9', source: 'pa-6', target: 'pa-8', type: 'smoothstep' },
      { id: 'pa-e10', source: 'pa-7', target: 'pa-8', type: 'smoothstep' }
    ]
  },
  'treatment-planning': {
    name: 'Treatment Planning',
    description: 'AI-assisted treatment plan generation and management',
    nodes: [
      {
        id: 'tp-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '🦷', label: 'Treatment Planning', description: 'AI treatment recommendations' }
      },
      {
        id: 'tp-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Clinical Data', details: 'Exam findings, X-rays, history' }
      },
      {
        id: 'tp-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'AI Analysis', details: 'Treatment recommendations' }
      },
      {
        id: 'tp-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Cost Estimation', details: 'Insurance and fee calculation' }
      },
      {
        id: 'tp-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Complex Case?' }
      },
      {
        id: 'tp-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Standard Plan', details: 'Routine treatment sequence' }
      },
      {
        id: 'tp-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Specialist Referral', details: 'Complex case consultation' }
      },
      {
        id: 'tp-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Treatment Plan Ready' }
      }
    ],
    edges: [
      { id: 'tp-e1', source: 'tp-1', target: 'tp-2', type: 'smoothstep' },
      { id: 'tp-e2', source: 'tp-1', target: 'tp-3', type: 'smoothstep' },
      { id: 'tp-e3', source: 'tp-1', target: 'tp-4', type: 'smoothstep' },
      { id: 'tp-e4', source: 'tp-2', target: 'tp-5', type: 'smoothstep' },
      { id: 'tp-e5', source: 'tp-3', target: 'tp-5', type: 'smoothstep' },
      { id: 'tp-e6', source: 'tp-4', target: 'tp-5', type: 'smoothstep' },
      { id: 'tp-e7', source: 'tp-5', target: 'tp-6', label: 'No', type: 'smoothstep' },
      { id: 'tp-e8', source: 'tp-5', target: 'tp-7', label: 'Yes', type: 'smoothstep' },
      { id: 'tp-e9', source: 'tp-6', target: 'tp-8', type: 'smoothstep' },
      { id: 'tp-e10', source: 'tp-7', target: 'tp-8', type: 'smoothstep' }
    ]
  },
  'revenue-management': {
    name: 'Revenue Management',
    description: 'Financial optimization and revenue cycle management',
    nodes: [
      {
        id: 'rm-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '💰', label: 'Revenue Management', description: 'Financial optimization system' }
      },
      {
        id: 'rm-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Revenue Tracking', details: 'Real-time financial monitoring' }
      },
      {
        id: 'rm-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'Cost Analysis', details: 'Overhead and expense tracking' }
      },
      {
        id: 'rm-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Profit Optimization', details: 'AI-driven recommendations' }
      },
      {
        id: 'rm-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Target Met?' }
      },
      {
        id: 'rm-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Performance Report', details: 'Financial dashboard update' }
      },
      {
        id: 'rm-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Action Plan', details: 'Revenue improvement strategy' }
      },
      {
        id: 'rm-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Financial Insights' }
      }
    ],
    edges: [
      { id: 'rm-e1', source: 'rm-1', target: 'rm-2', type: 'smoothstep' },
      { id: 'rm-e2', source: 'rm-1', target: 'rm-3', type: 'smoothstep' },
      { id: 'rm-e3', source: 'rm-1', target: 'rm-4', type: 'smoothstep' },
      { id: 'rm-e4', source: 'rm-2', target: 'rm-5', type: 'smoothstep' },
      { id: 'rm-e5', source: 'rm-3', target: 'rm-5', type: 'smoothstep' },
      { id: 'rm-e6', source: 'rm-4', target: 'rm-5', type: 'smoothstep' },
      { id: 'rm-e7', source: 'rm-5', target: 'rm-6', label: 'Yes', type: 'smoothstep' },
      { id: 'rm-e8', source: 'rm-5', target: 'rm-7', label: 'No', type: 'smoothstep' },
      { id: 'rm-e9', source: 'rm-6', target: 'rm-8', type: 'smoothstep' },
      { id: 'rm-e10', source: 'rm-7', target: 'rm-8', type: 'smoothstep' }
    ]
  },
  'insurance-billing': {
    name: 'Insurance Billing',
    description: 'Automated insurance claim processing and management',
    nodes: [
      {
        id: 'ib-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '🏥', label: 'Insurance Billing', description: 'Automated claim processing' }
      },
      {
        id: 'ib-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Claim Generation', details: 'Treatment codes and details' }
      },
      {
        id: 'ib-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'Eligibility Check', details: 'Real-time insurance verification' }
      },
      {
        id: 'ib-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Claim Submission', details: 'Electronic filing to carriers' }
      },
      {
        id: 'ib-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Approved?' }
      },
      {
        id: 'ib-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Payment Processing', details: 'Reimbursement handling' }
      },
      {
        id: 'ib-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Appeal Process', details: 'Claim rejection handling' }
      },
      {
        id: 'ib-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Billing Complete' }
      }
    ],
    edges: [
      { id: 'ib-e1', source: 'ib-1', target: 'ib-2', type: 'smoothstep' },
      { id: 'ib-e2', source: 'ib-1', target: 'ib-3', type: 'smoothstep' },
      { id: 'ib-e3', source: 'ib-1', target: 'ib-4', type: 'smoothstep' },
      { id: 'ib-e4', source: 'ib-2', target: 'ib-5', type: 'smoothstep' },
      { id: 'ib-e5', source: 'ib-3', target: 'ib-5', type: 'smoothstep' },
      { id: 'ib-e6', source: 'ib-4', target: 'ib-5', type: 'smoothstep' },
      { id: 'ib-e7', source: 'ib-5', target: 'ib-6', label: 'Yes', type: 'smoothstep' },
      { id: 'ib-e8', source: 'ib-5', target: 'ib-7', label: 'No', type: 'smoothstep' },
      { id: 'ib-e9', source: 'ib-6', target: 'ib-8', type: 'smoothstep' },
      { id: 'ib-e10', source: 'ib-7', target: 'ib-8', type: 'smoothstep' }
    ]
  },
  'consent-forms': {
    name: 'Consent Forms',
    description: 'Digital consent management and e-signature workflow',
    nodes: [
      {
        id: 'cf-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '📋', label: 'Consent Forms', description: 'Digital consent management' }
      },
      {
        id: 'cf-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Form Selection', details: 'Treatment-specific forms' }
      },
      {
        id: 'cf-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'Patient Delivery', details: 'Email or tablet presentation' }
      },
      {
        id: 'cf-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Digital Signature', details: 'Secure e-signature capture' }
      },
      {
        id: 'cf-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Complete?' }
      },
      {
        id: 'cf-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Store Securely', details: 'HIPAA-compliant storage' }
      },
      {
        id: 'cf-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Send Reminder', details: 'Follow-up notifications' }
      },
      {
        id: 'cf-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Consent Documented' }
      }
    ],
    edges: [
      { id: 'cf-e1', source: 'cf-1', target: 'cf-2', type: 'smoothstep' },
      { id: 'cf-e2', source: 'cf-1', target: 'cf-3', type: 'smoothstep' },
      { id: 'cf-e3', source: 'cf-1', target: 'cf-4', type: 'smoothstep' },
      { id: 'cf-e4', source: 'cf-2', target: 'cf-5', type: 'smoothstep' },
      { id: 'cf-e5', source: 'cf-3', target: 'cf-5', type: 'smoothstep' },
      { id: 'cf-e6', source: 'cf-4', target: 'cf-5', type: 'smoothstep' },
      { id: 'cf-e7', source: 'cf-5', target: 'cf-6', label: 'Yes', type: 'smoothstep' },
      { id: 'cf-e8', source: 'cf-5', target: 'cf-7', label: 'No', type: 'smoothstep' },
      { id: 'cf-e9', source: 'cf-6', target: 'cf-8', type: 'smoothstep' },
      { id: 'cf-e10', source: 'cf-7', target: 'cf-8', type: 'smoothstep' }
    ]
  },
  'xray-diagnostics': {
    name: 'X-Ray Diagnostics',
    description: 'Advanced radiographic analysis and interpretation',
    nodes: [
      {
        id: 'xr-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '🩻', label: 'X-Ray Diagnostics', description: 'AI radiographic analysis' }
      },
      {
        id: 'xr-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Image Capture', details: 'Digital radiography acquisition' }
      },
      {
        id: 'xr-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'Quality Assessment', details: 'Image clarity and positioning' }
      },
      {
        id: 'xr-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'AI Analysis', details: 'Pathology detection algorithms' }
      },
      {
        id: 'xr-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Abnormalities?' }
      },
      {
        id: 'xr-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Normal Report', details: 'Standard diagnostic summary' }
      },
      {
        id: 'xr-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Alert Dentist', details: 'Priority review required' }
      },
      {
        id: 'xr-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Diagnostic Complete' }
      }
    ],
    edges: [
      { id: 'xr-e1', source: 'xr-1', target: 'xr-2', type: 'smoothstep' },
      { id: 'xr-e2', source: 'xr-1', target: 'xr-3', type: 'smoothstep' },
      { id: 'xr-e3', source: 'xr-1', target: 'xr-4', type: 'smoothstep' },
      { id: 'xr-e4', source: 'xr-2', target: 'xr-5', type: 'smoothstep' },
      { id: 'xr-e5', source: 'xr-3', target: 'xr-5', type: 'smoothstep' },
      { id: 'xr-e6', source: 'xr-4', target: 'xr-5', type: 'smoothstep' },
      { id: 'xr-e7', source: 'xr-5', target: 'xr-6', label: 'No', type: 'smoothstep' },
      { id: 'xr-e8', source: 'xr-5', target: 'xr-7', label: 'Yes', type: 'smoothstep' },
      { id: 'xr-e9', source: 'xr-6', target: 'xr-8', type: 'smoothstep' },
      { id: 'xr-e10', source: 'xr-7', target: 'xr-8', type: 'smoothstep' }
    ]
  },
  'marketing-automation': {
    name: 'Marketing Automation',
    description: 'Automated patient outreach and campaign management',
    nodes: [
      {
        id: 'ma-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '📧', label: 'Marketing Automation', description: 'Automated patient campaigns' }
      },
      {
        id: 'ma-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Audience Segmentation', details: 'Patient demographics and behavior' }
      },
      {
        id: 'ma-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'Campaign Creation', details: 'Personalized messaging' }
      },
      {
        id: 'ma-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Channel Selection', details: 'Email, SMS, social media' }
      },
      {
        id: 'ma-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Opt-in Status?' }
      },
      {
        id: 'ma-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Send Campaign', details: 'Automated delivery system' }
      },
      {
        id: 'ma-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Skip Contact', details: 'Respect privacy preferences' }
      },
      {
        id: 'ma-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Campaign Delivered' }
      }
    ],
    edges: [
      { id: 'ma-e1', source: 'ma-1', target: 'ma-2', type: 'smoothstep' },
      { id: 'ma-e2', source: 'ma-1', target: 'ma-3', type: 'smoothstep' },
      { id: 'ma-e3', source: 'ma-1', target: 'ma-4', type: 'smoothstep' },
      { id: 'ma-e4', source: 'ma-2', target: 'ma-5', type: 'smoothstep' },
      { id: 'ma-e5', source: 'ma-3', target: 'ma-5', type: 'smoothstep' },
      { id: 'ma-e6', source: 'ma-4', target: 'ma-5', type: 'smoothstep' },
      { id: 'ma-e7', source: 'ma-5', target: 'ma-6', label: 'Active', type: 'smoothstep' },
      { id: 'ma-e8', source: 'ma-5', target: 'ma-7', label: 'Inactive', type: 'smoothstep' },
      { id: 'ma-e9', source: 'ma-6', target: 'ma-8', type: 'smoothstep' },
      { id: 'ma-e10', source: 'ma-7', target: 'ma-8', type: 'smoothstep' }
    ]
  },
  'reputation-management': {
    name: 'Reputation Management',
    description: 'Online review monitoring and response automation',
    nodes: [
      {
        id: 'rep-1',
        type: 'module',
        position: { x: 200, y: 50 },
        data: { icon: '⭐', label: 'Reputation Management', description: 'Online reputation tracking' }
      },
      {
        id: 'rep-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Review Monitoring', details: 'Google, Yelp, Facebook tracking' }
      },
      {
        id: 'rep-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'Sentiment Analysis', details: 'AI-powered review assessment' }
      },
      {
        id: 'rep-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Response Generation', details: 'Automated reply suggestions' }
      },
      {
        id: 'rep-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Positive Review?' }
      },
      {
        id: 'rep-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Thank Patient', details: 'Appreciation response' }
      },
      {
        id: 'rep-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Issue Resolution', details: 'Address concerns privately' }
      },
      {
        id: 'rep-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Reputation Managed' }
      }
    ],
    edges: [
      { id: 'rep-e1', source: 'rep-1', target: 'rep-2', type: 'smoothstep' },
      { id: 'rep-e2', source: 'rep-1', target: 'rep-3', type: 'smoothstep' },
      { id: 'rep-e3', source: 'rep-1', target: 'rep-4', type: 'smoothstep' },
      { id: 'rep-e4', source: 'rep-2', target: 'rep-5', type: 'smoothstep' },
      { id: 'rep-e5', source: 'rep-3', target: 'rep-5', type: 'smoothstep' },
      { id: 'rep-e6', source: 'rep-4', target: 'rep-5', type: 'smoothstep' },
      { id: 'rep-e7', source: 'rep-5', target: 'rep-6', label: 'Yes', type: 'smoothstep' },
      { id: 'rep-e8', source: 'rep-5', target: 'rep-7', label: 'No', type: 'smoothstep' },
      { id: 'rep-e9', source: 'rep-6', target: 'rep-8', type: 'smoothstep' },
      { id: 'rep-e10', source: 'rep-7', target: 'rep-8', type: 'smoothstep' }
    ]
  }
};

export function ModuleFlowChart() {
  const [selectedModule, setSelectedModule] = useState<keyof typeof moduleFlows>('patient-management');
  const [nodes, setNodes, onNodesChange] = useNodesState(moduleFlows[selectedModule].nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(moduleFlows[selectedModule].edges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleModuleChange = (moduleKey: keyof typeof moduleFlows) => {
    setSelectedModule(moduleKey);
    setNodes(moduleFlows[moduleKey].nodes);
    setEdges(moduleFlows[moduleKey].edges);
  };

  return (
    <Card className="w-full h-[800px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              Module Workflow Visualization
            </CardTitle>
            <CardDescription>
              Interactive flow diagrams showing how each module functions
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">Interactive</Badge>
            <Select value={selectedModule} onValueChange={handleModuleChange}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(moduleFlows).map(([key, flow]) => (
                  <SelectItem key={key} value={key}>
                    {flow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full p-0">
        <div className="h-[600px] border rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted/20">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            fitView
            style={{ backgroundColor: 'transparent' }}
            defaultEdgeOptions={{
              style: { strokeWidth: 3, stroke: 'hsl(var(--primary))' },
              markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' }
            }}
          >
            <MiniMap 
              nodeStrokeColor="hsl(var(--primary))"
              nodeColor="hsl(var(--secondary))"
              nodeBorderRadius={8}
              position="top-right"
            />
            <Controls />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={24} 
              size={2} 
              color="hsl(var(--muted-foreground) / 0.3)"
            />
          </ReactFlow>
        </div>
        
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{moduleFlows[selectedModule].name}</h3>
              <p className="text-sm text-muted-foreground">{moduleFlows[selectedModule].description}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">
                {moduleFlows[selectedModule].nodes.length} Steps
              </Badge>
              <Badge variant="outline">
                {moduleFlows[selectedModule].edges.length} Connections
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}