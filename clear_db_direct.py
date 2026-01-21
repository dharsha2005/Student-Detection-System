#!/usr/bin/env python3
"""
Direct MongoDB clear script to bypass Pydantic validation
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def clear_predictions_direct():
    """Clear predictions directly from MongoDB"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    database = client.student_performance
    
    try:
        # Clear predictions collection directly
        result = await database.predictions.delete_many({})
        print(f"🗑️  Cleared {result.deleted_count} predictions from database")
        
        # Verify it's empty
        count = await database.predictions.count_documents({})
        print(f"✅ Predictions collection now has {count} documents")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(clear_predictions_direct())
