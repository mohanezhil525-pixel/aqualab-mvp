import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLabContext } from '../context/LabContext';

export const Compliance = () => {
  const { auditLogs } = useLabContext();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Compliance & Audit Trail</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>System Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white border border-white/20">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>{log.entity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
