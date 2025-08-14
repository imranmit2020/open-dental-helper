import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Play, AlertCircle, CheckCircle, Database, Download, FileText, FileSpreadsheet, Table as TableIcon, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminSQLQuery() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [tables, setTables] = useState<any[] | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
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

  const exportToCSV = () => {
    if (!results || results.length === 0) {
      toast({
        title: "No Data",
        description: "No results to export",
        variant: "destructive"
      });
      return;
    }

    const columns = Object.keys(results[0]);
    const csvContent = [
      columns.join(','),
      ...results.map(row => 
        columns.map(col => {
          const value = row[col];
          if (value === null) return '';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "CSV file has been downloaded",
      variant: "default"
    });
  };

  const exportToJSON = () => {
    if (!results || results.length === 0) {
      toast({
        title: "No Data",
        description: "No results to export",
        variant: "destructive"
      });
      return;
    }

    const jsonContent = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "JSON file has been downloaded",
      variant: "default"
    });
  };

  const exportToExcel = () => {
    if (!results || results.length === 0) {
      toast({
        title: "No Data",
        description: "No results to export",
        variant: "destructive"
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Query Results');
    
    XLSX.writeFile(workbook, `query-results-${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Export Complete",
      description: "Excel file has been downloaded",
      variant: "default"
    });
  };

  const exportSchemaToCSV = () => {
    if (!tables || tables.length === 0) {
      toast({
        title: "No Data",
        description: "No schema data to export",
        variant: "destructive"
      });
      return;
    }

    const tablesToExport = selectedTables.length > 0 
      ? tables.filter(table => selectedTables.includes(table.name))
      : tables;

    if (tablesToExport.length === 0) {
      toast({
        title: "No Tables Selected",
        description: "Please select at least one table to export",
        variant: "destructive"
      });
      return;
    }

    // Flatten the schema data for CSV export
    const schemaData = tablesToExport.flatMap(table => 
      table.columns.map((column: any) => ({
        table_name: table.table_name,
        column_name: column.name,
        data_type: column.type,
        is_nullable: column.nullable ? 'YES' : 'NO',
        column_default: column.default || ''
      }))
    );

    const columns = ['table_name', 'column_name', 'data_type', 'is_nullable', 'column_default'];
    const csvContent = [
      columns.join(','),
      ...schemaData.map(row => 
        columns.map(col => {
          const value = row[col as keyof typeof row];
          if (value === null || value === undefined) return '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database-schema-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Schema exported to CSV file",
      variant: "default"
    });
  };

  const exportSchemaToJSON = () => {
    if (!tables || tables.length === 0) {
      toast({
        title: "No Data",
        description: "No schema data to export",
        variant: "destructive"
      });
      return;
    }

    const tablesToExport = selectedTables.length > 0 
      ? tables.filter(table => selectedTables.includes(table.name))
      : tables;

    if (tablesToExport.length === 0) {
      toast({
        title: "No Tables Selected",
        description: "Please select at least one table to export",
        variant: "destructive"
      });
      return;
    }

    const blob = new Blob([JSON.stringify(tablesToExport, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database-schema-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Schema exported to JSON file",
      variant: "default"
    });
  };

  const exportSchemaToExcel = () => {
    if (!tables || tables.length === 0) {
      toast({
        title: "No Data",
        description: "No schema data to export",
        variant: "destructive"
      });
      return;
    }

    const tablesToExport = selectedTables.length > 0 
      ? tables.filter(table => selectedTables.includes(table.name))
      : tables;

    if (tablesToExport.length === 0) {
      toast({
        title: "No Tables Selected",
        description: "Please select at least one table to export",
        variant: "destructive"
      });
      return;
    }

    const wb = XLSX.utils.book_new();
    
    // Create a summary sheet with selected tables and columns
    const schemaData = tablesToExport.flatMap(table => 
      table.columns.map((column: any) => ({
        table_name: table.name,
        column_name: column.name,
        data_type: column.type,
        is_nullable: column.nullable ? 'YES' : 'NO',
        column_default: column.default || ''
      }))
    );
    
    const summarySheet = XLSX.utils.json_to_sheet(schemaData);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Database Schema");
    
    // Create individual sheets for each selected table
    tablesToExport.forEach(table => {
      if (table.columns && table.columns.length > 0) {
        const tableData = table.columns.map((column: any) => ({
          column_name: column.name,
          data_type: column.type,
          is_nullable: column.nullable ? 'YES' : 'NO',
          column_default: column.default || ''
        }));
        
        const tableSheet = XLSX.utils.json_to_sheet(tableData);
        // Sanitize table name for sheet name (Excel has limitations)
        const sheetName = table.name.substring(0, 31).replace(/[\\\/\?\*\[\]]/g, '_');
        XLSX.utils.book_append_sheet(wb, tableSheet, sheetName);
      }
    });
    
    XLSX.writeFile(wb, `database-schema-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export Successful",
      description: `Schema exported to Excel file with ${tablesToExport.length} table(s)`,
      variant: "default"
    });
  };

  const handleTableSelection = (tableName: string, checked: boolean) => {
    if (checked) {
      setSelectedTables(prev => [...prev, tableName]);
    } else {
      setSelectedTables(prev => prev.filter(name => name !== tableName));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && tables) {
      setSelectedTables(tables.map(table => table.name));
    } else {
      setSelectedTables([]);
    }
  };

  const fetchDatabaseSchema = async () => {
    setLoadingTables(true);
    try {
      const schemaQuery = `
        SELECT 
          t.table_name,
          t.table_type,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          c.ordinal_position
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name, c.ordinal_position
      `;

      const { data, error: schemaError } = await supabase.rpc('exec_sql', {
        sql: schemaQuery
      });

      if (schemaError) {
        toast({
          title: "Schema Error",
          description: schemaError.message,
          variant: "destructive"
        });
      } else {
        // Group columns by table
        const tablesMap = new Map();
        if (Array.isArray(data)) {
          data.forEach((row: any) => {
            if (!tablesMap.has(row.table_name)) {
              tablesMap.set(row.table_name, {
                name: row.table_name,
                type: row.table_type,
                columns: []
              });
            }
            if (row.column_name) {
              tablesMap.get(row.table_name).columns.push({
                name: row.column_name,
                type: row.data_type,
                nullable: row.is_nullable === 'YES',
                default: row.column_default,
                position: row.ordinal_position
              });
            }
          });
        }
        setTables(Array.from(tablesMap.values()));
      }
    } catch (err: any) {
      toast({
        title: "Schema Fetch Error",
        description: err.message || 'Failed to fetch database schema',
        variant: "destructive"
      });
    } finally {
      setLoadingTables(false);
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
          <div className="flex items-center gap-2">
            <Badge variant="outline">{columns.length} columns</Badge>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={exportToCSV}>
                <FileText className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button size="sm" variant="outline" onClick={exportToJSON}>
                <FileText className="h-4 w-4 mr-1" />
                JSON
              </Button>
              <Button size="sm" variant="outline" onClick={exportToExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                Excel
              </Button>
            </div>
          </div>
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

      <Tabs defaultValue="query" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="query" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Query Editor
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex items-center gap-2" onClick={() => !tables && fetchDatabaseSchema()}>
            <TableIcon className="h-4 w-4" />
            Database Schema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="space-y-6">
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
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Security Notice:</strong> Only SELECT queries are allowed for security reasons.
                      Queries that modify data (INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, TRUNCATE) are strictly forbidden.
                    </AlertDescription>
                  </Alert>
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
        </TabsContent>

        <TabsContent value="schema" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Database Schema</h2>
              <p className="text-sm text-muted-foreground">
                Explore all tables and their column structures
              </p>
            </div>
            <div className="flex items-center gap-2">
              {tables && tables.length > 0 && (
                <div className="flex gap-1 mr-2">
                  <Button size="sm" variant="outline" onClick={exportSchemaToCSV}>
                    <FileText className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportSchemaToJSON}>
                    <FileText className="h-4 w-4 mr-1" />
                    JSON
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportSchemaToExcel}>
                    <FileSpreadsheet className="h-4 w-4 mr-1" />
                    Excel
                  </Button>
                </div>
              )}
              <Button 
                onClick={fetchDatabaseSchema} 
                disabled={loadingTables}
                variant="outline"
                size="sm"
              >
                {loadingTables ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {loadingTables ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tables ? (
            <div className="space-y-4">
              {/* Selection Controls */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all"
                          checked={tables.length > 0 && selectedTables.length === tables.length}
                          onCheckedChange={handleSelectAll}
                        />
                        <label htmlFor="select-all" className="text-sm font-medium">
                          Select All Tables ({tables.length})
                        </label>
                      </div>
                      {selectedTables.length > 0 && (
                        <Badge variant="outline">
                          {selectedTables.length} selected
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedTables.length === 0 
                        ? "Select tables to export specific schemas, or export all if none selected"
                        : `${selectedTables.length} table(s) will be exported`
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tables List */}
              <div className="grid gap-4">
              {tables.map((table) => (
                <Card key={table.name}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`table-${table.name}`}
                          checked={selectedTables.includes(table.name)}
                          onCheckedChange={(checked) => handleTableSelection(table.name, checked as boolean)}
                        />
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TableIcon className="h-5 w-5" />
                          {table.name}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary">{table.columns.length} columns</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Column</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Nullable</TableHead>
                            <TableHead>Default</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.columns.map((column: any) => (
                            <TableRow key={column.name}>
                              <TableCell className="font-medium">{column.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{column.type}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={column.nullable ? "secondary" : "destructive"}>
                                  {column.nullable ? "Yes" : "No"}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {column.default ? (
                                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                    {column.default}
                                  </code>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <TableIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Click "Refresh" to load database schema</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}