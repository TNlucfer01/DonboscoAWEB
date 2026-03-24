// ─── AttendanceStatusBadge (features/shared) ─────────────────────────────────
// BUG-006: Added rounded-full pill shape
// BUG-033: Shows human-readable label, code used as aria-label

const STATUS_COLORS: Record<string, string> = {
    P:  'bg-green-100 border-green-300 text-green-800',
    A:  'bg-red-100 border-red-300 text-red-800',
    OD: 'bg-blue-100 border-blue-300 text-blue-800',
    IL: 'bg-yellow-100 border-yellow-300 text-yellow-800',
};

const STATUS_LABELS: Record<string, string> = {
    P:  'Present',
    A:  'Absent',
    OD: 'On Duty',
    IL: 'Inf. Leave',
};

const DEFAULT_COLOR = 'bg-muted/20 border-border text-foreground';

export function AttendanceStatusBadge({ status }: { status: string }) {
    return (
        <span
            aria-label={status}
            className={`inline-block px-3 py-1 border rounded-full text-xs font-semibold ${
                STATUS_COLORS[status] ?? DEFAULT_COLOR
            }`}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}
