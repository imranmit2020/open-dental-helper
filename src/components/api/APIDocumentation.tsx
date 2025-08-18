import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, Copy, ExternalLink, BookOpen, Key, Calendar, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = 'https://nqrwtihwuvyfucmbcsem.supabase.co/functions/v1';

export function APIDocumentation() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/appointments',
      description: 'Retrieve appointments',
      permissions: ['appointments:read'],
      params: [
        { name: 'date', type: 'string', description: 'Filter by date (YYYY-MM-DD)' },
        { name: 'patient_id', type: 'uuid', description: 'Filter by patient ID' },
        { name: 'status', type: 'string', description: 'Filter by status (scheduled, completed, cancelled)' }
      ]
    },
    {
      method: 'POST',
      path: '/appointments',
      description: 'Create a new appointment',
      permissions: ['appointments:write'],
      body: {
        patient_id: 'uuid',
        dentist_id: 'uuid',
        title: 'string',
        appointment_date: 'datetime',
        duration: 'number'
      }
    },
    {
      method: 'GET',
      path: '/patients',
      description: 'Retrieve patients',
      permissions: ['patients:read'],
      params: [
        { name: 'search', type: 'string', description: 'Search by name or email' },
        { name: 'limit', type: 'number', description: 'Number of results (max 100)' }
      ]
    },
    {
      method: 'POST',
      path: '/patients',
      description: 'Create a new patient',
      permissions: ['patients:write'],
      body: {
        first_name: 'string',
        last_name: 'string',
        email: 'string',
        phone: 'string',
        date_of_birth: 'date'
      }
    }
  ];

  const codeExamples = {
    javascript: `// Using fetch API
const response = await fetch('${API_BASE_URL}/appointments', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const appointments = await response.json();`,
    
    curl: `curl -X GET "${API_BASE_URL}/appointments" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    
    python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('${API_BASE_URL}/appointments', headers=headers)
appointments = response.json()`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">API Documentation</h2>
        <p className="text-muted-foreground">Complete guide to integrate with our calendar API</p>
      </div>

      {/* Quick Start */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Get started with our API in minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Generate API Key</p>
                <p className="text-xs text-muted-foreground">Create an API key with required permissions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Make Requests</p>
                <p className="text-xs text-muted-foreground">Include your API key in the Authorization header</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Handle Responses</p>
                <p className="text-xs text-muted-foreground">Process JSON responses and handle errors</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Base URL</h4>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
              <code>{API_BASE_URL}</code>
              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(API_BASE_URL)}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Authentication
          </CardTitle>
          <CardDescription>
            All API requests require authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Include your API key in the Authorization header using Bearer authentication:
          </p>
          <div className="space-y-2">
            <div className="bg-muted rounded-lg p-3">
              <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
              <Button 
                size="sm" 
                variant="ghost" 
                className="ml-2"
                onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY')}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Security:</strong> Keep your API keys secure and never expose them in client-side code.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            API Endpoints
          </CardTitle>
          <CardDescription>
            Available endpoints and their usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="space-y-3 pb-6 border-b border-border last:border-b-0">
                <div className="flex items-center gap-3">
                  <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono">{endpoint.path}</code>
                </div>
                
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Required Permissions:</h5>
                  <div className="flex gap-2">
                    {endpoint.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                {endpoint.params && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Query Parameters:</h5>
                    <div className="space-y-1">
                      {endpoint.params.map((param) => (
                        <div key={param.name} className="text-sm">
                          <code className="bg-muted px-1 rounded">{param.name}</code>
                          <span className="text-muted-foreground"> ({param.type})</span>
                          <span className="ml-2">{param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {endpoint.body && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Request Body:</h5>
                    <div className="bg-muted rounded-lg p-3">
                      <pre className="text-sm">
                        {JSON.stringify(endpoint.body, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Code Examples
          </CardTitle>
          <CardDescription>
            Sample code in different programming languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript" className="space-y-4">
            <TabsList>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            {Object.entries(codeExamples).map(([language, code]) => (
              <TabsContent key={language} value={language}>
                <div className="relative">
                  <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
                    <code>{code}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(code)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Format */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Response Format</CardTitle>
          <CardDescription>
            All responses are returned in JSON format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Success Response (200)</h4>
            <div className="bg-muted rounded-lg p-3">
              <pre className="text-sm">
{`{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Dental Checkup",
      "patient_id": "456e7890-e89b-12d3-a456-426614174000",
      "appointment_date": "2024-01-15T10:00:00Z",
      "status": "scheduled"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}`}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Error Response (4xx/5xx)</h4>
            <div className="bg-muted rounded-lg p-3">
              <pre className="text-sm">
{`{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid",
    "details": {}
  }
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
          <CardDescription>
            API usage limits and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">1000</div>
              <div className="text-sm text-muted-foreground">Requests per hour</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">5MB</div>
              <div className="text-sm text-muted-foreground">Max request size</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">30s</div>
              <div className="text-sm text-muted-foreground">Request timeout</div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> Use the X-RateLimit headers in responses to monitor your usage and avoid hitting limits.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}