// ─── ChartCard ────────────────────────────────────────────────────────────────
// Wraps recharts charts in a Card, with the shared tooltip style.
// Contains the identical tooltip contentStyle that was repeated in both dashboards.

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { ResponsiveContainer } from 'recharts';

/** Shared recharts tooltip style — used via `contentStyle` prop on <Tooltip /> */
export const CHART_TOOLTIP_STYLE = {
    backgroundColor: 'white',
    border: '2px solid #cbd5e1',
    borderRadius: 0,
};

interface ChartCardProps {
    title: string;
    height?: number;
    children: ReactNode;
}

export function ChartCard({ title, height = 250, children }: ChartCardProps) {
    return (
        <Card className="border-2 border-border">
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
