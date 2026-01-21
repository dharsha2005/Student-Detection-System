# System Architecture

## Overview

The Student Performance Detection & Improvement System follows a microservices architecture with separate components for API, ML predictions, frontend, and database.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   FastAPI Backend│    │  ML Service     │
│   (Port 3000)   │◄──►│   (Port 8000)    │◄──►│  (Port 8001)    │
│                 │    │                 │    │                 │
│ - Dashboards    │    │ - REST API      │    │ - Predictions   │
│ - Charts        │    │ - CRUD Ops      │    │ - Model Serving │
│ - Admin Panel   │    │ - Analytics     │    │ - SHAP Expl.   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ PostgreSQL DB  │
                    │   (Port 5432)   │
                    │                 │
                    │ - Student Data │
                    │ - Predictions  │
                    │ - Analytics    │
                    └─────────────────┘
```

## Component Details

### Frontend (React + Tailwind CSS)
- **Technology**: React 18, Tailwind CSS, Recharts
- **Features**:
  - Role-based dashboards
  - Interactive data visualizations
  - Responsive design
  - Real-time updates

### Backend (FastAPI)
- **Technology**: Python 3.8+, FastAPI, SQLAlchemy, Pydantic
- **Features**:
  - RESTful API design
  - Automatic API documentation
  - Data validation
  - CORS support
  - Dependency injection

### ML Service
- **Technology**: Python, scikit-learn, XGBoost, SHAP
- **Features**:
  - Multi-model predictions
  - Feature importance analysis
  - Risk scoring
  - Model versioning

### Database (PostgreSQL)
- **Technology**: PostgreSQL 15
- **Schema**:
  - Students table
  - Predictions table
  - Analytics views

## Data Flow

1. **Data Ingestion**: Student data uploaded via admin panel
2. **Storage**: Data stored in PostgreSQL database
3. **Prediction Request**: Frontend requests prediction from backend
4. **ML Processing**: Backend forwards request to ML service
5. **Prediction**: ML service loads models and generates predictions
6. **Response**: Results returned with explanations and recommendations
7. **Storage**: Prediction results stored for analytics
8. **Visualization**: Frontend displays results and trends

## Security Considerations

- Input validation using Pydantic
- CORS configuration
- Environment variable management
- Database connection security
- API rate limiting (future enhancement)

## Scalability

- Microservices architecture allows horizontal scaling
- Database indexing for performance
- Caching layer (future enhancement)
- Load balancing (future enhancement)

## Deployment

- Docker containers for each service
- Docker Compose for local development
- Kubernetes for production deployment (future)