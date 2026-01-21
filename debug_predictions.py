#!/usr/bin/env python3
"""
Debug script to check database predictions
"""
import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.database import init_db
from app.models import Prediction

async def debug_predictions():
    """Debug what's in the database"""
    
    # Initialize database
    await init_db()
    
    print("🔍 Checking predictions in database...")
    
    try:
        # Get all predictions
        predictions = await Prediction.find().to_list()
        
        print(f"Found {len(predictions)} predictions:")
        
        for i, pred in enumerate(predictions):
            print(f"\n--- Prediction {i+1} ---")
            print(f"Student ID: {pred.student_id}")
            print(f"Performance: {pred.predicted_performance}")
            print(f"Risk Score: {pred.risk_score}")
            print(f"Recommendations: {pred.recommendations}")
            print(f"Recommendations Type: {type(pred.recommendations)}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_predictions())
