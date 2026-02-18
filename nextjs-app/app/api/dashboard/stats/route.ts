
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const totalStudents = await db.student.count();

        // Get distribution of predicted performance
        const predictions = await db.prediction.findMany({
            select: { predictedPerformance: true },
        });

        const performanceDistribution = {
            High: 0,
            Medium: 0,
            Low: 0,
        };

        let totalRiskScore = 0;

        // To calculate average risk, we need to fetch risk scores.
        // Ideally we should group by, but validation logic is simpler here for now.
        const riskScores = await db.prediction.findMany({
            select: { riskScore: true },
        });

        riskScores.forEach(p => {
            totalRiskScore += p.riskScore;
        });

        const averageRiskScore = riskScores.length > 0 ? totalRiskScore / riskScores.length : 0;

        predictions.forEach(p => {
            const perf = p.predictedPerformance as 'High' | 'Medium' | 'Low';
            if (performanceDistribution[perf] !== undefined) {
                performanceDistribution[perf]++;
            }
        });

        const atRiskCount = performanceDistribution['Low'];

        return NextResponse.json({
            totalStudents,
            atRiskCount,
            averageRiskScore,
            performanceDistribution,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
