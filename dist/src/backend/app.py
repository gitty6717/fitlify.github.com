#!/usr/bin/env python3
"""
FITLIFY V∞ Flask Backend Server
REST API endpoints for the AI-powered fitness platform
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import sys
from pathlib import Path
from datetime import datetime

# Add backend directory to path for imports
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

# Import our modules
from ai_fitness_level import FitnessLevelDeterminer, SafetyEngine
from ai_workout_generator import AIWorkoutGenerator, WorkoutPlanAnalyzer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
DB_PATH = backend_dir.parent / 'database' / 'fitlify_v8.db'

# Initialize AI components
fitness_determiner = FitnessLevelDeterminer()
safety_engine = SafetyEngine()
workout_generator = AIWorkoutGenerator()
plan_analyzer = WorkoutPlanAnalyzer()

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory('../home', 'home.html')

@app.route('/<path:path>')
def serve_static(path):
    # Try to serve from various directories
    directories = ['../home', '../login', '../signup', '../dashboard', '../profile', 
                  '../form', '../plan', '../exercise_selector', '../goal_selector']
    
    for directory in directories:
        file_path = Path(directory) / path
        if file_path.exists():
            return send_from_directory(directory, path)
    
    return jsonify({"error": "File not found"}), 404

# Authentication endpoints
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400
        
        # Check if user already exists
        # This would typically involve database queries
        # For now, simulate successful registration
        
        user_id = f"user_{datetime.now().timestamp()}"
        
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "user": {
                "id": user_id,
                "name": data['name'],
                "email": data['email']
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({"success": False, "message": "Missing email or password"}), 400
        
        # Authenticate user (simplified for demo)
        user_id = f"user_{datetime.now().timestamp()}"
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user_id,
                "name": data.get('name', 'User'),
                "email": data['email']
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Profile endpoints
@app.route('/api/profile/save', methods=['POST'])
def save_profile():
    """Save user profile data"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"success": False, "message": "Missing user ID"}), 400
        
        # Validate profile data
        required_fields = ['age', 'height', 'weight', 'gender', 'fitness_level', 'experience_level']
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400
        
        # Save profile to database (simplified)
        # In a real implementation, this would save to SQLite
        
        return jsonify({
            "success": True,
            "message": "Profile saved successfully"
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/profile/get/<user_id>', methods=['GET'])
def get_profile(user_id):
    """Get user profile data"""
    try:
        # Get profile from database (simplified)
        # In a real implementation, this would query SQLite
        
        profile_data = {
            "user_id": user_id,
            "age": 25,
            "height": 175,
            "weight": 70,
            "gender": "male",
            "fitness_level": "intermediate",
            "experience_level": "6_months_1_year",
            "equipment_access": ["dumbbells", "resistance_bands"],
            "workout_days_per_week": 4,
            "injuries": "",
            "notes": "Want to focus on upper body strength"
        }
        
        return jsonify({
            "success": True,
            "profile": profile_data
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Exercise endpoints
@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    """Get all exercises"""
    try:
        # Get exercises from database
        import sqlite3
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT exercise_id, exercise_name, exercise_category, difficulty, 
                   description, equipment_needed, muscle_groups, safety_notes, 
                   age_restrictions, instructions
            FROM exercises
            ORDER BY exercise_category, exercise_name
        """)
        
        exercises = []
        for row in cursor.fetchall():
            exercises.append({
                "exercise_id": row[0],
                "exercise_name": row[1],
                "exercise_category": row[2],
                "difficulty": row[3],
                "description": row[4],
                "equipment_needed": json.loads(row[5]) if row[5] else [],
                "muscle_groups": json.loads(row[6]) if row[6] else [],
                "safety_notes": row[7],
                "age_restrictions": json.loads(row[8]) if row[8] else [],
                "instructions": json.loads(row[9]) if row[9] else []
            })
        
        conn.close()
        
        return jsonify({
            "success": True,
            "exercises": exercises
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/exercises/save_user_exercises', methods=['POST'])
def save_user_exercises():
    """Save user's selected exercises"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        exercise_ids = data.get('exercise_ids', [])
        
        if not user_id:
            return jsonify({"success": False, "message": "Missing user ID"}), 400
        
        # Save to database (simplified)
        # In a real implementation, this would save to SQLite
        
        return jsonify({
            "success": True,
            "message": f"Saved {len(exercise_ids)} exercises"
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/exercises/get_user_exercises/<user_id>', methods=['GET'])
def get_user_exercises(user_id):
    """Get user's selected exercises"""
    try:
        # Get from database (simplified)
        selected_exercises = ["ex001", "ex016", "ex031"]  # Sample data
        
        return jsonify({
            "success": True,
            "exercise_ids": selected_exercises
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Goal endpoints
@app.route('/api/goals', methods=['GET'])
def get_goals():
    """Get all goals"""
    try:
        # Get goals from database
        import sqlite3
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT goal_id, goal_name, goal_category, difficulty_level, 
                   age_group, description, tags
            FROM goals
            ORDER BY goal_category, goal_name
        """)
        
        goals = []
        for row in cursor.fetchall():
            goals.append({
                "goal_id": row[0],
                "goal_name": row[1],
                "goal_category": row[2],
                "difficulty_level": row[3],
                "age_group": row[4],
                "description": row[5],
                "tags": json.loads(row[6]) if row[6] else []
            })
        
        conn.close()
        
        return jsonify({
            "success": True,
            "goals": goals
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/goals/save_user_goals', methods=['POST'])
def save_user_goals():
    """Save user's selected goals"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        goal_ids = data.get('goal_ids', [])
        
        if not user_id:
            return jsonify({"success": False, "message": "Missing user ID"}), 400
        
        # Save to database (simplified)
        
        return jsonify({
            "success": True,
            "message": f"Saved {len(goal_ids)} goals"
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/goals/get_user_goals/<user_id>', methods=['GET'])
def get_user_goals(user_id):
    """Get user's selected goals"""
    try:
        # Get from database (simplified)
        selected_goals = ["goal001", "goal021", "goal031"]  # Sample data
        
        return jsonify({
            "success": True,
            "goal_ids": selected_goals
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# AI Fitness Level endpoints
@app.route('/api/fitness/determine_level', methods=['POST'])
def determine_fitness_level():
    """Determine user's fitness level using AI"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"success": False, "message": "Missing user ID"}), 400
        
        # Get user data (simplified)
        user_data = {
            "age": data.get('age', 25),
            "height": data.get('height', 175),
            "weight": data.get('weight', 70),
            "experience_level": data.get('experience_level', 'beginner'),
            "workout_days_per_week": data.get('workout_days_per_week', 3),
            "selected_exercises": data.get('selected_exercises', []),
            "selected_goals": data.get('selected_goals', [])
        }
        
        # Determine fitness level
        fitness_level = fitness_determiner.determine_fitness_level(user_data)
        explanation = fitness_determiner.get_fitness_level_explanation(user_data)
        
        return jsonify({
            "success": True,
            "fitness_level": fitness_level,
            "explanation": explanation
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Workout Plan endpoints
@app.route('/api/workout/generate', methods=['POST'])
def generate_workout_plan():
    """Generate AI workout plan"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"success": False, "message": "Missing user ID"}), 400
        
        # Generate workout plan
        result = workout_generator.generate_workout_plan(user_id)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/workout/get/<plan_id>', methods=['GET'])
def get_workout_plan(plan_id):
    """Get specific workout plan"""
    try:
        workout_plan = workout_generator.get_workout_plan(plan_id)
        
        if not workout_plan:
            return jsonify({"success": False, "message": "Workout plan not found"}), 404
        
        return jsonify({
            "success": True,
            "workout_plan": workout_plan
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/workout/get_user_plans/<user_id>', methods=['GET'])
def get_user_workout_plans(user_id):
    """Get all workout plans for a user"""
    try:
        plans = workout_generator.get_user_workout_plans(user_id)
        
        return jsonify({
            "success": True,
            "plans": plans
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/workout/analyze', methods=['POST'])
def analyze_workout_plan():
    """Analyze workout plan for safety and effectiveness"""
    try:
        data = request.get_json()
        workout_plan = data.get('workout_plan')
        
        if not workout_plan:
            return jsonify({"success": False, "message": "Missing workout plan"}), 400
        
        analysis = plan_analyzer.analyze_plan(workout_plan)
        
        return jsonify({
            "success": True,
            "analysis": analysis
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Progress endpoints
@app.route('/api/progress/log', methods=['POST'])
def log_progress():
    """Log user progress"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"success": False, "message": "Missing user ID"}), 400
        
        # Save progress log (simplified)
        
        return jsonify({
            "success": True,
            "message": "Progress logged successfully"
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/progress/get/<user_id>', methods=['GET'])
def get_progress(user_id):
    """Get user progress data"""
    try:
        # Get progress data (simplified)
        progress_data = {
            "weight_logs": [
                {"date": "2024-01-01", "weight": 70.5},
                {"date": "2024-01-08", "weight": 70.2},
                {"date": "2024-01-15", "weight": 69.8}
            ],
            "workout_logs": [
                {"date": "2024-01-01", "completed": True, "plan_id": "plan_001"},
                {"date": "2024-01-03", "completed": True, "plan_id": "plan_001"},
                {"date": "2024-01-05", "completed": False, "plan_id": "plan_001"}
            ]
        }
        
        return jsonify({
            "success": True,
            "progress": progress_data
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# AI Coach endpoints
@app.route('/api/coach/chat', methods=['POST'])
def coach_chat():
    """AI coach chat endpoint"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        question = data.get('question')
        
        if not user_id or not question:
            return jsonify({"success": False, "message": "Missing user ID or question"}), 400
        
        # Generate AI response (simplified)
        response = generate_coach_response(question)
        
        return jsonify({
            "success": True,
            "response": response
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

def generate_coach_response(question):
    """Generate AI coach response (simplified)"""
    question_lower = question.lower()
    
    responses = {
        "squat": "To perform a squat safely: Stand with feet shoulder-width apart, keep your back straight, lower your hips as if sitting in a chair, and keep your knees behind your toes. Start with bodyweight squats before adding weight.",
        "pushup": "For proper push-ups: Start in plank position with hands slightly wider than shoulders, lower your chest to the ground while keeping your body straight, and push back up. Keep your core engaged throughout.",
        "endurance": "To improve endurance: Start with cardiovascular exercises like jogging or cycling, gradually increase duration and intensity, incorporate interval training, and ensure proper recovery between sessions.",
        "strength": "For strength building: Focus on compound exercises, progressive overload, adequate protein intake, and sufficient rest between training sessions.",
        "injury": "If you have an injury: Consult a healthcare provider, focus on exercises that don't aggravate the injury, prioritize proper form, and consider working with a physical therapist."
    }
    
    for keyword, response in responses.items():
        if keyword in question_lower:
            return response
    
    return "I'm here to help with your fitness journey! Feel free to ask me about exercise techniques, workout planning, nutrition advice, or injury prevention. What specific area would you like guidance on?"

# Safety endpoints
@app.route('/api/safety/filter_exercises', methods=['POST'])
def filter_exercises_by_age():
    """Filter exercises based on age restrictions"""
    try:
        data = request.get_json()
        exercise_ids = data.get('exercise_ids', [])
        age = data.get('age', 25)
        
        filtered_ids = safety_engine.filter_exercises_by_age(exercise_ids, age)
        
        return jsonify({
            "success": True,
            "filtered_exercise_ids": filtered_ids
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/safety/guidelines/<int:age>', methods=['GET'])
def get_safety_guidelines(age):
    """Get age-specific safety guidelines"""
    try:
        guidelines = safety_engine.get_age_safety_guidelines(age)
        
        return jsonify({
            "success": True,
            "guidelines": guidelines
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "message": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"success": False, "message": "Internal server error"}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })

# Cleanup on shutdown
@app.teardown_appcontext
def cleanup(exception):
    """Clean up resources"""
    pass

if __name__ == '__main__':
    # Create database if it doesn't exist
    if not DB_PATH.exists():
        print("Database not found. Please run the database initialization script first.")
        sys.exit(1)
    
    print("Starting FITLIFY V∞ Backend Server...")
    print("Database:", DB_PATH)
    print("Server will be available at: http://localhost:5000")
    
    # Run the Flask app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
