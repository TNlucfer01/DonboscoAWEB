// ─── AttendanceStatusBadge (features/shared) ─────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    P: 'bg-green-100 border-green-300 text-green-800',
    A: 'bg-red-100 border-red-300 text-red-800',
    OD: 'bg-blue-100 border-blue-300 text-blue-800',
    IL: 'bg-yellow-100 border-yellow-300 text-yellow-800',
};
const DEFAULT_COLOR = 'bg-muted/20 border-border text-foreground';

export function AttendanceStatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-block px-3 py-1 border ${STATUS_COLORS[status] ?? DEFAULT_COLOR}`}>
            {status}
        </span>
    );
}
