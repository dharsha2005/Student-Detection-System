
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PredictionModel, StudentFeatures } from '@/lib/ml/predictionModel';

export async function GET() {
    try {
        const students = await db.student.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                predictions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1, // Include latest prediction
                },
            },
        });
        return NextResponse.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { error: 'Failed to fetch students' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Create new student
        const student = await db.student.create({
            data: {
                name: body.name,
                email: body.email,
                enrollmentYear: body.enrollment_year || new Date().getFullYear(),
                major: body.major || 'Computer Science',
                attendancePercentage: Number(body.attendance_percentage),
                internalMarks: Number(body.internal_marks),
                assignmentScores: Number(body.assignment_scores),
                labPerformance: Number(body.lab_performance),
                previousGpa: Number(body.previous_gpa),
                studyHours: Number(body.study_hours),
                participationMetrics: Number(body.participation_metrics),
                socioAcademicFactors: JSON.stringify(body.socio_academic_factors || {}),
            },
        });

        // Generate automatic prediction
        try {
            const predictionFeatures: StudentFeatures = {
                attendance_percentage: Number(body.attendance_percentage),
                internal_marks: Number(body.internal_marks),
                assignment_scores: Number(body.assignment_scores),
                lab_performance: Number(body.lab_performance),
                previous_gpa: Number(body.previous_gpa),
                study_hours: Number(body.study_hours),
                participation_metrics: Number(body.participation_metrics),
            };

            const result = PredictionModel.predict(predictionFeatures);

            await db.prediction.create({
                data: {
                    studentId: student.id,
                    predictedPerformance: result.predicted_performance,
                    riskScore: result.risk_score,
                    recommendations: JSON.stringify(result.recommendations),
                    featureImportance: JSON.stringify(result.feature_importance),
                },
            });
        } catch (predError) {
            console.error("Failed to generate automatic prediction:", predError);
            // We don't fail the request if prediction fails, just log it
        }

        return NextResponse.json(student, { status: 201 });
    } catch (error) {
        console.error('Error creating student:', error);

        // Check for unique constraint violation (email)
        if ((error as any).code === 'P2002') {
            return NextResponse.json(
                { error: 'Student with this email already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create student' },
            { status: 500 }
        );
    }
}
