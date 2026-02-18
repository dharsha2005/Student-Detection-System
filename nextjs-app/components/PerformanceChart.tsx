
'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface PerformanceChartProps {
    data: {
        High: number;
        Medium: number;
        Low: number;
    }
}

export function PerformanceChart({ data }: PerformanceChartProps) {
    const chartData = {
        labels: ['High Performance', 'Medium Performance', 'Low Performance'],
        datasets: [
            {
                label: '# of Students',
                data: [data.High, data.Medium, data.Low],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.6)', // Green for High
                    'rgba(59, 130, 246, 0.6)', // Blue for Medium
                    'rgba(239, 68, 68, 0.6)',  // Red for Low
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            title: {
                display: true,
                text: 'Student Performance Distribution',
            },
        },
    };

    return <Doughnut data={chartData} options={options} />;
}
