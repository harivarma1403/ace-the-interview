'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillScore } from './interview-flow';

interface ProgressChartProps {
  data: SkillScore[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Progression</CardTitle>
        <CardDescription>
          Comparing your skills between your last two interviews.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="skill" />
                <YAxis domain={[0, 10]} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                    }}
                />
                <Legend />
                <Bar dataKey="previousScore" fill="hsl(var(--secondary))" name="Previous Interview" />
                <Bar dataKey="currentScore" fill="hsl(var(--primary))" name="Current Interview" />
            </BarChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
