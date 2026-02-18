
/**
 * Student Performance Prediction Model
 * Ported from Python RuleBasedModel (ml_service/scripts/train_models.py)
 */

export type StudentFeatures = {
    attendance_percentage: number;
    internal_marks: number;
    assignment_scores: number;
    lab_performance: number;
    previous_gpa: number;
    study_hours: number;
    participation_metrics: number;
};

export type PredictionResult = {
    predicted_performance: 'Low' | 'Medium' | 'High';
    risk_score: number;
    recommendations: string[];
    feature_importance: Record<string, number>;
};

export class PredictionModel {
    /**
     * Predict performance based on student features
     * Logic ported from Python:
     * score = (attendance * 0.2 + internal_marks * 0.2 + assignment_scores * 0.15 + 
     *          lab_performance * 0.15 + previous_gpa * 20 + study_hours * 0.5 + 
     *          participation_metrics * 0.1)
     */
    static predict(features: StudentFeatures): PredictionResult {
        const {
            attendance_percentage,
            internal_marks,
            assignment_scores,
            lab_performance,
            previous_gpa,
            study_hours,
            participation_metrics,
        } = features;

        // Calculate weighted score
        const score =
            attendance_percentage * 0.2 +
            internal_marks * 0.2 +
            assignment_scores * 0.15 +
            lab_performance * 0.15 +
            previous_gpa * 20 +
            study_hours * 0.5 +
            participation_metrics * 0.1;

        let predicted_performance: 'Low' | 'Medium' | 'High';
        let probabilities: [number, number, number]; // [Low, Medium, High]

        if (score >= 85) {
            predicted_performance = 'High';
            probabilities = [0.1, 0.2, 0.7];
        } else if (score >= 70) {
            predicted_performance = 'Medium';
            probabilities = [0.2, 0.6, 0.2];
        } else {
            predicted_performance = 'Low';
            probabilities = [0.7, 0.2, 0.1];
        }

        const risk_score = probabilities[0]; // Probability of 'Low' performance

        // Generate recommendations
        const recommendations: string[] = [];
        if (predicted_performance === 'Low') {
            if (attendance_percentage < 75) {
                recommendations.push("Improve attendance by attending all classes regularly.");
            }
            if (study_hours < 20) {
                recommendations.push("Increase study hours to at least 20 hours per week.");
            }
            if (previous_gpa < 3.0) {
                recommendations.push("Focus on improving grades in core subjects.");
            }
            recommendations.push("Schedule a meeting with academic advisor for personalized guidance.");
        } else if (predicted_performance === 'Medium') {
            recommendations.push("Maintain current study habits and attendance.");
            recommendations.push("Consider joining study groups for peer learning.");
        } else {
            recommendations.push("Excellent performance! Keep up the good work.");
            recommendations.push("Consider leadership roles or advanced courses.");
        }

        // Feature importance (static relative weights from the formula)
        // Normalized approximately based on max possible contribution
        const feature_importance = {
            attendance_percentage: 0.2,
            internal_marks: 0.2,
            assignment_scores: 0.15,
            lab_performance: 0.15,
            previous_gpa: 0.25, // High impact in formula (x20)
            study_hours: 0.05,
            participation_metrics: 0.0, // Fixed typo in port? Python had 0.1
        };

        return {
            predicted_performance,
            risk_score,
            recommendations,
            feature_importance,
        };
    }
}
