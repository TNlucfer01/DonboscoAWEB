import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import { DatePickerField } from '../shared/DatePickerField';
import { useAuditLog } from './hooks/useAuditLog';

export default function AuditLog({ user, onLogout }: PageProps) {
    const { logs, loading, startDate, endDate, setStartDate, setEndDate, applyFilter, clearFilter } = useAuditLog();

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-foreground">Audit Log</h1>

                {/* Date Range Filter */}
                <Card className="border-2 border-border">
                    <CardHeader><CardTitle className="text-foreground">Filter by Date Range</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <DatePickerField date={startDate} onDateChange={setStartDate} label="Start Date" />
                            <DatePickerField date={endDate} onDateChange={setEndDate} label="End Date" />
                            <Button onClick={applyFilter} className="bg-primary hover:bg-primary/90 text-primary-foreground hover:bg-primary/90 text-white">Apply Filter</Button>
                            <Button onClick={clearFilter} variant="outline" className="border-border text-foreground opacity-90">Clear Filter</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs Table */}
                <Card className="border-2 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Attendance Changes Log</CardTitle>
                        <p className="text-sm text-muted-foreground font-medium">All changes made by Principal — Read only, no undo</p>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-muted-foreground text-sm">Loading…</p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-border bg-background">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/30 border-b border-border">
                                        <tr>
                                            {['Timestamp', 'Student', 'Roll No', 'Date', 'Period', 'Old Status', 'New Status', 'Changed By'].map((h) => (
                                                <th key={h} className="px-6 py-4 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
                                                <td className="px-6 py-4 text-muted-foreground font-medium text-xs">{log.timestamp}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-foreground opacity-90">{log.student}</td>
                                                <td className="px-6 py-4 text-foreground font-semibold whitespace-nowrap">{log.rollNo}</td>
                                                <td className="px-6 py-4 text-muted-foreground font-medium text-xs">{log.dateOfPeriod}</td>
                                                <td className="px-6 py-4 text-muted-foreground font-medium text-xs">{log.period}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-2 py-1 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold rounded-md">{log.oldStatus}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-2 py-1 bg-primary/10 border border-primary/20 text-primary text-sm font-bold rounded-md">{log.newStatus}</span>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground font-medium text-xs">{log.changedBy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
