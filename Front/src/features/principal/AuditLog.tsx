import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { PageProps } from '../shared/types';
import { DatePickerField } from '../shared/DatePickerField';
import { useAuditLog } from '../../hooks/useAuditLog';

export default function AuditLog({ user, onLogout }: PageProps) {
    const { logs, loading, startDate, endDate, setStartDate, setEndDate, applyFilter, clearFilter } = useAuditLog();

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6">
                <h1 className="text-2xl text-slate-800">Audit Log</h1>

                {/* Date Range Filter */}
                <Card className="border-2 border-slate-300">
                    <CardHeader><CardTitle className="text-slate-800">Filter by Date Range</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <DatePickerField date={startDate} onDateChange={setStartDate} label="Start Date" />
                            <DatePickerField date={endDate} onDateChange={setEndDate} label="End Date" />
                            <Button onClick={applyFilter} className="bg-slate-700 hover:bg-slate-800 text-white">Apply Filter</Button>
                            <Button onClick={clearFilter} variant="outline" className="border-slate-300 text-slate-700">Clear Filter</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs Table */}
                <Card className="border-2 border-slate-300">
                    <CardHeader>
                        <CardTitle className="text-slate-800">Attendance Changes Log</CardTitle>
                        <p className="text-sm text-slate-600">All changes made by Principal — Read only, no undo</p>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-slate-500 text-sm">Loading…</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 border-2 border-slate-300">
                                            {['Timestamp', 'Student', 'Roll No', 'Date', 'Period', 'Old Status', 'New Status', 'Changed By'].map((h) => (
                                                <th key={h} className="border border-slate-300 px-4 py-3 text-left text-slate-700">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr key={log.id} className="border border-slate-300 hover:bg-slate-50">
                                                <td className="border border-slate-300 px-4 py-3 text-slate-700">{log.timestamp}</td>
                                                <td className="border border-slate-300 px-4 py-3 text-slate-700">{log.student}</td>
                                                <td className="border border-slate-300 px-4 py-3 text-slate-700">{log.rollNo}</td>
                                                <td className="border border-slate-300 px-4 py-3 text-slate-700">{log.dateOfPeriod}</td>
                                                <td className="border border-slate-300 px-4 py-3 text-slate-700">{log.period}</td>
                                                <td className="border border-slate-300 px-4 py-3">
                                                    <span className="inline-block px-2 py-1 bg-red-100 border border-red-300 text-red-800 text-sm">{log.oldStatus}</span>
                                                </td>
                                                <td className="border border-slate-300 px-4 py-3">
                                                    <span className="inline-block px-2 py-1 bg-green-100 border border-green-300 text-green-800 text-sm">{log.newStatus}</span>
                                                </td>
                                                <td className="border border-slate-300 px-4 py-3 text-slate-700">{log.changedBy}</td>
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
