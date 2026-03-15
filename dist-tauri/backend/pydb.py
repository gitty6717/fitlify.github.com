#!/usr/bin/env python3
"""
Fitlify Backend Database
Simple Python backend for handling user data, fitness data, and workout plans
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Database file path
DB_FILE = Path(__file__).parent.parent / 'database' / 'fitlify_db.json'

def load_database():
    """Load the database from JSON file"""
    if not DB_FILE.exists():
        # Create initial database structure
        initial_db = {
            "users": {},
            "fitness_data": {},
            "workout_plans": {},
            "stats": {}
        }
        save_database(initial_db)
        return initial_db
    
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error loading database: {e}")
        return {"users": {}, "fitness_data": {}, "workout_plans": {}, "stats": {}}

def save_database(db):
    """Save the database to JSON file"""
    try:
        # Ensure database directory exists
        DB_FILE.parent.mkdir(parents=True, exist_ok=True)
        
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(db, f, indent=2, ensure_ascii=False)
        return True
    except IOError as e:
        print(f"Error saving database: {e}")
        return False

def generate_user_id():
    """Generate a unique user ID"""
    import uuid
    return str(uuid.uuid4())

def save_user(user_data):
    """Save user data"""
    db = load_database()
    
    # Check if user already exists
    existing_user = None
    for user_id, user in db["users"].items():
        if user["email"] == user_data["email"]:
            existing_user = user_id
            break
    
    if existing_user:
        return {
            "success": False,
            "message": "User with this email already exists"
        }
    
    # Generate new user ID
    user_id = generate_user_id()
    
    # Add user to database
    db["users"][user_id] = {
        "id": user_id,
        "name": user_data["name"],
        "email": user_data["email"],
        "password": user_data["password"],  # In production, this should be hashed
        "google_account": user_data.get("google_account", False),
        "created_at": datetime.now().isoformat(),
        "last_login": datetime.now().isoformat()
    }
    
    # Initialize user stats
    db["stats"][user_id] = {
        "total_workouts": 0,
        "current_streak": 0,
        "best_streak": 0,
        "total_plans": 0,
        "last_workout_date": None,
        "member_since": datetime.now().isoformat()
    }
    
    if save_database(db):
        return {
            "success": True,
            "user": {
                "id": user_id,
                "name": user_data["name"],
                "email": user_data["email"],
                "google_account": user_data.get("google_account", False)
            }
        }
    else:
        return {
            "success": False,
            "message": "Failed to save user data"
        }

def login_user(login_data):
    """Authenticate user login"""
    db = load_database()
    
    email = login_data["email"]
    password = login_data["password"]
    
    # Find user by email
    user_id = None
    user = None
    for uid, u in db["users"].items():
        if u["email"] == email:
            user_id = uid
            user = u
            break
    
    if not user:
        return {
            "success": False,
            "message": "User not found"
        }
    
    # Check password (in production, use proper password hashing)
    if user["password"] != password:
        return {
            "success": False,
            "message": "Invalid password"
        }
    
    # Update last login
    user["last_login"] = datetime.now().isoformat()
    db["users"][user_id] = user
    
    save_database(db)
    
    return {
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "google_account": user.get("google_account", False)
        }
    }

def save_fitness_data(fitness_data):
    """Save user fitness data"""
    # This function would need user_id, but for demo purposes we'll simulate
    # In a real application, you'd get user_id from authentication token
    
    # For demo, return success
    return {
        "success": True,
        "message": "Fitness data saved successfully"
    }

def save_workout_plan(user_id, plan_data):
    """Save workout plan for a user"""
    db = load_database()
    
    if user_id not in db["workout_plans"]:
        db["workout_plans"][user_id] = []
    
    # Add timestamp and ID to plan
    plan_data["id"] = generate_user_id()  # Using same function for unique IDs
    plan_data["created_at"] = datetime.now().isoformat()
    plan_data["user_id"] = user_id
    
    # Add plan to user's plans
    db["workout_plans"][user_id].append(plan_data)
    
    # Update stats
    if user_id in db["stats"]:
        db["stats"][user_id]["total_plans"] = len(db["workout_plans"][user_id])
    
    if save_database(db):
        return {
            "success": True,
            "message": "Workout plan saved successfully",
            "plan_id": plan_data["id"]
        }
    else:
        return {
            "success": False,
            "message": "Failed to save workout plan"
        }

def get_user_profile(user_id):
    """Get complete user profile"""
    db = load_database()
    
    if user_id not in db["users"]:
        return {
            "success": False,
            "message": "User not found"
        }
    
    user = db["users"][user_id]
    fitness_data = db["fitness_data"].get(user_id, {})
    workout_plans = db["workout_plans"].get(user_id, [])
    stats = db["stats"].get(user_id, {})
    
    return {
        "success": True,
        "user": user,
        "fitness_data": fitness_data,
        "workout_plans": workout_plans,
        "stats": stats
    }

def generate_workout_plan(fitness_data):
    """Generate workout plan based on fitness data"""
    # Extract fitness parameters
    goal = fitness_data.get("goal", "maintain")
    fitness_level = fitness_data.get("fitness_level", "beginner")
    workout_days = fitness_data.get("workout_days", 3)
    equipment = fitness_data.get("equipment", [])
    
    # Generate plan based on goal
    plans = {
        "lose_fat": {
            "name": "Fat Loss Plan",
            "weekly_split": "Full Body + Cardio",
            "exercises": [
                {"name": "Jumping Jacks", "sets": 3, "reps": 30, "rest": 60},
                {"name": "Push-ups", "sets": 3, "reps": 15, "rest": 60},
                {"name": "Bodyweight Squats", "sets": 3, "reps": 20, "rest": 90},
                {"name": "Mountain Climbers", "sets": 3, "reps": 20, "rest": 60},
                {"name": "Plank", "sets": 3, "reps": "60 seconds", "rest": 60},
                {"name": "Jump Rope", "sets": 3, "reps": "5 minutes", "rest": 120}
            ]
        },
        "gain_muscle": {
            "name": "Muscle Building Plan",
            "weekly_split": "Upper/Lower Split",
            "exercises": [
                {"name": "Push-ups", "sets": 4, "reps": 12, "rest": 90},
                {"name": "Pull-ups", "sets": 4, "reps": 8, "rest": 120},
                {"name": "Bodyweight Squats", "sets": 4, "reps": 15, "rest": 90},
                {"name": "Lunges", "sets": 3, "reps": 12, "rest": 60},
                {"name": "Dips", "sets": 3, "reps": 10, "rest": 90},
                {"name": "Glute Bridges", "sets": 3, "reps": 15, "rest": 60}
            ]
        },
        "maintain": {
            "name": "Maintenance Plan",
            "weekly_split": "Full Body",
            "exercises": [
                {"name": "Push-ups", "sets": 3, "reps": 12, "rest": 60},
                {"name": "Bodyweight Squats", "sets": 3, "reps": 15, "rest": 90},
                {"name": "Lunges", "sets": 3, "reps": 10, "rest": 60},
                {"name": "Plank", "sets": 3, "reps": "45 seconds", "rest": 60},
                {"name": "Jumping Jacks", "sets": 3, "reps": 25, "rest": 60}
            ]
        },
        "endurance": {
            "name": "Endurance Plan",
            "weekly_split": "Cardio Focus",
            "exercises": [
                {"name": "Jump Rope", "sets": 5, "reps": "3 minutes", "rest": 60},
                {"name": "High Knees", "sets": 3, "reps": 30, "rest": 60},
                {"name": "Burpees", "sets": 3, "reps": 10, "rest": 90},
                {"name": "Mountain Climbers", "sets": 3, "reps": 20, "rest": 60},
                {"name": "Jumping Jacks", "sets": 3, "reps": 30, "rest": 60}
            ]
        }
    }
    
    base_plan = plans.get(goal, plans["maintain"])
    
    # Adjust based on fitness level
    if fitness_level == "beginner":
        for exercise in base_plan["exercises"]:
            exercise["sets"] = max(2, exercise["sets"] - 1)
            if isinstance(exercise["reps"], int):
                exercise["reps"] = max(8, exercise["reps"] - 3)
    elif fitness_level == "advanced":
        for exercise in base_plan["exercises"]:
            exercise["sets"] = exercise["sets"] + 1
            if isinstance(exercise["reps"], int):
                exercise["reps"] = exercise["reps"] + 3
    
    return {
        "success": True,
        "plan": {
            **base_plan,
            "fitness_level": fitness_level,
            "workout_days": workout_days,
            "equipment": equipment,
            "personal_data": fitness_data,
            "created_at": datetime.now().isoformat()
        }
    }

def main():
    """Main function to handle HTTP requests"""
    # Read input from stdin (for CGI/fastcgi)
    try:
        # Read the entire input
        input_data = sys.stdin.read()
        
        if not input_data:
            print("Content-Type: application/json")
            print()
            print(json.dumps({"success": False, "message": "No input data"}))
            return
        
        # Parse JSON input
        try:
            data = json.loads(input_data)
        except json.JSONDecodeError:
            print("Content-Type: application/json")
            print()
            print(json.dumps({"success": False, "message": "Invalid JSON"}))
            return
        
        # Handle different actions
        action = data.get("action")
        
        if action == "signup":
            result = save_user(data["data"])
        elif action == "login":
            result = login_user(data["data"])
        elif action == "save_fitness_data":
            result = save_fitness_data(data["data"])
        elif action == "save_workout_plan":
            result = save_workout_plan(data["user_id"], data["data"])
        elif action == "get_user_profile":
            result = get_user_profile(data["user_id"])
        elif action == "generate_workout_plan":
            result = generate_workout_plan(data["data"])
        else:
            result = {"success": False, "message": "Unknown action"}
        
        # Return JSON response
        print("Content-Type: application/json")
        print()
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print("Content-Type: application/json")
        print()
        print(json.dumps({"success": False, "message": f"Server error: {str(e)}"}))

if __name__ == "__main__":
    main()
