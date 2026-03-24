import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../app/components/ui/dialog';
import { apiClient } from '../../api/apiClient';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { SubjectDetailsDialog } from './SubjectDetailsDialog';

interface StaffRecord {
    date: string;
    slot_id: number;
    slot_number: number | null;
    start_time: string | null;
    subject_name: string | null;
    subject_code: string | null;
    subject_id: number;
    students_marked: number;
    present_count: number;
}

export function StaffDetailsDialog({ staffId, staffName }: { staffId: number; staffName: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<StaffRecord[]>([]);
    const [error, setError] = useState('');

    const fetchDetails = async () => {
        if (!staffId) return;
        setLoading(true);
        setError('');
        try {
            const data = await apiClient.get<StaffRecord[]>(`/reports/by-staff/${staffId}`);
            setRecords(data);
        } catch (err) {
            setError('Failed to load staff details.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) fetchDetails();
    };

    const totalMarked = records.reduce((acc, r) => acc + Number(r.students_marked), 0);
    const totalPresent = records.reduce((acc, r) => acc + Number(r.present_count), 0);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button className="cursor-pointer text-left text-primary hover:text-primary/80 font-semibold decoration-primary/30 hover:underline underline-offset-4 outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded-md transition-all">
                    {staffName}
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col w-[95vw] border-border bg-card/95 backdrop-blur-md rounded-3xl p-0 shadow-2xl focus:outline-none">
                <DialogHeader className="p-6 sm:p-8 border-b border-border bg-muted/20">
                    <DialogTitle className="text-3xl sm:text-4xl font-black text-foreground tracking-tight flex items-baseline gap-3">
                        <span className="opacity-40 font-bold text-sm uppercase tracking-widest block mb-1">Administrative Intel</span>
                        <div className="flex-1 flex flex-wrap items-baseline gap-2">
                            <span>Staff:</span> 
                            <span className="text-primary underline decoration-primary/20 underline-offset-8">{staffName}</span>
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
                            <p className="text-muted-foreground text-lg font-semibold">No attendance entries found.</p>
                            <p className="text-muted-foreground/60 text-sm mt-1">This staff member hasn't taken any generic attendance yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 mt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 overflow-hidden bg-card rounded-2xl border border-border shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-border">
                                <div className="p-5 sm:p-6 bg-primary/5 flex flex-col justify-center items-center text-center transition-colors hover:bg-primary/10">
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Total Classes Conducted</p>
                                    <p className="text-4xl font-black text-foreground">{records.length}</p>
                                </div>
                                <div className="p-5 sm:p-6 bg-primary/5 flex flex-col justify-center items-center text-center transition-colors hover:bg-primary/10">
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Total Students Marked</p>
                                    <p className="text-4xl font-black text-primary/80">{totalMarked}</p>
                                </div>
                                <div className="p-5 sm:p-6 bg-primary/10 flex flex-col justify-center items-center text-center transition-colors hover:bg-primary/20">
                                    <p className="text-[11px] text-primary/80 uppercase tracking-widest font-bold mb-2">P/OD/IL Ratio</p>
                                    <p className="text-5xl font-black text-primary">
                                        {totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : 0}%
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-extrabold text-foreground tracking-tight text-lg mb-4 px-1 flex items-center gap-2">
                                    Recent Marking History 
                                    <span className="text-muted-foreground text-xs font-semibold px-2 py-0.5 bg-muted rounded-full">Last 50</span>
                                </h3>
                                <div className="overflow-x-auto rounded-2xl border border-border bg-background/50 shadow-inner">
                                    <table className="w-full text-sm text-left border-separate border-spacing-0 whitespace-nowrap">
                                        <thead className="bg-muted/60 sticky top-0 z-10 backdrop-blur-sm border-b border-border text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                                            <tr>
                                                <th className="px-6 py-5 border-b border-r border-border/50">Date Metric</th>
                                                <th className="px-6 py-5 border-b border-r border-border/50 min-w-[200px]">Lecture Course</th>
                                                <th className="px-6 py-5 border-b border-r border-border/50 text-center">Batch Size</th>
                                                <th className="px-6 py-5 border-b text-center">Integrity %</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
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
                                                    <td className="px-5 py-4 border-r border-border/50 text-center text-foreground font-medium">
                                                        {r.students_marked} Students
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className={`px-2.5 py-1.5 rounded-md text-[10px] font-black tracking-widest uppercase inline-flex items-center gap-1.5 ${
                                                            ((r.present_count/r.students_marked)*100) >= 80 ? 'bg-[#eef2eb] text-[#5e7c4f]' :
                                                            ((r.present_count/r.students_marked)*100) >= 60 ? 'bg-[#fff5e5] text-[#d6a75e]' :
                                                            'bg-[#ffecec] text-[#d4183d]'
                                                        }`}>
                                                            {r.students_marked > 0 ? Math.round((r.present_count / r.students_marked) * 100) : 0}%
                                                        </span>
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
