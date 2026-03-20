// ─── AttendanceTable (features/shared) ───────────────────────────────────────

import { AttendanceStudent, PERIOD_KEYS } from './attendance.types';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import { StudentDetailsDialog } from './StudentDetailsDialog';

interface AttendanceTableProps {
    students: AttendanceStudent[];
}

export function AttendanceTable({ students }: AttendanceTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
            <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border">
                    <tr>
                        {['S.No', 'Roll No', 'Name', 'Batch', ...PERIOD_KEYS.map((_, i) => `Period ${i + 1}`)].map((h) => (
                            <th key={h} className={`px-6 py-4 text-muted-foreground font-bold uppercase text-[10px] tracking-wider ${h.startsWith('Period') ? 'text-center' : 'text-left'}`}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                    {students.map((s) => (
                        <tr key={s.id} className="hover:bg-muted/20 transition-colors group">
                            <td className="px-6 py-4 text-muted-foreground font-medium text-xs">{s.sno}</td>
                            <td className="px-6 py-4 font-mono font-bold text-foreground opacity-90">{s.rollNo}</td>
                            <td className="px-6 py-4 text-foreground font-semibold whitespace-nowrap">
                                <StudentDetailsDialog studentId={s.id} studentName={s.name} />
                            </td>
                            <td className="px-6 py-4 text-muted-foreground font-medium text-xs">{s.batch}</td>
                            {PERIOD_KEYS.map((pk) => (
                                <td key={pk} className="px-6 py-4 text-center">
                                    <AttendanceStatusBadge status={s[pk]} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
