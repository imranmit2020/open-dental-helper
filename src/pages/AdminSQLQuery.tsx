import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Play, AlertCircle, CheckCircle, Database } from 'lucide-react';

export default function AdminSQLQuery() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    // SEO meta tags
    document.title = "SQL Query Interface | Administration";
    
    const metaDescId = "meta-description-admin-sql";
    let meta = document.querySelector<HTMLMetaElement>(`meta[name='description']#${metaDescId}`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      meta.id = metaDescId;
      document.head.appendChild(meta);
    }
    meta.content = "Admin SQL query interface: execute and analyze database queries with real-time results.";

    // Canonical tag
    const canonicalHref = window.location.origin + "/admin/sql-query";
    let canonical = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalHref;
  }, []);

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a SQL query",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setExecutionTime(null);

    const startTime = Date.now();

    try {
      // Execute the query using the new database function
      const { data, error: queryError } = await supabase.rpc('exec_sql', {
        sql: query.trim()
      });

      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      if (queryError) {
        setError(queryError.message);
        toast({
          title: "Query Error",
          description: queryError.message,
          variant: "destructive"
        });
      } else {
        setResults(Array.isArray(data) ? data : []);
        toast({
          title: "Query Executed",
          description: `Query completed successfully in ${endTime - startTime}ms`,
          variant: "default"
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast({
        title: "Execution Error",
        description: err.message || 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "SELECT COUNT(*) as total_patients FROM patients;",
    "SELECT status, COUNT(*) as count FROM appointments GROUP BY status;",
    "SELECT first_name, last_name, created_at FROM patients ORDER BY created_at DESC LIMIT 10;",
    "SELECT DATE(created_at) as date, COUNT(*) as appointments FROM appointments WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date;"
  ];

  const renderResults = () => {
    if (!results) return null;

    if (results.length === 0) {
      return (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Query executed successfully but returned no results.
          </AlertDescription>
        </Alert>
      );
    }

    const columns = Object.keys(results[0]);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              {results.length} rows returned
              {executionTime && ` in ${executionTime}ms`}
            </span>
          </div>
          <Badge variant="outline">{columns.length} columns</Badge>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column} className="font-medium">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column} className="max-w-xs truncate">
                      {row[column] === null ? (
                        <span className="text-muted-foreground italic">null</span>
                      ) : typeof row[column] === 'object' ? (
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {JSON.stringify(row[column])}
                        </code>
                      ) : (
                        String(row[column])
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <main className="container mx-auto py-8 space-y-6">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">SQL Query Interface</h1>
        </div>
        <p className="text-muted-foreground">
          Execute read-only SQL queries against the database and view results in real-time.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Query Editor</CardTitle>
              <CardDescription>
                Write your SELECT statements here. Only read operations are allowed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="SELECT * FROM patients LIMIT 10;"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-32 font-mono text-sm"
                disabled={loading}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={executeQuery}
                  disabled={loading || !query.trim()}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {loading ? 'Executing...' : 'Execute Query'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setQuery('')}
                  disabled={loading}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Query Results</CardTitle>
              </CardHeader>
              <CardContent>
                {renderResults()}
              </CardContent>
            </Card>
          )}
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample Queries</CardTitle>
              <CardDescription>
                Click any query below to load it in the editor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {sampleQueries.map((sampleQuery, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto py-2 px-3"
                  onClick={() => setQuery(sampleQuery)}
                  disabled={loading}
                >
                  <code className="text-xs text-left whitespace-pre-wrap">
                    {sampleQuery}
                  </code>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Safety Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Only SELECT queries are allowed</p>
              <p>• No data modification possible</p>
              <p>• Query timeout: 30 seconds</p>
              <p>• Results limited to 1000 rows</p>
              <p>• Execution time is displayed</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}