
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PredictionModel, StudentFeatures } from '@/lib/ml/predictionModel';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const student = await db.student.findUnique({
            where: { id: params.id },
            include: {
                predictions: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error fetching student details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch student details' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const body = await request.json();

        // Update student
        const student = await db.student.update({
            where: { id: params.id },
            data: {
                name: body.name,
                email: body.email,
                enrollmentYear: body.enrollment_year,
                major: body.major,
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

        // Regenerate prediction
        try {
            const predictionFeatures: StudentFeatures = {
                attendance_percentage: Number(student.attendancePercentage),
                internal_marks: Number(student.internalMarks),
                assignment_scores: Number(student.assignmentScores),
                lab_performance: Number(student.labPerformance),
                previous_gpa: Number(student.previousGpa),
                study_hours: Number(student.studyHours),
                participation_metrics: Number(student.participationMetrics),
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
            console.error("Failed to regenerate prediction:", predError);
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error updating student:', error);
        return NextResponse.json(
            { error: 'Failed to update student' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Delete predictions first (manual cascade)
        await db.prediction.deleteMany({
            where: { studentId: params.id },
        });

        await db.student.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        return NextResponse.json(
            { error: 'Failed to delete student' },
            { status: 500 }
        );
    }
}
