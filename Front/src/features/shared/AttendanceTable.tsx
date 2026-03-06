// ─── AttendanceTable (features/shared) ───────────────────────────────────────

import { AttendanceStudent, PERIOD_KEYS } from './attendance.types';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';

interface AttendanceTableProps {
    students: AttendanceStudent[];
}

export function AttendanceTable({ students }: AttendanceTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-slate-100 border-2 border-slate-300">
                        {['S.No', 'Roll No', 'Name', 'Batch', ...PERIOD_KEYS.map((_, i) => `Period ${i + 1}`)].map((h) => (
                            <th key={h} className={`border border-slate-300 px-4 py-3 text-slate-700 ${h.startsWith('Period') ? 'text-center' : 'text-left'}`}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {students.map((s) => (
                        <tr key={s.id} className="border border-slate-300 hover:bg-slate-50">
                            <td className="border border-slate-300 px-4 py-3 text-slate-700">{s.sno}</td>
                            <td className="border border-slate-300 px-4 py-3 text-slate-700">{s.rollNo}</td>
                            <td className="border border-slate-300 px-4 py-3 text-slate-700">{s.name}</td>
                            <td className="border border-slate-300 px-4 py-3 text-slate-700">{s.batch}</td>
                            {PERIOD_KEYS.map((pk) => (
                                <td key={pk} className="border border-slate-300 px-4 py-3 text-center">
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
