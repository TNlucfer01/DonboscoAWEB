// ─── StatCard ─────────────────────────────────────────────────────────────────
// Reusable stat card for dashboards. Eliminates 8 near-identical Card blocks.

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
}

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
    return (
        <Card className="border-2 border-border">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl text-foreground">{value}</p>
            </CardContent>
        </Card>
    );
}
