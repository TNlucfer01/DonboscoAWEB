// Renders the full attendance table for a list of students.
// Uses AttendanceStatusBadge for per-period status cells.

import { Student } from './attendanceView.types';
import { AttendanceStatusBadge } from './AttendanceStatusBadge';

interface AttendanceTableProps {
    students: Student[];
}

const PERIODS = ['period1', 'period2', 'period3', 'period4', 'period5'] as const;

export function AttendanceTable({ students }: AttendanceTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-slate-100 border-2 border-slate-300">
                        <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">S.No</th>
                        <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Roll No</th>
                        <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Name</th>
                        <th className="border border-slate-300 px-4 py-3 text-left text-slate-700">Batch</th>
                        {PERIODS.map((_, i) => (
                            <th key={i} className="border border-slate-300 px-4 py-3 text-center text-slate-700">
                                Period {i + 1}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.id} className="border border-slate-300 hover:bg-slate-50">
                            <td className="border border-slate-300 px-4 py-3 text-slate-700">{student.sno}</td>
                            <td className="border border-slate-300 px-4 py-3 text-slate-700">{student.rollNo}</td>
                            <td className="border border-slate-300 px-4 py-3 text-slate-700">{student.name}</td>
                            <td className="border border-slate-300 px-4 py-3 text-slate-700">{student.batch}</td>
                            {PERIODS.map((period) => (
                                <td key={period} className="border border-slate-300 px-4 py-3 text-center">
                                    <AttendanceStatusBadge status={student[period]} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
