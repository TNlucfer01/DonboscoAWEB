// ─── StatCard ─────────────────────────────────────────────────────────────────
// Reusable stat card for dashboards.
// BUG-007: Removed harsh border-2, added themed icon color, bold value, hover state

import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    iconVariant?: 'primary' | 'secondary' | 'accent';
    onClick?: () => void;
}

export function StatCard({ icon: Icon, label, value, iconVariant = 'primary', onClick }: StatCardProps) {
    const iconColor = iconVariant === 'secondary'
        ? 'text-secondary'
        : iconVariant === 'accent'
            ? 'text-accent'
            : 'text-primary';

    return (
        <Card 
            onClick={onClick}
            className={`border-none shadow-sm shadow-black/5 bg-card hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}`}
        >
            <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg bg-primary/10 inline-flex ${iconColor}`}>
                        <Icon className="w-4 h-4" />
                    </span>
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-foreground">{value}</p>
            </CardContent>
        </Card>
    );
}
