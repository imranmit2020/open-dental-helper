import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Brain, 
  Activity, Zap, Sparkles, Users, Volume2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Participant {
  id: string;
  name: string;
  position: [number, number, number];
  emotion: 'happy' | 'focused' | 'confused' | 'excited';
  brainActivity: number;
  isAI?: boolean;
}

const HolographicAvatar = ({ participant, onClick }: { participant: Participant; onClick: () => void }) => {
  const colors = {
    happy: '#4ade80',
    focused: '#3b82f6', 
    confused: '#f59e0b',
    excited: '#ec4899'
  };

  return (
    <group position={participant.position} onClick={onClick}>
      <Sphere args={[0.5]} position={[0, 1, 0]}>
        <meshStandardMaterial 
          color={colors[participant.emotion]} 
          emissive={colors[participant.emotion]} 
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </Sphere>
      <Box args={[0.8, 1.5, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={participant.isAI ? '#9333ea' : '#1f2937'} 
          transparent 
          opacity={0.6}
        />
      </Box>
      <Text
        position={[0, -1, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {participant.name}
      </Text>
      <Text
        position={[0, -1.3, 0]}
        fontSize={0.15}
        color={colors[participant.emotion]}
        anchorX="center"
        anchorY="middle"
      >
        {Math.round(participant.brainActivity)}% Brain Activity
      </Text>
    </group>
  );
};

export const HolographicVideoCall = () => {
  const { toast } = useToast();
  const [isCallActive, setIsCallActive] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [spatialAudio, setSpatialAudio] = useState(true);
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Dr. Sarah',
      position: [-2, 0, 0],
      emotion: 'focused',
      brainActivity: 78,
    },
    {
      id: '2', 
      name: 'Mike Chen',
      position: [2, 0, 0],
      emotion: 'happy',
      brainActivity: 65,
    },
    {
      id: '3',
      name: 'AI Assistant',
      position: [0, 0, -2],
      emotion: 'excited',
      brainActivity: 95,
      isAI: true,
    }
  ]);

  const [callMetrics, setCallMetrics] = useState({
    engagement: 87,
    collaboration: 92,
    productivity: 85,
    mood: 'Positive'
  });

  useEffect(() => {
    if (!isCallActive) return;

    const interval = setInterval(() => {
      setParticipants(prev => prev.map(p => ({
        ...p,
        brainActivity: Math.max(30, Math.min(100, p.brainActivity + (Math.random() - 0.5) * 10)),
        emotion: Math.random() > 0.9 ? 
          (['happy', 'focused', 'confused', 'excited'] as const)[Math.floor(Math.random() * 4)] : 
          p.emotion
      })));

      setCallMetrics(prev => ({
        ...prev,
        engagement: Math.max(60, Math.min(100, prev.engagement + (Math.random() - 0.5) * 5)),
        collaboration: Math.max(70, Math.min(100, prev.collaboration + (Math.random() - 0.5) * 3)),
        productivity: Math.max(60, Math.min(100, prev.productivity + (Math.random() - 0.5) * 4))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isCallActive]);

  const startHolographicCall = () => {
    setIsCallActive(true);
    toast({
      title: "🌟 Holographic Call Started",
      description: "Neural sync established with all participants",
    });
  };

  const endCall = () => {
    setIsCallActive(false);
    toast({
      title: "Call Ended",
      description: `Session insights: ${callMetrics.engagement}% engagement`,
    });
  };

  const selectParticipant = (participant: Participant) => {
    toast({
      title: `Connected to ${participant.name}`,
      description: `Brain activity: ${participant.brainActivity}% | Mood: ${participant.emotion}`,
    });
  };

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-6 w-6 text-cyan-400" />
          Holographic Collaboration Space
          <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Call Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {!isCallActive ? (
              <Button 
                onClick={startHolographicCall}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <Zap className="h-4 w-4 mr-2" />
                Enter Holospace
              </Button>
            ) : (
              <>
                <Button
                  variant={micEnabled ? "default" : "destructive"}
                  size="sm"
                  onClick={() => setMicEnabled(!micEnabled)}
                >
                  {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant={cameraEnabled ? "default" : "destructive"}
                  size="sm"
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                >
                  {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant={spatialAudio ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSpatialAudio(!spatialAudio)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={endCall}
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          
          {isCallActive && (
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                Neural Sync Active
              </Badge>
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {participants.length} Connected
              </Badge>
            </div>
          )}
        </div>

        {/* 3D Holographic Space */}
        {isCallActive && (
          <div className="h-96 bg-black rounded-lg border border-cyan-500 overflow-hidden">
            <Canvas camera={{ position: [0, 2, 5] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <pointLight position={[-10, -10, -10]} color="#9333ea" />
              
              {participants.map(participant => (
                <HolographicAvatar 
                  key={participant.id} 
                  participant={participant}
                  onClick={() => selectParticipant(participant)}
                />
              ))}
              
              {/* Central collaboration orb */}
              <Sphere args={[0.3]} position={[0, 0, 0]}>
                <meshStandardMaterial 
                  color="#06b6d4" 
                  emissive="#06b6d4" 
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.6}
                />
              </Sphere>
              
              <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
            </Canvas>
          </div>
        )}

        {/* AI Insights Panel */}
        {isCallActive && aiInsightsEnabled && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 p-3 rounded border border-green-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-green-300">Engagement</span>
                <Brain className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-lg font-bold text-green-400">{callMetrics.engagement}%</div>
              <Progress value={callMetrics.engagement} className="h-1 mt-1" />
            </div>
            
            <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 p-3 rounded border border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-300">Collaboration</span>
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-blue-400">{callMetrics.collaboration}%</div>
              <Progress value={callMetrics.collaboration} className="h-1 mt-1" />
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-3 rounded border border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-purple-300">Productivity</span>
                <Zap className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-purple-400">{callMetrics.productivity}%</div>
              <Progress value={callMetrics.productivity} className="h-1 mt-1" />
            </div>
            
            <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 p-3 rounded border border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-yellow-300">Team Mood</span>
                <Activity className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="text-lg font-bold text-yellow-400">{callMetrics.mood}</div>
              <div className="text-xs text-yellow-300 mt-1">AI Detected</div>
            </div>
          </div>
        )}

        {/* Participant Brain Activity */}
        {isCallActive && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-cyan-300">Neural Activity Monitor</h4>
            {participants.map(participant => (
              <div key={participant.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-600">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full animate-pulse ${
                    participant.isAI ? 'bg-purple-400' : 'bg-cyan-400'
                  }`} />
                  <span className="text-sm">{participant.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {participant.emotion}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={participant.brainActivity} className="w-20 h-2" />
                  <span className="text-xs text-slate-300">{participant.brainActivity}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};