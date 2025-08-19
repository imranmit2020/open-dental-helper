import React, { useState } from 'react';
import { Eye, Camera, Video, Mic, Play, Download, Filter, Search, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdvancedSecurity, AuditTrailEntry } from '@/hooks/useAdvancedSecurity';

export function AdvancedAuditTrail() {
  const { auditTrail } = useAdvancedSecurity();
  const [selectedEntry, setSelectedEntry] = useState<AuditTrailEntry | null>(null);
  const [filterAction, setFilterAction] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: string; url: string } | null>(null);

  const getRiskColor = (score: number) => {
    if (score >= 7) return 'text-red-600 bg-red-100 border-red-300';
    if (score >= 4) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    return 'text-green-600 bg-green-100 border-green-300';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 7) return 'High Risk';
    if (score >= 4) return 'Medium Risk';
    return 'Low Risk';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('VIEW')) return <Eye className="h-4 w-4" />;
    if (action.includes('DELETE')) return <div className="h-4 w-4 bg-red-500 rounded-full" />;
    if (action.includes('CREATE')) return <div className="h-4 w-4 bg-green-500 rounded-full" />;
    if (action.includes('EDIT') || action.includes('UPDATE')) return <div className="h-4 w-4 bg-blue-500 rounded-full" />;
    return <div className="h-4 w-4 bg-gray-500 rounded-full" />;
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredAuditTrail = auditTrail.filter(entry => {
    const matchesAction = filterAction === 'all' || entry.action.toLowerCase().includes(filterAction.toLowerCase());
    const matchesRisk = filterRisk === 'all' || 
      (filterRisk === 'high' && entry.risk_score >= 7) ||
      (filterRisk === 'medium' && entry.risk_score >= 4 && entry.risk_score < 7) ||
      (filterRisk === 'low' && entry.risk_score < 4);
    const matchesSearch = searchTerm === '' || 
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAction && matchesRisk && matchesSearch;
  });

  const openMediaViewer = (type: string, url: string) => {
    setSelectedMedia({ type, url });
    setIsMediaViewerOpen(true);
  };

  const evidenceStats = {
    totalPhotos: auditTrail.reduce((sum, entry) => sum + entry.evidence_captured.photos.length, 0),
    totalVideos: auditTrail.reduce((sum, entry) => sum + entry.evidence_captured.videos.length, 0),
    totalScreenRecordings: auditTrail.reduce((sum, entry) => sum + entry.evidence_captured.screen_recordings.length, 0),
    totalAudioClips: auditTrail.reduce((sum, entry) => sum + entry.evidence_captured.audio_clips.length, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Eye className="h-7 w-7 text-indigo-500" />
            Advanced Audit Trail
          </h2>
          <p className="text-muted-foreground">Comprehensive activity monitoring with multimedia evidence</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-indigo-100 text-indigo-700">
            {auditTrail.length} Entries
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Evidence Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 text-center">
            <Camera className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{evidenceStats.totalPhotos}</div>
            <div className="text-sm text-purple-600">Photos Captured</div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <Video className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{evidenceStats.totalVideos}</div>
            <div className="text-sm text-blue-600">Videos Recorded</div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="h-8 w-8 bg-green-600 rounded mx-auto mb-2 flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-green-600">{evidenceStats.totalScreenRecordings}</div>
            <div className="text-sm text-green-600">Screen Recordings</div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <Mic className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{evidenceStats.totalAudioClips}</div>
            <div className="text-sm text-orange-600">Audio Clips</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Audit Trail Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search actions or resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Action Type</label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Risk Level</label>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Last 7 days
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAuditTrail.map((entry) => (
              <div 
                key={entry.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedEntry?.id === entry.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                } ${getRiskColor(entry.risk_score)}`}
                onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {entry.user_id.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getActionIcon(entry.action)}
                        <span className="font-semibold">{entry.action.replace(/_/g, ' ')}</span>
                        <Badge variant="outline" className="text-xs">
                          {getRiskLevel(entry.risk_score)}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        Resource: {entry.resource}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {entry.biometric_verification && (
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                            Biometric ✓
                          </Badge>
                        )}
                        {entry.device_trusted && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                            Trusted Device
                          </Badge>
                        )}
                        {entry.location_verified && (
                          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                            Location ✓
                          </Badge>
                        )}
                        {entry.anomaly_flags.map((flag, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-yellow-100 text-yellow-700">
                            {flag.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(entry.timestamp)} • Risk Score: {entry.risk_score.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {entry.evidence_captured.photos.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openMediaViewer('photo', entry.evidence_captured.photos[0]);
                        }}
                      >
                        <Camera className="h-3 w-3 mr-1" />
                        {entry.evidence_captured.photos.length}
                      </Button>
                    )}
                    
                    {entry.evidence_captured.videos.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openMediaViewer('video', entry.evidence_captured.videos[0]);
                        }}
                      >
                        <Video className="h-3 w-3 mr-1" />
                        {entry.evidence_captured.videos.length}
                      </Button>
                    )}
                    
                    {entry.evidence_captured.screen_recordings.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openMediaViewer('screen', entry.evidence_captured.screen_recordings[0]);
                        }}
                      >
                        <div className="h-3 w-3 bg-current rounded mr-1" />
                        {entry.evidence_captured.screen_recordings.length}
                      </Button>
                    )}
                  </div>
                </div>
                
                {selectedEntry?.id === entry.id && (
                  <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Security Verification</h4>
                        <div className="space-y-1 text-sm">
                          <div className={`flex items-center gap-2 ${entry.biometric_verification ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.biometric_verification ? '✓' : '✗'} Biometric Verification
                          </div>
                          <div className={`flex items-center gap-2 ${entry.device_trusted ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.device_trusted ? '✓' : '✗'} Device Trusted
                          </div>
                          <div className={`flex items-center gap-2 ${entry.location_verified ? 'text-green-600' : 'text-red-600'}`}>
                            {entry.location_verified ? '✓' : '✗'} Location Verified
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Evidence Captured</h4>
                        <div className="space-y-1 text-sm">
                          <div>Photos: {entry.evidence_captured.photos.length}</div>
                          <div>Videos: {entry.evidence_captured.videos.length}</div>
                          <div>Screen Recordings: {entry.evidence_captured.screen_recordings.length}</div>
                          <div>Audio Clips: {entry.evidence_captured.audio_clips.length}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Risk Assessment</h4>
                        <div className="space-y-1 text-sm">
                          <div>Risk Score: {entry.risk_score.toFixed(1)}/10</div>
                          <div>Level: {getRiskLevel(entry.risk_score)}</div>
                          {entry.anomaly_flags.length > 0 && (
                            <div>Anomalies: {entry.anomaly_flags.length}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {filteredAuditTrail.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No audit entries match your filters</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Media Viewer Dialog */}
      <Dialog open={isMediaViewerOpen} onOpenChange={setIsMediaViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMedia?.type === 'photo' && <Camera className="h-5 w-5" />}
              {selectedMedia?.type === 'video' && <Video className="h-5 w-5" />}
              {selectedMedia?.type === 'screen' && <div className="h-5 w-5 bg-current rounded" />}
              Evidence Viewer
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center bg-gray-100 rounded-lg min-h-[400px]">
            {selectedMedia?.type === 'photo' && (
              <div className="text-center">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Photo Evidence</p>
                <p className="text-sm text-gray-500">{selectedMedia.url}</p>
              </div>
            )}
            
            {selectedMedia?.type === 'video' && (
              <div className="text-center">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Video Evidence</p>
                <p className="text-sm text-gray-500">{selectedMedia.url}</p>
                <Button className="mt-4">
                  <Play className="h-4 w-4 mr-2" />
                  Play Video
                </Button>
              </div>
            )}
            
            {selectedMedia?.type === 'screen' && (
              <div className="text-center">
                <div className="h-16 w-16 bg-gray-400 rounded mx-auto mb-4" />
                <p className="text-gray-600">Screen Recording</p>
                <p className="text-sm text-gray-500">{selectedMedia.url}</p>
                <Button className="mt-4">
                  <Play className="h-4 w-4 mr-2" />
                  Play Recording
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}