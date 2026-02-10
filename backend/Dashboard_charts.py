from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
import random

router = APIRouter()

@router.get("/dashboard/timeseries")
async def get_timeseries_data():
    """
    Get time series data for real-time activity chart
    Returns last 10 minutes of data
    """
    try:
        now = datetime.now()
        data = []
        
        # Generate 10 data points (1 minute intervals)
        for i in range(9, -1, -1):
            time = now - timedelta(minutes=i)
            data.append({
                'time': time.strftime('%H:%M'),
                'requests': random.randint(10, 50),
                'blocked': random.randint(0, 15)
            })
        
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/threat-distribution")
async def get_threat_distribution():
    """
    Get threat distribution for pie chart
    """
    try:
        return [
            {'name': 'SQL Injection', 'value': random.randint(20, 50), 'color': '#EF4444'},
            {'name': 'XSS Attack', 'value': random.randint(10, 30), 'color': '#F59E0B'},
            {'name': 'Prompt Injection', 'value': random.randint(30, 70), 'color': '#10B981'},
            {'name': 'Command Injection', 'value': random.randint(5, 20), 'color': '#3B82F6'},
            {'name': 'PII Leakage', 'value': random.randint(5, 15), 'color': '#8B5CF6'},
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/hourly-activity")
async def get_hourly_activity():
    """
    Get 24-hour attack pattern data
    """
    try:
        data = []
        for hour in range(24):
            data.append({
                'hour': f'{hour:02d}:00',
                'attacks': random.randint(0, 20)
            })
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/attacks-by-type")
async def get_attacks_by_type():
    """
    Get attacks grouped by type for bar chart
    """
    try:
        return [
            {'type': 'SQL Injection', 'count': random.randint(20, 70)},
            {'type': 'XSS', 'count': random.randint(10, 40)},
            {'type': 'Prompt Injection', 'count': random.randint(30, 90)},
            {'type': 'Command Injection', 'count': random.randint(10, 35)},
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
