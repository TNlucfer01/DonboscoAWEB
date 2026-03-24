// ─── ChartCard ────────────────────────────────────────────────────────────────
// Wraps recharts charts in a Card, with the shared tooltip style.
// BUG-003: Tooltip now uses CSS variables (dark-mode safe, theme-consistent)
// BUG-008: Removed harsh border-2, using soft shadow like other cards

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { ResponsiveContainer } from 'recharts';

/**
 * Shared recharts tooltip style — uses theme CSS variables so it works
 * in both light and dark mode and matches the agricultural card design.
 */
export const CHART_TOOLTIP_STYLE = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    color: 'var(--foreground)',
};

interface ChartCardProps {
    title: string;
    height?: number;
    children: ReactNode;
}

export function ChartCard({ title, height = 250, children }: ChartCardProps) {
    return (
        <Card className="border-none shadow-sm shadow-black/5 bg-card">
            <CardHeader>
                <CardTitle className="text-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    {/* Children should be a single recharts chart element */}
                    {children as React.ReactElement}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
