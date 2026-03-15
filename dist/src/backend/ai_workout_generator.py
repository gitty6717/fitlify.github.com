#!/usr/bin/env python3
"""
FITLIFY V∞ AI Workout Generator
Google Gemini API integration for personalized workout plan generation
"""

import json
import sqlite3
import requests
import os
from typing import Dict, List, Any
from pathlib import Path
from datetime import datetime

# Google Gemini API Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyCu6wkN9zKYIkMoTwbXE4w9AYvHoYDfAGg')
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

DB_FILE = Path(__file__).parent.parent / 'database' / 'fitlify_v8.db'

class AIWorkoutGenerator:
    """AI-powered workout plan generator using Google Gemini API"""
    
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.conn = sqlite3.connect(DB_FILE)
        self.conn.row_factory = sqlite3.Row
    
    def generate_workout_plan(self, user_id: str) -> Dict[str, Any]:
        """
        Generate a personalized workout plan using AI
        
        Combines:
        - User profile
        - Selected goals
        - Exercise capabilities
        - Fitness level
        - Safety considerations
        """
        
        # Gather user data
        user_data = self._get_user_data(user_id)
        if not user_data:
            return {"success": False, "message": "User data not found"}
        
        # Apply safety filters
        filtered_exercises = self._apply_safety_filters(user_data)
        
        # Generate AI prompt
        prompt = self._create_workout_prompt(user_data, filtered_exercises)
        
        # Call Gemini API
        ai_response = self._call_gemini_api(prompt)
        
        if not ai_response:
            return {"success": False, "message": "Failed to generate workout plan"}
        
        # Parse and structure the response
        workout_plan = self._parse_ai_response(ai_response, user_data)
        
        # Save to database
        plan_id = self._save_workout_plan(user_id, workout_plan)
        
        return {
            "success": True,
            "plan_id": plan_id,
            "workout_plan": workout_plan
        }
    
    def _get_user_data(self, user_id: str) -> Dict[str, Any]:
        """Gather comprehensive user data for workout generation"""
        cursor = self.conn.cursor()
        
        # Get user profile
        cursor.execute("""
            SELECT u.*, p.* FROM users u 
            JOIN profiles p ON u.id = p.user_id 
            WHERE u.id = ?
        """, (user_id,))
        
        user_profile = cursor.fetchone()
        if not user_profile:
            return None
        
        # Convert to dict
        user_data = dict(user_profile)
        
        # Get selected exercises
        cursor.execute("""
            SELECT e.* FROM user_exercises ue
            JOIN exercises e ON ue.exercise_id = e.exercise_id
            WHERE ue.user_id = ?
        """, (user_id,))
        
        exercises = cursor.fetchall()
        user_data['selected_exercises'] = [dict(ex) for ex in exercises]
        
        # Get selected goals
        cursor.execute("""
            SELECT g.* FROM selected_goals sg
            JOIN goals g ON sg.goal_id = g.goal_id
            WHERE sg.user_id = ?
        """, (user_id,))
        
        goals = cursor.fetchall()
        user_data['selected_goals'] = [dict(goal) for goal in goals]
        
        return user_data
    
    def _apply_safety_filters(self, user_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply age and safety appropriate exercise filters"""
        from ai_fitness_level import SafetyEngine
        
        safety_engine = SafetyEngine()
        age = user_data.get('age', 25)
        
        # Filter exercises by age
        exercise_ids = [ex['exercise_id'] for ex in user_data.get('selected_exercises', [])]
        filtered_ids = safety_engine.filter_exercises_by_age(exercise_ids, age)
        
        # Return filtered exercise details
        filtered_exercises = []
        for ex in user_data.get('selected_exercises', []):
            if ex['exercise_id'] in filtered_ids:
                filtered_exercises.append(ex)
        
        safety_engine.close()
        return filtered_exercises
    
    def _create_workout_prompt(self, user_data: Dict[str, Any], exercises: List[Dict[str, Any]]) -> str:
        """Create comprehensive prompt for AI workout generation"""
        
        # Extract key information
        age = user_data.get('age', 25)
        height = user_data.get('height', 170)
        weight = user_data.get('weight', 70)
        gender = user_data.get('gender', 'other')
        fitness_level = user_data.get('fitness_level', 'beginner')
        experience_level = user_data.get('experience_level', 'none')
        workout_days = user_data.get('workout_days_per_week', 3)
        equipment = json.loads(user_data.get('equipment_access', '[]'))
        injuries = user_data.get('injuries', '')
        notes = user_data.get('notes', '')
        
        # Get exercise capabilities
        exercise_list = [ex['exercise_name'] for ex in exercises]
        exercise_categories = list(set([ex['exercise_category'] for ex in exercises]))
        
        # Get goals
        goals = [goal['goal_name'] for goal in user_data.get('selected_goals', [])]
        goal_categories = list(set([goal['goal_category'] for goal in user_data.get('selected_goals', [])]))
        
        prompt = f"""
You are an expert fitness trainer and AI workout specialist. Create a personalized workout plan based on the following user profile:

USER PROFILE:
- Age: {age} years old
- Gender: {gender}
- Height: {height} cm
- Weight: {weight} kg
- Fitness Level: {fitness_level}
- Experience Level: {experience_level}
- Workout Days Per Week: {workout_days}
- Available Equipment: {', '.join(equipment) if equipment else 'Bodyweight only'}
- Injuries/Limitations: {injuries if injuries else 'None'}
- Additional Notes: {notes if notes else 'None'}

EXERCISE CAPABILITIES:
Can Perform: {', '.join(exercise_list) if exercise_list else 'Basic exercises'}
Available Categories: {', '.join(exercise_categories) if exercise_categories else 'Basic movements'}

FITNESS GOALS:
Primary Goals: {', '.join(goals) if goals else 'General fitness'}
Goal Categories: {', '.join(goal_categories) if goal_categories else 'Overall health'}

REQUIREMENTS:
1. Create a {workout_days}-day workout plan
2. Use ONLY exercises the user can perform from their exercise capabilities
3. Consider their fitness level and experience
4. Account for any injuries or limitations
5. Use available equipment only
6. Focus on achieving their specific goals
7. Ensure proper progression and safety
8. Include warm-up and cool-down for each workout

STRUCTURE YOUR RESPONSE AS JSON:
{{
    "plan_name": "Descriptive plan name",
    "weekly_split": "Type of weekly split (e.g., 'Upper/Lower', 'Full Body', 'Push/Pull/Legs')",
    "fitness_level": "{fitness_level}",
    "goals_achieved": ["List of goals this plan addresses"],
    "workouts": [
        {{
            "day": 1,
            "focus": "Workout focus (e.g., 'Upper Body Strength')",
            "warmup": [
                {{"name": "Exercise name", "duration": "5 minutes", "description": "Brief description"}}
            ],
            "exercises": [
                {{
                    "name": "Exercise name",
                    "sets": 3,
                    "reps": "12-15",
                    "rest": "60 seconds",
                    "description": "Form cues and tips",
                    "muscle_groups": ["targeted muscles"],
                    "difficulty": "beginner|intermediate|advanced"
                }}
            ],
            "cool_down": [
                {{"name": "Stretch name", "duration": "5 minutes", "description": "Brief description"}}
            ],
            "estimated_duration": "45 minutes"
        }}
    ],
    "progression_tips": ["Tips for progressing this plan"],
    "safety_notes": ["Important safety considerations"],
    "nutrition_tips": ["Basic nutrition advice for this plan"],
    "rest_day_recommendations": ["Activities for rest days"]
}}

IMPORTANT GUIDELINES:
- Start with appropriate intensity for {fitness_level} level
- Include compound movements when possible
- Balance push/pull and upper/lower body exercises
- Ensure adequate rest between workouts
- Include variety to prevent boredom
- Focus on proper form over heavy weights
- Consider age-appropriate exercises for {age} years old

Generate a complete, safe, and effective workout plan that will help the user achieve their goals.
"""
        
        return prompt
    
    def _call_gemini_api(self, prompt: str) -> str:
        """Call Google Gemini API to generate workout plan"""
        
        headers = {
            'Content-Type': 'application/json',
        }
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }
        
        try:
            response = requests.post(
                f"{GEMINI_API_URL}?key={self.api_key}",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and len(result['candidates']) > 0:
                    return result['candidates'][0]['content']['parts'][0]['text']
                else:
                    print("No candidates in Gemini response")
                    return None
            else:
                print(f"Gemini API error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error: {e}")
            return None
    
    def _parse_ai_response(self, ai_response: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse and structure the AI response"""
        
        try:
            # Try to extract JSON from the response
            import re
            
            # Look for JSON pattern in the response
            json_match = re.search(r'\{[\s\S]*\}', ai_response)
            if json_match:
                json_str = json_match.group(0)
                workout_plan = json.loads(json_str)
            else:
                # Fallback: create basic structure
                workout_plan = self._create_fallback_plan(user_data)
            
            # Add metadata
            workout_plan['ai_generated'] = True
            workout_plan['created_at'] = datetime.now().isoformat()
            workout_plan['user_data_summary'] = {
                'age': user_data.get('age'),
                'fitness_level': user_data.get('fitness_level'),
                'goals': [goal['goal_name'] for goal in user_data.get('selected_goals', [])],
                'workout_days': user_data.get('workout_days_per_week')
            }
            
            return workout_plan
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            return self._create_fallback_plan(user_data)
        except Exception as e:
            print(f"Error parsing AI response: {e}")
            return self._create_fallback_plan(user_data)
    
    def _create_fallback_plan(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a fallback workout plan if AI generation fails"""
        
        fitness_level = user_data.get('fitness_level', 'beginner')
        workout_days = user_data.get('workout_days_per_week', 3)
        goals = [goal['goal_name'] for goal in user_data.get('selected_goals', [])]
        
        # Basic workout templates
        templates = {
            'beginner': {
                'plan_name': 'Beginner Full Body Strength',
                'weekly_split': 'Full Body',
                'focus': 'Basic strength and conditioning'
            },
            'intermediate': {
                'plan_name': 'Intermediate Strength & Conditioning',
                'weekly_split': 'Upper/Lower Split',
                'focus': 'Building strength and muscle'
            },
            'advanced': {
                'plan_name': 'Advanced Performance Training',
                'weekly_split': 'Push/Pull/Legs',
                'focus': 'Peak performance and strength'
            }
        }
        
        template = templates.get(fitness_level, templates['beginner'])
        
        # Create basic workouts
        workouts = []
        for day in range(1, workout_days + 1):
            workout = {
                "day": day,
                "focus": f"Day {day} - {template['focus']}",
                "warmup": [
                    {"name": "Light Cardio", "duration": "5 minutes", "description": "Jumping jacks or light jogging"}
                ],
                "exercises": [
                    {
                        "name": "Push-ups",
                        "sets": 3,
                        "reps": "10-15",
                        "rest": "60 seconds",
                        "description": "Keep back straight, lower chest to ground",
                        "muscle_groups": ["chest", "shoulders", "triceps"],
                        "difficulty": "beginner"
                    },
                    {
                        "name": "Bodyweight Squats",
                        "sets": 3,
                        "reps": "15-20",
                        "rest": "60 seconds",
                        "description": "Keep back straight, lower hips to 90 degrees",
                        "muscle_groups": ["quadriceps", "glutes", "hamstrings"],
                        "difficulty": "beginner"
                    },
                    {
                        "name": "Plank",
                        "sets": 3,
                        "reps": "30 seconds",
                        "rest": "60 seconds",
                        "description": "Hold straight body position",
                        "muscle_groups": ["core", "shoulders"],
                        "difficulty": "beginner"
                    }
                ],
                "cool_down": [
                    {"name": "Full Body Stretch", "duration": "5 minutes", "description": "Gentle stretching for major muscle groups"}
                ],
                "estimated_duration": "30 minutes"
            }
            workouts.append(workout)
        
        return {
            "plan_name": template['plan_name'],
            "weekly_split": template['weekly_split'],
            "fitness_level": fitness_level,
            "goals_achieved": goals,
            "workouts": workouts,
            "progression_tips": [
                "Increase reps when current reps feel easy",
                "Add sets when you can complete all reps with good form",
                "Focus on proper technique before increasing intensity"
            ],
            "safety_notes": [
                "Always warm up before exercising",
                "Stop if you feel pain",
                "Stay hydrated throughout your workout",
                "Consult a doctor before starting any new exercise program"
            ],
            "nutrition_tips": [
                "Eat protein within 30 minutes after workout",
                "Stay hydrated throughout the day",
                "Eat a balanced diet with plenty of fruits and vegetables"
            ],
            "rest_day_recommendations": [
                "Light walking or stretching",
                "Focus on recovery and nutrition",
                "Get adequate sleep"
            ],
            "ai_generated": False,
            "created_at": datetime.now().isoformat(),
            "user_data_summary": {
                'age': user_data.get('age'),
                'fitness_level': fitness_level,
                'goals': goals,
                'workout_days': workout_days
            }
        }
    
    def _save_workout_plan(self, user_id: str, workout_plan: Dict[str, Any]) -> str:
        """Save the generated workout plan to database"""
        cursor = self.conn.cursor()
        
        # Generate unique plan ID
        import uuid
        plan_id = str(uuid.uuid4())
        
        # Save workout plan
        cursor.execute("""
            INSERT INTO workout_plans (
                plan_id, user_id, plan_name, plan_json, fitness_level, 
                weekly_split, total_days, ai_generated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            plan_id,
            user_id,
            workout_plan['plan_name'],
            json.dumps(workout_plan),
            workout_plan['fitness_level'],
            workout_plan['weekly_split'],
            len(workout_plan['workouts']),
            workout_plan.get('ai_generated', False)
        ))
        
        self.conn.commit()
        return plan_id
    
    def get_workout_plan(self, plan_id: str) -> Dict[str, Any]:
        """Retrieve a saved workout plan"""
        cursor = self.conn.cursor()
        
        cursor.execute("""
            SELECT plan_json FROM workout_plans WHERE plan_id = ?
        """, (plan_id,))
        
        result = cursor.fetchone()
        if result:
            return json.loads(result['plan_json'])
        else:
            return None
    
    def get_user_workout_plans(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all workout plans for a user"""
        cursor = self.conn.cursor()
        
        cursor.execute("""
            SELECT plan_id, plan_name, created_at, fitness_level, 
                   weekly_split, total_days, is_active, ai_generated
            FROM workout_plans 
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,))
        
        plans = []
        for row in cursor.fetchall():
            plans.append(dict(row))
        
        return plans
    
    def close(self):
        """Close database connection"""
        self.conn.close()

# Workout Plan Analyzer
class WorkoutPlanAnalyzer:
    """Analyze and validate workout plans"""
    
    def __init__(self):
        self.conn = sqlite3.connect(DB_FILE)
        self.conn.row_factory = sqlite3.Row
    
    def analyze_plan(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a workout plan for safety and effectiveness"""
        
        analysis = {
            "safety_score": 0,
            "effectiveness_score": 0,
            "balance_score": 0,
            "warnings": [],
            "recommendations": []
        }
        
        # Analyze each workout
        total_exercises = 0
        muscle_groups = set()
        
        for workout in plan.get('workouts', []):
            for exercise in workout.get('exercises', []):
                total_exercises += 1
                
                # Track muscle groups for balance analysis
                groups = exercise.get('muscle_groups', [])
                muscle_groups.update(groups)
                
                # Safety checks
                sets = exercise.get('sets', 0)
                reps = exercise.get('reps', '0')
                
                if sets > 5:
                    analysis["warnings"].append(f"High volume in {exercise['name']}: {sets} sets")
                
                if isinstance(reps, str) and '+' in reps:
                    # Check for very high rep ranges
                    rep_numbers = reps.replace('+', '').split('-')
                    try:
                        max_reps = max([int(r) for r in rep_numbers])
                        if max_reps > 25:
                            analysis["warnings"].append(f"Very high reps in {exercise['name']}: {reps}")
                    except ValueError:
                        pass
        
        # Calculate scores
        analysis["safety_score"] = max(0, 100 - len(analysis["warnings"]) * 10)
        analysis["balance_score"] = min(100, len(muscle_groups) * 10)
        analysis["effectiveness_score"] = (analysis["safety_score"] + analysis["balance_score"]) // 2
        
        # Generate recommendations
        if len(muscle_groups) < 6:
            analysis["recommendations"].append("Consider adding more variety of muscle groups")
        
        if total_exercises < len(plan.get('workouts', [])) * 3:
            analysis["recommendations"].append("Consider adding more exercises per workout")
        
        return analysis
    
    def close(self):
        """Close database connection"""
        self.conn.close()

# Example usage
if __name__ == "__main__":
    # Test the AI workout generator
    generator = AIWorkoutGenerator()
    
    # Test with sample user ID
    test_user_id = "demo_user"
    
    # Generate workout plan
    result = generator.generate_workout_plan(test_user_id)
    
    if result["success"]:
        print("Workout plan generated successfully!")
        print(f"Plan ID: {result['plan_id']}")
        print(f"Plan Name: {result['workout_plan']['plan_name']}")
        
        # Analyze the plan
        analyzer = WorkoutPlanAnalyzer()
        analysis = analyzer.analyze_plan(result['workout_plan'])
        
        print(f"\nPlan Analysis:")
        print(f"Safety Score: {analysis['safety_score']}")
        print(f"Effectiveness Score: {analysis['effectiveness_score']}")
        print(f"Balance Score: {analysis['balance_score']}")
        
        if analysis['warnings']:
            print(f"\nWarnings:")
            for warning in analysis['warnings']:
                print(f"- {warning}")
        
        analyzer.close()
    else:
        print(f"Error: {result['message']}")
    
    generator.close()
