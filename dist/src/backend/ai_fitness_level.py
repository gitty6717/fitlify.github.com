#!/usr/bin/env python3
"""
FITLIFY V∞ AI Fitness Level Determination System
Automatically determines user fitness level based on multiple factors
"""

import sqlite3
import json
from typing import Dict, List, Tuple
from pathlib import Path

DB_FILE = Path(__file__).parent / 'fitlify_v8.db'

class FitnessLevelDeterminer:
    """AI-powered fitness level determination system"""
    
    def __init__(self):
        self.conn = sqlite3.connect(DB_FILE)
        self.conn.row_factory = sqlite3.Row
    
    def determine_fitness_level(self, user_data: Dict) -> str:
        """
        Determine fitness level based on comprehensive analysis
        
        INPUT VARIABLES:
        - age
        - height
        - weight
        - exercise familiarity (selected exercises)
        - selected goals
        - weekly activity level (workout_days_per_week)
        - experience_level
        
        OUTPUT LEVELS:
        - beginner
        - beginner_intermediate
        - intermediate
        - intermediate_advanced
        - advanced
        """
        
        # Base score from experience level
        experience_scores = {
            'none': 0,
            'less_than_6_months': 15,
            '6_months_1_year': 30,
            '1_2_years': 45,
            'more_than_2_years': 60
        }
        
        base_score = experience_scores.get(user_data.get('experience_level', 'none'), 0)
        
        # Exercise capability analysis
        exercise_score = self._analyze_exercise_capabilities(user_data.get('selected_exercises', []))
        
        # Goal analysis
        goal_score = self._analyze_goal_difficulty(user_data.get('selected_goals', []))
        
        # Activity level analysis
        activity_score = self._analyze_activity_level(user_data.get('workout_days_per_week', 1))
        
        # Age factor (younger users get slight advantage for advanced movements)
        age_factor = self._calculate_age_factor(user_data.get('age', 25))
        
        # Body metrics analysis (BMI and weight considerations)
        body_score = self._analyze_body_metrics(
            user_data.get('height', 170), 
            user_data.get('weight', 70),
            user_data.get('age', 25)
        )
        
        # Calculate total score
        total_score = (
            base_score * 0.3 +      # 30% weight on experience
            exercise_score * 0.25 +  # 25% weight on exercise capabilities
            goal_score * 0.15 +      # 15% weight on goal difficulty
            activity_score * 0.15 +  # 15% weight on activity level
            body_score * 0.1 +       # 10% weight on body metrics
            age_factor * 0.05       # 5% weight on age
        )
        
        # Determine fitness level based on score
        return self._score_to_fitness_level(total_score)
    
    def _analyze_exercise_capabilities(self, selected_exercises: List[str]) -> float:
        """Analyze exercise capabilities to determine fitness level"""
        if not selected_exercises:
            return 0
        
        cursor = self.conn.cursor()
        
        # Get exercise details
        exercise_ids = "', '".join(selected_exercises)
        query = f"""
            SELECT exercise_id, exercise_name, difficulty, exercise_category 
            FROM exercises 
            WHERE exercise_id IN ('{exercise_ids}')
        """
        cursor.execute(query)
        exercises = cursor.fetchall()
        
        if not exercises:
            return 0
        
        # Score based on exercise difficulty and variety
        difficulty_scores = {'beginner': 10, 'intermediate': 25, 'advanced': 40}
        category_bonus = {}
        
        total_score = 0
        categories_covered = set()
        
        for exercise in exercises:
            difficulty = exercise['difficulty']
            category = exercise['exercise_category']
            
            # Base score for difficulty
            total_score += difficulty_scores.get(difficulty, 10)
            
            # Track categories for variety bonus
            categories_covered.add(category)
        
        # Variety bonus (more categories = higher fitness level)
        variety_bonus = min(len(categories_covered) * 5, 25)
        total_score += variety_bonus
        
        # Normalize to 0-100 scale
        return min(total_score, 100)
    
    def _analyze_goal_difficulty(self, selected_goals: List[str]) -> float:
        """Analyze selected goals to determine fitness level"""
        if not selected_goals:
            return 20  # Default moderate score
        
        cursor = self.conn.cursor()
        
        # Get goal details
        goal_ids = "', '".join(selected_goals)
        query = f"""
            SELECT goal_id, goal_name, difficulty_level 
            FROM goals 
            WHERE goal_id IN ('{goal_ids}')
        """
        cursor.execute(query)
        goals = cursor.fetchall()
        
        if not goals:
            return 20
        
        # Score based on goal difficulty
        difficulty_scores = {'beginner': 15, 'intermediate': 30, 'advanced': 45}
        
        total_score = 0
        for goal in goals:
            difficulty = goal['difficulty_level']
            total_score += difficulty_scores.get(difficulty, 15)
        
        # Average score and normalize
        avg_score = total_score / len(goals) if goals else 20
        return min(avg_score, 100)
    
    def _analyze_activity_level(self, workout_days: int) -> float:
        """Analyze weekly activity level"""
        # Score based on workout frequency
        if workout_days <= 1:
            return 10
        elif workout_days <= 2:
            return 25
        elif workout_days <= 3:
            return 40
        elif workout_days <= 4:
            return 55
        elif workout_days <= 5:
            return 70
        elif workout_days <= 6:
            return 85
        else:
            return 100
    
    def _calculate_age_factor(self, age: int) -> float:
        """Calculate age factor for fitness determination"""
        # Age considerations for fitness level
        if age < 14:
            return 20  # Limited advanced exercises available
        elif age < 18:
            return 40  # Good potential but still developing
        elif age < 30:
            return 60  # Prime age for fitness development
        elif age < 45:
            return 50  # Good fitness potential
        elif age < 60:
            return 35  # Moderate potential with limitations
        else:
            return 25  # Limited advanced exercise capability
    
    def _analyze_body_metrics(self, height: float, weight: float, age: int) -> float:
        """Analyze body metrics for fitness level indication"""
        # Calculate BMI
        height_m = height / 100
        bmi = weight / (height_m * height_m)
        
        # BMI considerations
        if bmi < 18.5:
            return 30  # Underweight, may limit strength
        elif bmi < 25:
            return 60  # Healthy weight, good for fitness
        elif bmi < 30:
            return 40  # Overweight, may affect endurance
        else:
            return 25  # Obese, significant limitations
    
    def _score_to_fitness_level(self, score: float) -> str:
        """Convert numerical score to fitness level"""
        if score < 20:
            return "beginner"
        elif score < 35:
            return "beginner_intermediate"
        elif score < 50:
            return "intermediate"
        elif score < 65:
            return "intermediate_advanced"
        else:
            return "advanced"
    
    def get_fitness_level_explanation(self, user_data: Dict) -> Dict:
        """Get detailed explanation of fitness level determination"""
        fitness_level = self.determine_fitness_level(user_data)
        
        # Get detailed analysis
        exercise_score = self._analyze_exercise_capabilities(user_data.get('selected_exercises', []))
        goal_score = self._analyze_goal_difficulty(user_data.get('selected_goals', []))
        activity_score = self._analyze_activity_level(user_data.get('workout_days_per_week', 1))
        
        explanations = {
            "beginner": {
                "title": "Beginner Level",
                "description": "You're just starting your fitness journey. Focus on building fundamental movement patterns and consistency.",
                "recommendations": [
                    "Start with basic bodyweight exercises",
                    "Focus on proper form over intensity",
                    "Aim for 2-3 workout days per week",
                    "Gradually increase workout duration"
                ],
                "next_steps": "Master basic exercises like push-ups, squats, and planks before progressing to more complex movements."
            },
            "beginner_intermediate": {
                "title": "Beginner-Intermediate Level", 
                "description": "You've built a solid foundation and are ready to increase intensity and variety.",
                "recommendations": [
                    "Introduce resistance training",
                    "Increase workout frequency to 3-4 days",
                    "Try more exercise variations",
                    "Focus on progressive overload"
                ],
                "next_steps": "Start adding weights and more complex exercise variations to your routine."
            },
            "intermediate": {
                "title": "Intermediate Level",
                "description": "You have good exercise knowledge and consistency. Time to focus on specific goals and advanced techniques.",
                "recommendations": [
                    "Implement structured training programs",
                    "Train 4-5 days per week",
                    "Focus on specific fitness goals",
                    "Include advanced exercise variations"
                ],
                "next_steps": "Develop specialized training plans for your specific goals like strength building or athletic performance."
            },
            "intermediate_advanced": {
                "title": "Intermediate-Advanced Level",
                "description": "You're experienced and ready for high-level training protocols and intense workouts.",
                "recommendations": [
                    "Train 5-6 days per week",
                    "Use advanced training techniques",
                    "Focus on performance optimization",
                    "Include sport-specific training"
                ],
                "next_steps": "Implement advanced training methods like periodization and plyometrics."
            },
            "advanced": {
                "title": "Advanced Level",
                "description": "You're an elite athlete or highly experienced fitness enthusiast with exceptional capabilities.",
                "recommendations": [
                    "Train 6-7 days per week with proper periodization",
                    "Use professional-level programming",
                    "Focus on peak performance",
                    "Consider competitive goals"
                ],
                "next_steps": "You're ready for elite training protocols and competitive-level programming."
            }
        }
        
        return {
            "fitness_level": fitness_level,
            "analysis": {
                "exercise_capability_score": round(exercise_score, 1),
                "goal_difficulty_score": round(goal_score, 1),
                "activity_level_score": round(activity_score, 1)
            },
            "explanation": explanations.get(fitness_level, explanations["beginner"])
        }
    
    def close(self):
        """Close database connection"""
        self.conn.close()

# Safety Engine for Age-Appropriate Training
class SafetyEngine:
    """Ensures age-appropriate exercise recommendations"""
    
    def __init__(self):
        self.conn = sqlite3.connect(DB_FILE)
        self.conn.row_factory = sqlite3.Row
    
    def filter_exercises_by_age(self, exercise_ids: List[str], age: int) -> List[str]:
        """Filter exercises based on age restrictions"""
        if age >= 18:
            return exercise_ids  # No restrictions for adults
        
        cursor = self.conn.cursor()
        
        # Get age-appropriate exercises
        if age <= 9:
            age_groups = ['6_9', 'all']
        elif age <= 13:
            age_groups = ['6_9', '10_13', 'all']
        else:  # 14-17
            age_groups = ['6_9', '10_13', '14_17', 'all']
        
        # Filter exercises
        placeholders = ','.join(['?' for _ in exercise_ids])
        query = f"""
            SELECT exercise_id FROM exercises 
            WHERE exercise_id IN ({placeholders})
            AND (
                age_restrictions LIKE '%all%' OR
                age_restrictions LIKE '%{age_groups[0]}%' OR
                age_restrictions LIKE '%{age_groups[-1] if len(age_groups) > 1 else age_groups[0]}%'
            )
        """
        
        cursor.execute(query, exercise_ids)
        result = cursor.fetchall()
        
        return [row['exercise_id'] for row in result]
    
    def get_age_safety_guidelines(self, age: int) -> Dict:
        """Get age-specific safety guidelines"""
        guidelines = {
            "6_9": {
                "allowed_activities": [
                    "Running and jogging",
                    "Jumping and hopping",
                    "Basic stretching",
                    "Bodyweight movements",
                    "Fun games and activities"
                ],
                "forbidden_activities": [
                    "Heavy resistance training",
                    "High-impact plyometrics",
                    "Advanced gymnastics",
                    "Heavy weightlifting"
                ],
                "safety_notes": [
                    "Focus on fun and movement patterns",
                    "Keep sessions short (20-30 minutes)",
                    "Emphasize proper form",
                    "Adult supervision required"
                ]
            },
            "10_13": {
                "allowed_activities": [
                    "Bodyweight strength training",
                    "Light resistance bands",
                    "Basic weight training with light weights",
                    "Cardiovascular exercises",
                    "Flexibility and mobility work"
                ],
                "forbidden_activities": [
                    "Heavy weightlifting",
                    "Advanced plyometrics",
                    "High-intensity interval training",
                    "Maximum effort lifts"
                ],
                "safety_notes": [
                    "Focus on technique over weight",
                    "Gradual progression",
                    "Proper warm-up essential",
                    "Monitor for overtraining"
                ]
            },
            "14_17": {
                "allowed_activities": [
                    "Structured resistance training",
                    "Moderate weightlifting",
                    "Plyometric exercises",
                    "Sport-specific training",
                    "Advanced cardiovascular training"
                ],
                "forbidden_activities": [
                    "Maximum weight attempts",
                    "Extreme high-intensity training",
                    "Professional-level protocols"
                ],
                "safety_notes": [
                    "Proper programming essential",
                    "Focus on long-term development",
                    "Adequate recovery time",
                    "Professional coaching recommended"
                ]
            }
        }
        
        if age <= 9:
            return guidelines["6_9"]
        elif age <= 13:
            return guidelines["10_13"]
        elif age <= 17:
            return guidelines["14_17"]
        else:
            return {
                "allowed_activities": ["All age-appropriate exercises"],
                "forbidden_activities": ["Exercises beyond individual capability"],
                "safety_notes": ["Focus on proper form and progressive overload"]
            }
    
    def close(self):
        """Close database connection"""
        self.conn.close()

# Example usage and testing
if __name__ == "__main__":
    # Test the fitness level determination
    determiner = FitnessLevelDeterminer()
    
    # Example user data
    test_user = {
        "age": 25,
        "height": 175,
        "weight": 70,
        "experience_level": "6_months_1_year",
        "workout_days_per_week": 3,
        "selected_exercises": ["ex001", "ex016", "ex031"],  # Push-ups, Squats, Plank
        "selected_goals": ["goal001", "goal021"]  # Build strength, lose fat
    }
    
    # Determine fitness level
    fitness_level = determiner.determine_fitness_level(test_user)
    explanation = determiner.get_fitness_level_explanation(test_user)
    
    print(f"Determined Fitness Level: {fitness_level}")
    print(f"Explanation: {explanation}")
    
    # Test safety engine
    safety = SafetyEngine()
    
    # Test age filtering
    child_exercises = ["ex001", "ex004", "ex054"]  # Mix of exercises
    filtered_exercises = safety.filter_exercises_by_age(child_exercises, 12)
    print(f"Age-appropriate exercises for 12-year-old: {filtered_exercises}")
    
    guidelines = safety.get_age_safety_guidelines(12)
    print(f"Safety guidelines for 12-year-old: {guidelines}")
    
    # Close connections
    determiner.close()
    safety.close()
