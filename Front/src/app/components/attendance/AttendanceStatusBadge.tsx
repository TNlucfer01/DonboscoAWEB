// Renders a colored badge for a single attendance status value.

interface AttendanceStatusBadgeProps {
    status: string;
}

const STATUS_COLORS: Record<string, string> = {
    P: 'bg-green-100 border-green-300 text-green-800',
    A: 'bg-red-100 border-red-300 text-red-800',
    OD: 'bg-blue-100 border-blue-300 text-blue-800',
    IL: 'bg-yellow-100 border-yellow-300 text-yellow-800',
};

const DEFAULT_COLOR = 'bg-slate-100 border-slate-300 text-slate-800';

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
    const colorClass = STATUS_COLORS[status] ?? DEFAULT_COLOR;
    return (
        <span className={`inline-block px-3 py-1 border ${colorClass}`}>
            {status}
        </span>
    );
}
