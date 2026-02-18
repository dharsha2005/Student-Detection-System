
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PredictionModel, StudentFeatures } from '@/lib/ml/predictionModel';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { student_id, ...features } = body;

        // Validate input
        if (!student_id) {
            return NextResponse.json(
                { error: 'Student ID is required' },
                { status: 400 }
            );
        }

        // Check if student exists
        const student = await db.student.findUnique({
            where: { id: student_id },
        });

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        // Prepare features for prediction
        // Ensure all required features are present and are numbers
        const predictionFeatures: StudentFeatures = {
            attendance_percentage: Number(features.attendance_percentage),
            internal_marks: Number(features.internal_marks),
            assignment_scores: Number(features.assignment_scores),
            lab_performance: Number(features.lab_performance),
            previous_gpa: Number(features.previous_gpa),
            study_hours: Number(features.study_hours),
            participation_metrics: Number(features.participation_metrics),
        };

        // Run prediction (Pure Node.js logic)
        const result = PredictionModel.predict(predictionFeatures);

        // Save prediction to database
        const prediction = await db.prediction.create({
            data: {
                studentId: student_id,
                predictedPerformance: result.predicted_performance,
                riskScore: result.risk_score,
                recommendations: JSON.stringify(result.recommendations),
                featureImportance: JSON.stringify(result.feature_importance),
            },
        });

        return NextResponse.json({
            ...result,
            id: prediction.id,
            created_at: prediction.createdAt,
        });
    } catch (error) {
        console.error('Prediction error:', error);
        return NextResponse.json(
            { error: 'Failed to process prediction' },
            { status: 500 }
        );
    }
}
