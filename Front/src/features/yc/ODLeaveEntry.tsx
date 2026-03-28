import { useState, useMemo } from 'react';
import Layout from '../../app/components/Layout';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../app/components/ui/select';
import { PageProps } from '../shared/types';
import { DatePickerField } from '../shared/DatePickerField';
import { useODLeaveEntry } from './hooks/useODLeaveEntry';
import { format, addDays } from 'date-fns';
import { Lock, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'NONE', label: '—' },
    { value: 'OD', label: 'OD (On Duty)' },
    { value: 'INFORMED_LEAVE', label: 'IL (Informed Leave)' },
];

const statusBadge = (status: string | null) => {
    if (!status) return <span className="text-muted-foreground/40 text-xs">—</span>;
    const map: Record<string, string> = {
        OD: 'bg-blue-100 text-blue-700',
        INFORMED_LEAVE: 'bg-yellow-100 text-yellow-700',
    };
    const label: Record<string, string> = { OD: 'OD', INFORMED_LEAVE: 'IL' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${map[status] || ''}`}>
            {label[status] ?? status}
        </span>
    );
};

export default function ODLeaveEntry({ user, onLogout }: PageProps) {
    const { date, setDate, rows, loading, saving, isLocked, loadStudents, updateStatus, updateAllStatus, updateReason, submit } = useODLeaveEntry();
    const [search, setSearch] = useState('');

    // Tomorrow as min date — block today and past
    const tomorrow = addDays(new Date(), 1);

    const handleLoad = () => {
        if (date) loadStudents(date);
    };

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter(r =>
            r.roll_number.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
        );
    }, [rows, search]);

    const markedCount = rows.filter(r => 
        Object.values(r.periods).some(v => v === 'OD' || v === 'INFORMED_LEAVE')
    ).length;

    return (
        <Layout user={user} onLogout={onLogout}>
            <div className="space-y-6 max-w-full">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-foreground">OD / Informed Leave Entry</h1>
                    <p className="text-muted-foreground text-sm">
                        Select a date, load all students, mark OD/IL, then submit to lock entries.
                    </p>
                </div>

                {/* ── Step 1: Date Selection ─────────────────────────────── */}
                <Card className="border-none shadow-sm shadow-black/5 bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground opacity-60">
                            Step 1 — Select Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4 items-end">
                            <DatePickerField
                                date={date}
                                onDateChange={setDate}
                                label="Date (future only)"
                                minDate={tomorrow}
                            />
                            <Button
                                onClick={handleLoad}
                                disabled={!date || loading}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
                            >
                                {loading ? 'Loading…' : 'Load Students'}
                            </Button>
                        </div>
                        {!date && (
                            <p className="text-xs text-muted-foreground mt-3 flex gap-1 items-center">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                Only future dates are allowed for OD/IL entry.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* ── Step 2: Student Table ──────────────────────────────── */}
                {rows.length > 0 && (
                    <Card className="border-none shadow-xl shadow-black/5 bg-card overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/20 pb-5">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-foreground text-xl">
                                            {date && format(date, 'EEEE, MMMM d, yyyy')}
                                        </CardTitle>
                                        {isLocked ? (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                <Lock className="h-3 w-3" /> Submitted & Locked
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                                {markedCount} marked
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{rows.length} students loaded</p>
                                </div>

                                {/* Search */}
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search by roll no or name…"
                                        className="pl-9 h-10 rounded-xl border-border text-sm"
                                        disabled={isLocked}
                                    />
                                </div>
                            </div>
                        </CardHeader>

                        {/* Locked banner */}
                        {isLocked && (
                            <div className="flex items-center gap-3 px-6 py-3 bg-green-50/80 border-b border-green-100 text-green-800 text-sm font-medium">
                                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                OD/IL entries for this date have been submitted and locked. No further edits are allowed.
                            </div>
                        )}

                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/30 border-b border-border">
                                            <th className="px-2 py-3 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-wider w-12">#</th>
                                            <th className="px-2 py-3 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider min-w-[100px]">Roll No</th>
                                            <th className="px-2 py-3 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider min-w-[150px]">Name</th>
                                            {[1, 2, 3, 4, 5].map(p => (
                                                <th key={p} className="px-1 py-3 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-wider w-20">P{p}</th>
                                            ))}
                                            <th className="px-2 py-3 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider w-24 border-l border-border/50">Set All</th>
                                            <th className="px-2 py-3 text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider min-w-[200px]">Reason / Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {filteredRows.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="text-center py-10 text-muted-foreground italic bg-muted/5">
                                                    No students match your search.
                                                </td>
                                            </tr>
                                        ) : filteredRows.map((row, i) => {
                                            const hasAnyMarked = Object.values(row.periods).some(v => v === 'OD' || v === 'INFORMED_LEAVE');
                                            return (
                                            <tr
                                                key={row.student_id}
                                                className={`transition-colors ${
                                                    hasAnyMarked ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-muted/20'
                                                }`}
                                            >
                                                <td className="px-2 py-3 text-center text-muted-foreground text-xs font-medium">{i + 1}</td>
                                                <td className="px-2 py-3 font-mono font-bold text-foreground text-xs">{row.roll_number}</td>
                                                <td className="px-2 py-3 text-foreground text-xs font-medium whitespace-nowrap">{row.name}</td>
                                                
                                                {/* 5 Period Columns */}
                                                {[1, 2, 3, 4, 5].map(p => (
                                                    <td key={p} className="px-1 py-3 text-center">
                                                        {isLocked ? (
                                                            statusBadge(row.periods[p as keyof typeof row.periods])
                                                        ) : (
                                                            <Select
                                                                value={row.periods[p as keyof typeof row.periods] ?? 'NONE'}
                                                                onValueChange={v => updateStatus(row.student_id, p, v === 'NONE' ? null : v as 'OD' | 'INFORMED_LEAVE')}
                                                            >
                                                                <SelectTrigger className="h-7 w-16 mx-auto rounded border-border text-[10px] px-2 shadow-none focus:ring-0">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-popover border border-border min-w-[4rem]">
                                                                    <SelectItem value="NONE" className="text-[10px] justify-center">—</SelectItem>
                                                                    <SelectItem value="OD" className="text-[10px] font-bold text-blue-600 justify-center">OD</SelectItem>
                                                                    <SelectItem value="INFORMED_LEAVE" className="text-[10px] font-bold text-yellow-600 justify-center">IL</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </td>
                                                ))}

                                                {/* Set All Shortcut */}
                                                <td className="px-2 py-3 border-l border-border/50 text-center">
                                                    {!isLocked && (
                                                        <Select
                                                            value="NONE"
                                                            onValueChange={v => {
                                                                if (v === 'NONE') return;
                                                                updateAllStatus(row.student_id, v === 'RESET' ? null : v as 'OD' | 'INFORMED_LEAVE');
                                                            }}
                                                        >
                                                            <SelectTrigger className="h-7 w-20 rounded bg-muted/50 border-transparent hover:bg-muted text-[10px] px-2 shadow-none mx-auto">
                                                                <SelectValue placeholder="Set all..." />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-popover border border-border min-w-[5rem]">
                                                                <SelectItem value="NONE" className="hidden">Set all...</SelectItem>
                                                                <SelectItem value="OD" className="text-[10px] font-bold text-blue-600">All OD</SelectItem>
                                                                <SelectItem value="INFORMED_LEAVE" className="text-[10px] font-bold text-yellow-600">All IL</SelectItem>
                                                                <SelectItem value="RESET" className="text-[10px] text-muted-foreground italic">Reset All</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </td>

                                                {/* Reason Column */}
                                                <td className="px-2 py-3">
                                                    {isLocked ? (
                                                        <span className="text-xs text-muted-foreground">{row.od_reason || '—'}</span>
                                                    ) : (
                                                        <Input
                                                            value={row.od_reason}
                                                            onChange={e => updateReason(row.student_id, e.target.value)}
                                                            placeholder={hasAnyMarked ? 'e.g. Sports meet, Medical…' : ''}
                                                            disabled={!hasAnyMarked}
                                                            className="h-7 text-xs rounded border-border disabled:opacity-30 disabled:bg-muted/10 shadow-none focus-visible:ring-1"
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Submit bar */}
                            {!isLocked && (
                                <div className="px-6 py-5 border-t border-border/50 bg-muted/10 flex items-center justify-between gap-4">
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-bold text-foreground">{markedCount}</span> student(s) marked.
                                        Submitting will lock all entries for this date — this cannot be undone.
                                    </p>
                                    <Button
                                        onClick={submit}
                                        disabled={saving || markedCount === 0}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
                                    >
                                        {saving ? 'Saving…' : `Submit & Lock (${markedCount})`}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
