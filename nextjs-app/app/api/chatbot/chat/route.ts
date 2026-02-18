
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, user_email } = body;

        // 1. Identify User Role & Data
        const user = await db.user.findUnique({ where: { email: user_email } });
        const student = await db.student.findUnique({
            where: { email: user_email },
            include: { predictions: { orderBy: { createdAt: 'desc' }, take: 1 } }
        });

        const lowerMsg = message.toLowerCase();
        let response = "I'm not sure about that. Can you ask about student performance?";
        let followUpQuestions: string[] = [];

        // 2. Intent Analysis & Context Building

        // --- ADMIN INTENT ---
        if (user?.role === 'admin' && (lowerMsg.includes('how many') || lowerMsg.includes('total') || lowerMsg.includes('stats'))) {
            const totalStudents = await db.student.count();
            const predictions = await db.prediction.findMany();
            const atRisk = predictions.filter(p => p.riskScore >= 0.6).length;

            response = `There are currently ${totalStudents} students in the system. ${atRisk} students are flagged as 'At Risk' based on the latest AI analysis.`;
            followUpQuestions = ["Show at-risk students", "Average GPA of class"];
        }

        // --- STUDENT INTENT: RISK ---
        else if (lowerMsg.includes('risk') || lowerMsg.includes('at risk')) {
            if (student) {
                const pred = student.predictions[0];
                const riskScore = pred?.riskScore ?? 0;
                const riskLevel = riskScore >= 0.6 ? 'High' : riskScore >= 0.4 ? 'Medium' : 'Low';

                response = `Your current risk level is ${riskLevel} (${(riskScore * 100).toFixed(0)}%). This is calculated based on your attendance (${student.attendancePercentage}%) and internal marks.`;
                if (riskLevel === 'High') {
                    response += " I recommend attending more classes and seeking help for internal assessments.";
                }
            } else {
                response = "I couldn't find your academic records. Please add your academic details to get a risk analysis.";
            }
            followUpQuestions = ["How can I reduce my risk?", "Check my performance"];
        }

        // --- STUDENT INTENT: PERFORMANCE ---
        else if (lowerMsg.includes('performance') || lowerMsg.includes('grade') || lowerMsg.includes('gpa')) {
            if (student) {
                const pred = student.predictions[0];
                response = `Your predicted performance is '${pred?.predictedPerformance || 'Unknown'}'. Your previous GPA was ${student.previousGpa}.`;
            } else {
                response = "Please input your academic details first so I can analyze your performance.";
            }
            followUpQuestions = ["How to improve my GPA?", "What is my risk score?"];
        }

        // --- GENERAL ---
        else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            response = `Hello ${user?.name || 'there'}! I am your Academic Assistant. How can I help you today?`;
            followUpQuestions = ["Analyze my performance", "Check at-risk status"];
        }

        return NextResponse.json({
            response,
            follow_up_questions: followUpQuestions
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        return NextResponse.json(
            { error: 'Failed to process message' },
            { status: 500 }
        );
    }
}
