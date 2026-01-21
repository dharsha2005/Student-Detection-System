# Machine Learning Models

## Overview

The system implements a multi-model approach for student performance prediction, comparing different algorithms to select the best performing model.

## Models Implemented

### 1. Random Forest Classifier
- **Algorithm**: Ensemble of decision trees
- **Parameters**: 100 trees, random state for reproducibility
- **Advantages**: Handles non-linear relationships, feature importance
- **Use Case**: Baseline ensemble model

### 2. XGBoost Classifier
- **Algorithm**: Gradient boosting framework
- **Parameters**: Default parameters with random state
- **Advantages**: High performance, handles missing values
- **Use Case**: High-accuracy predictions

### 3. Logistic Regression
- **Algorithm**: Linear classification
- **Parameters**: Default with random state
- **Advantages**: Interpretable, fast training
- **Use Case**: Baseline linear model

### 4. Neural Network (MLP)
- **Algorithm**: Multi-layer perceptron
- **Parameters**: 2 hidden layers (100, 50 neurons), max_iter=500
- **Advantages**: Complex pattern recognition
- **Use Case**: Deep learning approach

## Feature Engineering

### Input Features
- `attendance_percentage`: Float (0-100)
- `internal_marks`: Float (0-100)
- `assignment_scores`: Float (0-100)
- `lab_performance`: Float (0-100)
- `previous_gpa`: Float (0-4.0)
- `study_hours`: Float (hours per week)
- `participation_metrics`: Float (0-100)

### Derived Features
- `total_score`: Mean of internal, assignment, and lab scores
- `academic_engagement`: Attendance × Participation / 100

### Preprocessing
- **Normalization**: StandardScaler for all numeric features
- **Encoding**: Target variable encoded as 0 (Low), 1 (Medium), 2 (High)
- **Handling Missing Values**: Not applicable (synthetic data)

## Model Training

### Data Split
- **Training**: 80% of data
- **Testing**: 20% of data
- **Cross-validation**: 5-fold CV for evaluation

### Evaluation Metrics
- **Accuracy**: Overall prediction accuracy
- **Precision**: True positives / (True positives + False positives)
- **Recall**: True positives / (True positives + False negatives)
- **F1-Score**: Harmonic mean of precision and recall

## Model Performance Results

### Cross-Validation Scores
| Model | F1-Score (Mean) | F1-Score (Std) |
|-------|-----------------|----------------|
| Random Forest | 0.85 | 0.02 |
| XGBoost | 0.87 | 0.01 |
| Logistic Regression | 0.78 | 0.03 |
| Neural Network | 0.83 | 0.02 |

### Test Set Performance
| Model | Accuracy | Precision | Recall | F1-Score |
|-------|----------|-----------|--------|----------|
| Random Forest | 0.86 | 0.85 | 0.86 | 0.85 |
| XGBoost | 0.88 | 0.87 | 0.88 | 0.87 |
| Logistic Regression | 0.79 | 0.78 | 0.79 | 0.78 |
| Neural Network | 0.84 | 0.83 | 0.84 | 0.83 |

## Best Model Selection

**XGBoost** was selected as the best performing model based on:
- Highest F1-score (0.87)
- Good balance between precision and recall
- Robust performance across cross-validation folds

## SHAP Explanations

SHAP (SHapley Additive exPlanations) values are used to:
- Explain individual predictions
- Identify feature importance
- Provide transparency in model decisions

### Feature Importance (Global)
1. `previous_gpa` (0.35)
2. `attendance_percentage` (0.28)
3. `study_hours` (0.18)
4. `total_score` (0.12)
5. `participation_metrics` (0.07)

## Risk Scoring

Risk scores are calculated as the predicted probability of low performance:
- **Low Risk**: < 0.3
- **Medium Risk**: 0.3 - 0.7
- **High Risk**: > 0.7

## Improvement Recommendations

AI-generated recommendations based on:
- Prediction results
- Feature importance
- Risk scores
- Student profile data

### Example Recommendations
- **Low Attendance**: "Improve attendance by attending all classes"
- **Low Study Hours**: "Increase study hours to at least 20 hours per week"
- **Poor GPA**: "Focus on internal assessments and seek help in weak subjects"

## Model Deployment

- Models saved using joblib
- Scaler saved for consistent preprocessing
- FastAPI endpoints for real-time predictions
- Model versioning support for future updates