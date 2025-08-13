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
  <div className="px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-2 border-primary/30 min-w-[220px] backdrop-blur-sm">
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
  <div className="px-4 py-3 shadow-lg rounded-lg bg-card text-card-foreground border-2 border-border min-w-[160px] backdrop-blur-sm">
    <div className="text-sm font-semibold text-center mb-1">{data.label}</div>
    {data.details && (
      <div className="text-xs text-center text-muted-foreground font-medium">{data.details}</div>
    )}
  </div>
);

const DecisionNode = ({ data }: { data: any }) => (
  <div className="px-3 py-2 shadow-lg bg-gradient-to-br from-accent to-accent/80 text-accent-foreground border-2 border-accent/30 transform rotate-45 w-28 h-28 backdrop-blur-sm">
    <div className="transform -rotate-45 text-xs font-bold text-center flex items-center justify-center h-full">
      {data.label}
    </div>
  </div>
);

const ResultNode = ({ data }: { data: any }) => (
  <div className="px-4 py-3 shadow-lg rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-2 border-emerald-300 min-w-[140px] backdrop-blur-sm">
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
        data: { icon: '👥', label: 'Patient Management', description: 'Central hub for patient data' },
        draggable: false,
        selectable: false
      },
      {
        id: 'pm-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'New Patient Registration', details: 'Demographics, insurance, medical history' },
        draggable: false,
        selectable: false
      },
      {
        id: 'pm-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'Profile Management', details: 'Update information, preferences' },
        draggable: false,
        selectable: false
      },
      {
        id: 'pm-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Medical History', details: 'Allergies, conditions, medications' },
        draggable: false,
        selectable: false
      },
      {
        id: 'pm-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Insurance Valid?' },
        draggable: false,
        selectable: false
      },
      {
        id: 'pm-6',
        type: 'result',
        position: { x: 100, y: 350 },
        data: { label: 'Schedule Appointment' },
        draggable: false,
        selectable: false
      },
      {
        id: 'pm-7',
        type: 'result',
        position: { x: 300, y: 350 },
        data: { label: 'Update Insurance Info' },
        draggable: false,
        selectable: false
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
        data: { icon: '📅', label: 'AI Scheduling', description: 'Smart appointment booking system' },
        draggable: false,
        selectable: false
      },
      {
        id: 'as-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Check Availability', details: 'Real-time calendar sync' },
        draggable: false,
        selectable: false
      },
      {
        id: 'as-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'AI Optimization', details: 'Suggest best time slots' },
        draggable: false,
        selectable: false
      },
      {
        id: 'as-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Staff Assignment', details: 'Match skills to treatment' },
        draggable: false,
        selectable: false
      },
      {
        id: 'as-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Conflict?' },
        draggable: false,
        selectable: false
      },
      {
        id: 'as-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Send Confirmation', details: 'Email, SMS notifications' },
        draggable: false,
        selectable: false
      },
      {
        id: 'as-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Reschedule Options', details: 'Alternative time slots' },
        draggable: false,
        selectable: false
      },
      {
        id: 'as-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Appointment Booked' },
        draggable: false,
        selectable: false
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
        data: { icon: '🤖', label: 'AI Marketing', description: 'Intelligent campaign management' },
        draggable: false,
        selectable: false
      },
      {
        id: 'am-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Lead Capture', details: 'Website, social media, referrals' },
        draggable: false,
        selectable: false
      },
      {
        id: 'am-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'AI Scoring', details: 'Analyze conversion probability' },
        draggable: false,
        selectable: false
      },
      {
        id: 'am-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Personalization', details: 'Tailor messages by profile' },
        draggable: false,
        selectable: false
      },
      {
        id: 'am-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'High Score?' },
        draggable: false,
        selectable: false
      },
      {
        id: 'am-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Priority Follow-up', details: 'Immediate phone call' },
        draggable: false,
        selectable: false
      },
      {
        id: 'am-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Email Nurture', details: 'Automated email sequence' },
        draggable: false,
        selectable: false
      },
      {
        id: 'am-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Patient Conversion' },
        draggable: false,
        selectable: false
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
        data: { icon: '🔬', label: 'Image Analysis', description: 'AI dental diagnostics' },
        draggable: false,
        selectable: false
      },
      {
        id: 'ia-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'Image Upload', details: 'X-rays, photos, CBCT scans' },
        draggable: false,
        selectable: false
      },
      {
        id: 'ia-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'AI Processing', details: 'Computer vision analysis' },
        draggable: false,
        selectable: false
      },
      {
        id: 'ia-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Quality Check', details: 'Image clarity validation' },
        draggable: false,
        selectable: false
      },
      {
        id: 'ia-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Findings?' },
        draggable: false,
        selectable: false
      },
      {
        id: 'ia-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Generate Report', details: 'Detailed analysis summary' },
        draggable: false,
        selectable: false
      },
      {
        id: 'ia-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Flag for Review', details: 'Manual dentist review' },
        draggable: false,
        selectable: false
      },
      {
        id: 'ia-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Diagnostic Report' },
        draggable: false,
        selectable: false
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
        data: { icon: '📊', label: 'Data Migration', description: 'Legacy system integration' },
        draggable: false,
        selectable: false
      },
      {
        id: 'dm-2',
        type: 'process',
        position: { x: 50, y: 150 },
        data: { label: 'File Upload', details: 'CSV, Excel, database exports' },
        draggable: false,
        selectable: false
      },
      {
        id: 'dm-3',
        type: 'process',
        position: { x: 200, y: 150 },
        data: { label: 'Field Mapping', details: 'AI-assisted field matching' },
        draggable: false,
        selectable: false
      },
      {
        id: 'dm-4',
        type: 'process',
        position: { x: 350, y: 150 },
        data: { label: 'Data Validation', details: 'Quality checks and cleanup' },
        draggable: false,
        selectable: false
      },
      {
        id: 'dm-5',
        type: 'decision',
        position: { x: 200, y: 250 },
        data: { label: 'Valid Data?' },
        draggable: false,
        selectable: false
      },
      {
        id: 'dm-6',
        type: 'process',
        position: { x: 100, y: 350 },
        data: { label: 'Import Records', details: 'Batch processing with conflict handling' },
        draggable: false,
        selectable: false
      },
      {
        id: 'dm-7',
        type: 'process',
        position: { x: 300, y: 350 },
        data: { label: 'Error Report', details: 'Show validation issues' },
        draggable: false,
        selectable: false
      },
      {
        id: 'dm-8',
        type: 'result',
        position: { x: 200, y: 450 },
        data: { label: 'Migration Complete' },
        draggable: false,
        selectable: false
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
            nodeTypes={nodeTypes}
            fitView
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            style={{ backgroundColor: 'transparent' }}
            defaultEdgeOptions={{
              style: { strokeWidth: 3, stroke: 'hsl(var(--primary))' },
              markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' }
            }}
          >
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