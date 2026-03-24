import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../app/components/ui/dialog';
import { apiClient } from '../../api/apiClient';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { SubjectDetailsDialog } from './SubjectDetailsDialog';

interface AttendanceRecord {
    date: string;
    slot_id: number;
    status: string;
    od_reason: string | null;
    subject_name: string | null;
    subject_id: number;
    slot_number: number | null;
    start_time: string | null;
}

export function StudentDetailsDialog({ studentId, studentName }: { studentId: number; studentName: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [error, setError] = useState('');

    const fetchDetails = async () => {
        if (!studentId) return;
        setLoading(true);
        setError('');
        try {
            const data = await apiClient.get<AttendanceRecord[]>(`/reports/by-student/${studentId}`);
            setRecords(data);
        } catch (err) {
            setError('Failed to load student details.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            fetchDetails();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button className="cursor-pointer text-left text-primary hover:text-primary/80 font-semibold decoration-primary/30 hover:underline underline-offset-4 outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded-md transition-all">
                    {studentName}
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col w-[95vw] border-border bg-card/95 backdrop-blur-md rounded-3xl p-0 shadow-2xl focus:outline-none">
                <DialogHeader className="p-6 sm:p-8 border-b border-border bg-muted/20">
                    <DialogTitle className="text-3xl sm:text-4xl font-black text-foreground tracking-tight flex items-baseline gap-3">
                        <span className="opacity-40 font-bold text-sm uppercase tracking-widest block mb-1">Analytics Intelligence</span>
                        <div className="flex-1 flex flex-wrap items-baseline gap-2">
                            <span>Student:</span> 
                            <span className="text-primary underline decoration-primary/20 underline-offset-8">{studentName}</span>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-10 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-20 space-y-4">
                            <Loader2 className="animate-spin text-primary h-10 w-10" />
                            <p className="text-muted-foreground font-medium text-sm animate-pulse">Loading analytics...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                            <p className="text-destructive font-bold">{error}</p>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border">
                            <p className="text-muted-foreground text-lg font-semibold">No attendance records found.</p>
                            <p className="text-muted-foreground/60 text-sm mt-1">This student hasn't been marked in any class yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 mt-2">
                            {/* Analytics Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 overflow-hidden bg-card rounded-2xl border border-border shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-border">
                                <div className="p-5 sm:p-6 bg-primary/5 flex flex-col justify-center items-center text-center transition-colors hover:bg-primary/10">
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Total Classes</p>
                                    <p className="text-4xl font-black text-foreground">{records.length}</p>
                                </div>
                                <div className="p-5 sm:p-6 bg-primary/5 flex flex-col justify-center items-center text-center transition-colors hover:bg-primary/10">
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Present / OD / IL</p>
                                    <p className="text-4xl font-black text-primary/80">
                                        {records.filter(r => ['PRESENT', 'OD', 'INFORMED_LEAVE'].includes(r.status)).length}
                                    </p>
                                </div>
                                <div className="p-5 sm:p-6 bg-primary/10 flex flex-col justify-center items-center text-center transition-colors hover:bg-primary/20">
                                    <p className="text-[11px] text-primary/80 uppercase tracking-widest font-bold mb-2">Overall %</p>
                                    <p className="text-5xl font-black text-primary">
                                        {records.length > 0 ? Math.round((records.filter(r => ['PRESENT', 'OD', 'INFORMED_LEAVE'].includes(r.status)).length / records.length) * 100) : 0}%
                                    </p>
                                </div>
                            </div>
                            
                            {/* Recent History Section */}
                            <div>
                                <h3 className="font-extrabold text-foreground tracking-tight text-lg mb-4 px-1 flex items-center gap-2">
                                    Recent History 
                                    <span className="text-muted-foreground text-xs font-semibold px-2 py-0.5 bg-muted rounded-full">Last 50</span>
                                </h3>
                                <div className="overflow-x-auto rounded-2xl border border-border bg-background/50 shadow-inner">
                                    <table className="w-full text-sm text-left whitespace-nowrap border-separate border-spacing-0">
                                        <thead className="bg-muted/60 sticky top-0 z-10 backdrop-blur-sm border-b border-border text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                                            <tr>
                                                <th className="px-6 py-5 border-b border-r border-border/50">Date & Info</th>
                                                <th className="px-6 py-5 border-b border-r border-border/50 min-w-[200px]">Subject Material</th>
                                                <th className="px-6 py-5 border-b border-r border-border/50">Status Indicator</th>
                                                <th className="px-6 py-5 border-b">Submission Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {records.slice(0, 50).map((r, i) => (
                                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-5 py-4 border-r border-border/50 text-muted-foreground font-medium">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-foreground">{format(new Date(r.date), 'MMM d, yyyy')}</span>
                                                            <span className="text-[10px] opacity-70">Period {r.slot_number}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 border-r border-border/50 font-bold text-foreground opacity-90 truncate max-w-[250px]">
                                                        <SubjectDetailsDialog subjectId={r.subject_id} subjectName={r.subject_name || '-'} />
                                                    </td>
                                                    <td className="px-5 py-4 border-r border-border/50">
                                                        <span className={`px-2.5 py-1.5 rounded-md text-[10px] font-black tracking-widest uppercase inline-flex items-center gap-1.5 ${
                                                            r.status === 'ABSENT' ? 'bg-[#ffecec] text-[#d4183d]' : 
                                                            r.status === 'OD' ? 'bg-[#fff5e5] text-[#d6a75e]' : 
                                                            r.status === 'INFORMED_LEAVE' ? 'bg-blue-50 text-blue-700' : 
                                                            'bg-[#eef2eb] text-[#5e7c4f]'
                                                        }`}>
                                                            {r.status === 'PRESENT' && <span className="w-1.5 h-1.5 rounded-full bg-[#5e7c4f]" />}
                                                            {r.status === 'ABSENT' && <span className="w-1.5 h-1.5 rounded-full bg-[#d4183d]" />}
                                                            {r.status === 'OD' && <span className="w-1.5 h-1.5 rounded-full bg-[#d6a75e]" />}
                                                            {r.status === 'INFORMED_LEAVE' && <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />}
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-xs font-medium text-muted-foreground max-w-[200px] truncate" title={r.od_reason || ''}>
                                                        {r.od_reason || <span className="opacity-40">-</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
