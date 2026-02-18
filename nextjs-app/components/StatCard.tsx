
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color?: 'blue' | 'green' | 'red' | 'purple';
}

export function StatCard({ label, value, icon: Icon, trend, color = 'blue' }: StatCardProps) {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
                <div className={clsx("p-3 rounded-lg", colorStyles[color])}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={clsx("text-xs font-medium px-2 py-1 rounded-full",
                        trend.startsWith('+') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{label}</h3>
            <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
    );
}
