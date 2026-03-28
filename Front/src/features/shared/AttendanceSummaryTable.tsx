// features/shared/AttendanceSummaryTable.tsx
// Standalone attendance summary table component.
// Shows rows: Year 1, Year 2, Year 3, Year 4, Grand Total
// Columns: Year | Present | Absent | Total
// Clicking Present/Absent cell triggers onCellClick(year, status).

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { DatePickerField } from './DatePickerField';
import { Loader2 } from 'lucide-react';
import { fetchYearSummaryTable, YearSummaryRow } from '../../api/attendanceSummary.api';

interface Props {
    /** If provided, only this year's row is shown (YC mode). Omit for Principal (all years). */
    scopedYear?: number;
    onCellClick: (year: number, status: 'PRESENT' | 'ABSENT', date: string) => void;
}

export function AttendanceSummaryTable({ scopedYear, onCellClick }: Props) {
    const [date, setDate] = useState<Date>(new Date());
    const [rows, setRows] = useState<YearSummaryRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!date) return;
        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                const dateStr = format(date, 'yyyy-MM-dd');
                const data = await fetchYearSummaryTable(dateStr, scopedYear);
                setRows(data);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [date, scopedYear]);

    // Grand total computed on frontend
    const grandTotal = rows.reduce(
        (acc, r) => ({
            total: acc.total + Number(r.total),
            present: acc.present + Number(r.present),
            absent: acc.absent + Number(r.absent),
        }),
        { total: 0, present: 0, absent: 0 }
    );

    const cellBase =
        'px-4 py-3 text-center text-sm font-semibold cursor-pointer transition-all duration-150 rounded-md';
    const presentCell = `${cellBase} text-green-700 hover:bg-green-100 hover:scale-105`;
    const absentCell = `${cellBase} text-red-600 hover:bg-red-100 hover:scale-105`;

    return (
        <Card className="border-none shadow-sm shadow-black/5 bg-card overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-foreground text-base font-bold">
                    Daily Attendance Summary
                </CardTitle>
                <DatePickerField
                    date={date}
                    onDateChange={(d) => d && setDate(d)}
                    label=""
                    maxDate={new Date()}
                />
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                        <Loader2 className="animate-spin w-5 h-5" />
                        <span className="text-sm">Loading…</span>
                    </div>
                ) : error ? (
                    <p className="text-destructive text-sm p-4">{error}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/20 border-b border-border">
                                    <th className="px-4 py-3 text-left text-muted-foreground font-bold uppercase text-[11px] tracking-wider">
                                        Year
                                    </th>
                                    <th className="px-4 py-3 text-center text-green-700 font-bold uppercase text-[11px] tracking-wider">
                                        Present
                                    </th>
                                    <th className="px-4 py-3 text-center text-red-600 font-bold uppercase text-[11px] tracking-wider">
                                        Absent
                                    </th>
                                    <th className="px-4 py-3 text-center text-muted-foreground font-bold uppercase text-[11px] tracking-wider">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                                            No attendance data for {format(date, 'dd MMM yyyy')}
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((r) => (
                                        <tr
                                            key={r.year}
                                            className="hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="px-4 py-3 font-bold text-foreground">
                                                Year {r.year}
                                            </td>
                                            <td
                                                className={presentCell}
                                                title="Click to see present students"
                                                onClick={() => onCellClick(r.year, 'PRESENT', format(date, 'yyyy-MM-dd'))}
                                            >
                                                {r.present}
                                            </td>
                                            <td
                                                className={absentCell}
                                                title="Click to see absent students"
                                                onClick={() => onCellClick(r.year, 'ABSENT', format(date, 'yyyy-MM-dd'))}
                                            >
                                                {r.absent}
                                            </td>
                                            <td className="px-4 py-3 text-center text-foreground font-medium">
                                                {r.total}
                                            </td>
                                        </tr>
                                    ))
                                )}

                                {/* Grand Total row */}
                                {rows.length > 0 && (
                                    <tr className="bg-muted/40 border-t-2 border-border font-black">
                                        <td className="px-4 py-3 text-foreground text-[12px] uppercase tracking-wider">
                                            Grand Total
                                        </td>
                                        <td className="px-4 py-3 text-center text-green-700">
                                            {grandTotal.present}
                                        </td>
                                        <td className="px-4 py-3 text-center text-red-600">
                                            {grandTotal.absent}
                                        </td>
                                        <td className="px-4 py-3 text-center text-foreground">
                                            {grandTotal.total}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
