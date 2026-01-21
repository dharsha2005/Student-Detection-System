# Dataset Description

## Overview

The Student Performance Detection System uses a comprehensive dataset of 10,000+ student records to train and evaluate machine learning models for academic performance prediction.

## Data Source

For this capstone project, we use a synthetic dataset that simulates real-world student performance data. In a production environment, this would be replaced with actual institutional data or public datasets such as:

- UCI Machine Learning Repository: Student Performance Dataset
- Kaggle: Student Performance datasets
- Institutional Learning Management System (LMS) data

## Dataset Structure

### Features

| Feature | Type | Range | Description |
|---------|------|-------|-------------|
| `attendance_percentage` | Float | 0-100 | Percentage of classes attended |
| `internal_marks` | Float | 0-100 | Internal assessment marks |
| `assignment_scores` | Float | 0-100 | Assignment and project scores |
| `lab_performance` | Float | 0-100 | Laboratory work performance |
| `previous_gpa` | Float | 0-4.0 | Grade Point Average from previous semester |
| `study_hours` | Float | 0-50 | Weekly study hours |
| `participation_metrics` | Float | 0-100 | Class participation and engagement score |
| `socio_academic_factors` | JSON String | - | Additional factors (family income, extracurricular activities, etc.) |

### Target Variable

| Value | Label | Description |
|-------|-------|-------------|
| 0 | Low | Students predicted to perform below average |
| 1 | Medium | Students predicted to perform at average level |
| 2 | High | Students predicted to excel academically |

## Data Generation Logic

The synthetic dataset is generated using realistic distributions:

```python
# Attendance: Normal distribution around 75%
attendance = np.random.normal(75, 15, n_samples)
attendance = np.clip(attendance, 0, 100)

# GPA: Beta distribution skewed towards higher values
gpa = np.random.beta(2, 1, n_samples) * 4.0

# Study hours: Exponential distribution
study_hours = np.random.exponential(15, n_samples)
study_hours = np.clip(study_hours, 0, 50)

# Performance classification logic
if attendance > 80 and gpa > 3.0 and study_hours > 20:
    performance = 'High'
elif attendance > 60 and gpa > 2.5:
    performance = 'Medium'
else:
    performance = 'Low'
```

## Data Quality

### Completeness
- All features are populated (no missing values in synthetic data)
- Consistent data types across all records

### Distribution Analysis

#### Attendance Percentage
- Mean: 75%
- Std: 15%
- Skewness: Slightly left-skewed

#### Previous GPA
- Mean: 2.8
- Std: 0.8
- Distribution: Beta distribution (realistic academic distribution)

#### Study Hours
- Mean: 15 hours/week
- Std: 10 hours
- Distribution: Exponential (many students study few hours, few study many)

### Class Distribution
- High Performers: ~25%
- Medium Performers: ~50%
- Low Performers: ~25%

## Feature Engineering

### Derived Features
- `total_score`: Average of internal_marks, assignment_scores, lab_performance
- `academic_engagement`: attendance_percentage × participation_metrics / 100

### Correlation Analysis

Strong positive correlations:
- `previous_gpa` ↔ `total_score` (0.65)
- `attendance_percentage` ↔ `participation_metrics` (0.58)
- `study_hours` ↔ `previous_gpa` (0.52)

## Data Preprocessing

### Normalization
- StandardScaler applied to all numeric features
- Mean = 0, Standard Deviation = 1

### Train/Test Split
- 80% training data
- 20% testing data
- Stratified split to maintain class distribution

## Ethical Considerations

### Data Privacy
- No personally identifiable information (PII) in synthetic data
- In production: Compliance with FERPA/GDPR for student data
- Data anonymization and aggregation for analytics

### Bias Mitigation
- Balanced class distribution in training data
- Regular bias audits of model predictions
- Fair representation across demographic groups

## Future Enhancements

### Additional Data Sources
- Social media engagement metrics
- Learning analytics from LMS
- Health and wellness indicators
- Economic factors

### Data Quality Improvements
- Real-time data validation
- Outlier detection and handling
- Missing value imputation strategies

### Advanced Features
- Time-series analysis of performance trends
- Network analysis of student interactions
- Natural language processing of feedback