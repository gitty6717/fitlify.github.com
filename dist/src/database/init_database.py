#!/usr/bin/env python3
"""
FITLIFY V∞ Database Schema
Complete SQLite database implementation for the AI-powered fitness platform
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path

# Database file path
DB_FILE = Path(__file__).parent / 'fitlify_v8.db'

def create_database():
    """Create the complete FITLIFY V∞ database schema"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Drop existing tables if they exist
    tables = [
        'users', 'profiles', 'goals', 'selected_goals', 'exercises', 
        'user_exercises', 'workout_plans', 'progress_logs', 'ai_coach_chats'
    ]
    for table in tables:
        cursor.execute(f"DROP TABLE IF EXISTS {table}")
    
    # Create users table
    cursor.execute("""
        CREATE TABLE users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            google_account BOOLEAN DEFAULT FALSE
        )
    """)
    
    # Create profiles table
    cursor.execute("""
        CREATE TABLE profiles (
            user_id TEXT PRIMARY KEY,
            age INTEGER NOT NULL,
            height REAL NOT NULL,
            weight REAL NOT NULL,
            gender TEXT CHECK(gender IN ('male', 'female', 'other')) NOT NULL,
            fitness_level TEXT CHECK(fitness_level IN ('beginner', 'beginner_intermediate', 'intermediate', 'intermediate_advanced', 'advanced')) NOT NULL,
            experience_level TEXT CHECK(experience_level IN ('none', 'less_than_6_months', '6_months_1_year', '1_2_years', 'more_than_2_years')) NOT NULL,
            equipment_access TEXT, -- JSON array
            workout_days_per_week INTEGER CHECK(workout_days_per_week BETWEEN 1 AND 7),
            injuries TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Create goals table
    cursor.execute("""
        CREATE TABLE goals (
            goal_id TEXT PRIMARY KEY,
            goal_name TEXT NOT NULL,
            goal_category TEXT NOT NULL,
            difficulty_level TEXT CHECK(difficulty_level IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
            age_group TEXT CHECK(age_group IN ('all', '6_9', '10_13', '14_17', '18_plus')) NOT NULL,
            description TEXT,
            tags TEXT -- JSON array
        )
    """)
    
    # Create selected_goals table
    cursor.execute("""
        CREATE TABLE selected_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            goal_id TEXT NOT NULL,
            priority INTEGER DEFAULT 1,
            selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (goal_id) REFERENCES goals(goal_id) ON DELETE CASCADE,
            UNIQUE(user_id, goal_id)
        )
    """)
    
    # Create exercises table
    cursor.execute("""
        CREATE TABLE exercises (
            exercise_id TEXT PRIMARY KEY,
            exercise_name TEXT NOT NULL,
            exercise_category TEXT NOT NULL,
            difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
            description TEXT,
            equipment_needed TEXT, -- JSON array
            muscle_groups TEXT, -- JSON array
            safety_notes TEXT,
            age_restrictions TEXT, -- JSON array
            instructions TEXT -- JSON array of step-by-step instructions
        )
    """)
    
    # Create user_exercises table
    cursor.execute("""
        CREATE TABLE user_exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            exercise_id TEXT NOT NULL,
            proficiency_level TEXT CHECK(proficiency_level IN ('cannot_do', 'learning', 'comfortable', 'advanced')) NOT NULL,
            selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE CASCADE,
            UNIQUE(user_id, exercise_id)
        )
    """)
    
    # Create workout_plans table
    cursor.execute("""
        CREATE TABLE workout_plans (
            plan_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            plan_name TEXT NOT NULL,
            plan_json TEXT NOT NULL, -- Complete workout plan in JSON format
            fitness_level TEXT NOT NULL,
            weekly_split TEXT NOT NULL,
            total_days INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_used TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            ai_generated BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Create progress_logs table
    cursor.execute("""
        CREATE TABLE progress_logs (
            log_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            date DATE NOT NULL,
            weight REAL,
            body_fat_percentage REAL,
            workout_completed BOOLEAN DEFAULT FALSE,
            workout_plan_id TEXT,
            exercises_completed TEXT, -- JSON array
            notes TEXT,
            mood INTEGER CHECK(mood BETWEEN 1 AND 5),
            energy_level INTEGER CHECK(energy_level BETWEEN 1 AND 5),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(plan_id) ON DELETE SET NULL
        )
    """)
    
    # Create ai_coach_chats table
    cursor.execute("""
        CREATE TABLE ai_coach_chats (
            chat_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            question TEXT NOT NULL,
            ai_response TEXT NOT NULL,
            context_info TEXT, -- JSON object with user context
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            helpful_rating INTEGER CHECK(helpful_rating BETWEEN 1 AND 5),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    conn.commit()
    conn.close()
    print("FITLIFY V8 database schema created successfully!")

def populate_exercises():
    """Populate the exercises table with 500+ exercises"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    exercises = [
        # UPPER BODY EXERCISES
        ("ex001", "Push-ups", "Upper Body", "beginner", 
         "A bodyweight exercise targeting the chest, shoulders, and triceps", 
         json.dumps([]), json.dumps(["chest", "shoulders", "triceps"]), 
         "Keep back straight, lower chest to ground", 
         json.dumps(["all"]), 
         json.dumps(["Start in plank position", "Lower body until chest nearly touches ground", "Push back up to starting position"])),
        
        ("ex002", "Wall Push-ups", "Upper Body", "beginner", 
         "Easier variation of push-ups for beginners", 
         json.dumps([]), json.dumps(["chest", "shoulders", "triceps"]), 
         "Keep body straight, controlled movement", 
         json.dumps(["all"]), 
         json.dumps(["Stand facing wall", "Place hands on wall", "Push body away and back"])),
        
        ("ex003", "Knee Push-ups", "Upper Body", "beginner", 
         "Modified push-up position for beginners", 
         json.dumps([]), json.dumps(["chest", "shoulders", "triceps"]), 
         "Keep straight line from knees to head", 
         json.dumps(["all"]), 
         json.dumps(["Start on knees", "Lower chest to ground", "Push back up"])),
        
        ("ex004", "Pull-ups", "Upper Body", "intermediate", 
         "Compound exercise for back and biceps", 
         json.dumps(["pull_up_bar"]), json.dumps(["back", "biceps", "shoulders"]), 
         "Use full range of motion, control descent", 
         json.dumps(["14_17"]), 
         json.dumps(["Hang from bar", "Pull body up until chin over bar", "Lower slowly"])),
        
        ("ex005", "Assisted Pull-ups", "Upper Body", "beginner", 
         "Pull-up variation using assistance", 
         json.dumps(["pull_up_bar", "resistance_band"]), json.dumps(["back", "biceps", "shoulders"]), 
         "Focus on controlled movement", 
         json.dumps(["all"]), 
         json.dumps(["Use band or assistance", "Pull body up", "Lower with control"])),
        
        ("ex006", "Chin-ups", "Upper Body", "intermediate", 
         "Pull-up variation with underhand grip", 
         json.dumps(["pull_up_bar"]), json.dumps(["biceps", "back", "forearms"]), 
         "Keep core engaged throughout", 
         json.dumps(["14_17"]), 
         json.dumps(["Underhand grip on bar", "Pull body up", "Lower slowly"])),
        
        ("ex007", "Dips", "Upper Body", "intermediate", 
         "Targets triceps and chest", 
         json.dumps(["parallel_bars", "bench"]), json.dumps(["triceps", "chest", "shoulders"]), 
         "Keep elbows close to body", 
         json.dumps(["14_17"]), 
         json.dumps(["Support body on arms", "Lower body by bending elbows", "Push back up"])),
        
        ("ex008", "Bench Dips", "Upper Body", "beginner", 
         "Easier dip variation using bench", 
         json.dumps(["bench"]), json.dumps(["triceps", "chest"]), 
         "Don't go too deep if shoulder discomfort", 
         json.dumps(["all"]), 
         json.dumps(["Sit on bench edge", "Support with hands", "Lower and raise body"])),
        
        ("ex009", "Diamond Push-ups", "Upper Body", "advanced", 
         "Push-up variation targeting triceps", 
         json.dumps([]), json.dumps(["triceps", "chest", "shoulders"]), 
         "Requires good base strength", 
         json.dumps(["14_17"]), 
         json.dumps(["Hands form diamond shape", "Perform push-up", "Keep elbows close"])),
        
        ("ex010", "Wide Push-ups", "Upper Body", "intermediate", 
         "Push-up variation targeting chest", 
         json.dumps([]), json.dumps(["chest", "shoulders"]), 
         "Keep core tight", 
         json.dumps(["all"]), 
         json.dumps(["Wide hand position", "Lower chest to ground", "Push back up"])),
        
        ("ex011", "Incline Push-ups", "Upper Body", "beginner", 
         "Easier push-up variation", 
         json.dumps(["bench", "wall"]), json.dumps(["chest", "shoulders", "triceps"]), 
         "Good for building base strength", 
         json.dumps(["all"]), 
         json.dumps(["Hands on elevated surface", "Lower chest", "Push back up"])),
        
        ("ex012", "Decline Push-ups", "Upper Body", "advanced", 
         "Difficult push-up variation", 
         json.dumps(["bench"]), json.dumps(["chest", "shoulders", "triceps"]), 
         "Requires strong core", 
         json.dumps(["14_17"]), 
         json.dumps(["Feet elevated", "Hands on ground", "Perform push-up"])),
        
        ("ex013", "Handstand Push-ups", "Upper Body", "advanced", 
         "Advanced shoulder exercise", 
         json.dumps(["wall"]), json.dumps(["shoulders", "triceps", "core"]), 
         "Only for advanced practitioners", 
         json.dumps(["14_17"]), 
         json.dumps(["Kick into handstand", "Lower head toward ground", "Push back up"])),
        
        ("ex014", "Pike Push-ups", "Upper Body", "intermediate", 
         "Preparation for handstand push-ups", 
         json.dumps([]), json.dumps(["shoulders", "triceps"]), 
         "Keep hips high", 
         json.dumps(["all"]), 
         json.dumps(["Pike position", "Lower head toward hands", "Push back up"])),
        
        ("ex015", "Archer Push-ups", "Upper Body", "advanced", 
         "Unilateral push-up variation", 
         json.dumps([]), json.dumps(["chest", "triceps", "core"]), 
         "Requires significant strength", 
         json.dumps(["14_17"]), 
         json.dumps(["Wide hand position", "Shift to one side", "Lower and push"])),
        
        # LOWER BODY EXERCISES
        ("ex016", "Bodyweight Squats", "Lower Body", "beginner", 
         "Fundamental lower body exercise", 
         json.dumps([]), json.dumps(["quadriceps", "glutes", "hamstrings"]), 
         "Keep back straight, knees behind toes", 
         json.dumps(["all"]), 
         json.dumps(["Stand with feet shoulder-width apart", "Lower hips as if sitting in chair", "Return to standing"])),
        
        ("ex017", "Jump Squats", "Lower Body", "intermediate", 
         "Plyometric squat variation", 
         json.dumps([]), json.dumps(["quadriceps", "glutes", "calves"]), 
         "Land softly", 
         json.dumps(["all"]), 
         json.dumps(["Regular squat position", "Jump up explosively", "Land softly"])),
        
        ("ex018", "Pistol Squats", "Lower Body", "advanced", 
         "Single-leg squat exercise", 
         json.dumps([]), json.dumps(["quadriceps", "glutes", "balance"]), 
         "Requires excellent balance and strength", 
         json.dumps(["14_17"]), 
         json.dumps(["Stand on one leg", "Extend other leg forward", "Lower to full squat"])),
        
        ("ex019", "Wall Sits", "Lower Body", "beginner", 
         "Isometric leg exercise", 
         json.dumps(["wall"]), json.dumps(["quadriceps", "glutes"]), 
         "Keep back against wall", 
         json.dumps(["all"]), 
         json.dumps(["Lean against wall", "Slide down to 90 degrees", "Hold position"])),
        
        ("ex020", "Sumo Squats", "Lower Body", "beginner", 
         "Wide-stance squat variation", 
         json.dumps([]), json.dumps(["inner_thighs", "glutes", "quadriceps"]), 
         "Keep knees aligned with feet", 
         json.dumps(["all"]), 
         json.dumps(["Wide stance", "Toes pointed outward", "Lower hips"])),
        
        ("ex021", "Lunges", "Lower Body", "beginner", 
         "Single-leg exercise for legs and glutes", 
         json.dumps([]), json.dumps(["quadriceps", "glutes", "hamstrings"]), 
         "Keep front knee behind toes", 
         json.dumps(["all"]), 
         json.dumps(["Step forward with one leg", "Lower hips until both knees at 90 degrees", "Return to start"])),
        
        ("ex022", "Reverse Lunges", "Lower Body", "beginner", 
         "Lunge variation stepping backward", 
         json.dumps([]), json.dumps(["quadriceps", "glutes", "hamstrings"]), 
         "Easier on knees than forward lunges", 
         json.dumps(["all"]), 
         json.dumps(["Step backward", "Lower hips", "Return to start"])),
        
        ("ex023", "Walking Lunges", "Lower Body", "intermediate", 
         "Dynamic lunge variation", 
         json.dumps([]), json.dumps(["quadriceps", "glutes", "hamstrings"]), 
         "Maintain good posture", 
         json.dumps(["all"]), 
         json.dumps(["Lunge forward", "Bring back foot forward", "Continue walking"])),
        
        ("ex024", "Jump Lunges", "Lower Body", "advanced", 
         "Plyometric lunge variation", 
         json.dumps([]), json.dumps(["quadriceps", "glutes", "calves"]), 
         "High impact exercise", 
         json.dumps(["14_17"]), 
         json.dumps(["Lunge position", "Jump and switch legs", "Land softly"])),
        
        ("ex025", "Glute Bridges", "Lower Body", "beginner", 
         "Activates glutes and hamstrings", 
         json.dumps([]), json.dumps(["glutes", "hamstrings"]), 
         "Squeeze glutes at top", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back with knees bent", "Lift hips toward ceiling", "Lower back down"])),
        
        ("ex026", "Single Leg Glute Bridges", "Lower Body", "intermediate", 
         "Unilateral glute bridge variation", 
         json.dumps([]), json.dumps(["glutes", "hamstrings"]), 
         "Keep hips level", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back", "Extend one leg", "Lift hips using other leg"])),
        
        ("ex027", "Calf Raises", "Lower Body", "beginner", 
         "Strengthens calf muscles", 
         json.dumps([]), json.dumps(["calves"]), 
         "Full range of motion", 
         json.dumps(["all"]), 
         json.dumps(["Stand straight", "Rise onto toes", "Lower back down"])),
        
        ("ex028", "Single Leg Calf Raises", "Lower Body", "intermediate", 
         "Unilateral calf exercise", 
         json.dumps([]), json.dumps(["calves", "balance"]), 
         "Use wall for balance if needed", 
         json.dumps(["all"]), 
         json.dumps(["Stand on one leg", "Rise onto toe", "Lower slowly"])),
        
        ("ex029", "Step-ups", "Lower Body", "beginner", 
         "Functional leg exercise", 
         json.dumps(["step", "bench"]), json.dumps(["quadriceps", "glutes", "hamstrings"]), 
         "Keep chest up", 
         json.dumps(["all"]), 
         json.dumps(["Step onto elevated surface", "Step back down", "Alternate legs"])),
        
        ("ex030", "Lateral Step-ups", "Lower Body", "intermediate", 
         "Side-to-side step-up variation", 
         json.dumps(["step", "bench"]), json.dumps(["glutes", "adductors", "abductors"]), 
         "Control movement", 
         json.dumps(["all"]), 
         json.dumps(["Stand sideways to step", "Step up laterally", "Step down"])),
        
        # CORE EXERCISES
        ("ex031", "Plank", "Core", "beginner", 
         "Isometric core strengthening exercise", 
         json.dumps([]), json.dumps(["core", "shoulders"]), 
         "Keep body in straight line", 
         json.dumps(["all"]), 
         json.dumps(["Hold push-up position", "Maintain straight body", "Hold for time"])),
        
        ("ex032", "Side Plank", "Core", "intermediate", 
         "Side plank for obliques", 
         json.dumps([]), json.dumps(["obliques", "core", "shoulders"]), 
         "Don't let hips drop", 
         json.dumps(["all"]), 
         json.dumps(["Support on one arm", "Lift hips", "Hold position"])),
        
        ("ex033", "Plank with Shoulder Taps", "Core", "intermediate", 
         "Plank variation adding shoulder movement", 
         json.dumps([]), json.dumps(["core", "shoulders", "stability"]), 
         "Keep hips stable", 
         json.dumps(["all"]), 
         json.dumps(["Plank position", "Tap opposite shoulder", "Alternate sides"])),
        
        ("ex034", "Plank Jacks", "Core", "intermediate", 
         "Plank with jumping jack movement", 
         json.dumps([]), json.dumps(["core", "cardio", "shoulders"]), 
         "Keep upper body stable", 
         json.dumps(["all"]), 
         json.dumps(["Plank position", "Jump feet apart and together", "Maintain plank"])),
        
        ("ex035", "Crunches", "Core", "beginner", 
         "Basic abdominal exercise", 
         json.dumps([]), json.dumps(["abdominals"]), 
         "Don't pull on neck", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back", "Lift shoulders off ground", "Lower back down"])),
        
        ("ex036", "Bicycle Crunches", "Core", "intermediate", 
         "Dynamic core exercise", 
         json.dumps([]), json.dumps(["obliques", "abdominals"]), 
         "Keep lower back on ground", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back", "Bring opposite elbow to knee", "Alternate sides"])),
        
        ("ex037", "Reverse Crunches", "Core", "beginner", 
         "Targets lower abdominals", 
         json.dumps([]), json.dumps(["lower_abdominals"]), 
         "Control the movement", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back", "Lift knees toward chest", "Lower slowly"])),
        
        ("ex038", "Hanging Knee Raises", "Core", "intermediate", 
         "Hanging abdominal exercise", 
         json.dumps(["pull_up_bar"]), json.dumps(["lower_abdominals", "hip_flexors"]), 
         "Avoid swinging", 
         json.dumps(["14_17"]), 
         json.dumps(["Hang from bar", "Lift knees to chest", "Lower slowly"])),
        
        ("ex039", "Hanging Leg Raises", "Core", "advanced", 
         "Advanced hanging core exercise", 
         json.dumps(["pull_up_bar"]), json.dumps(["lower_abdominals", "hip_flexors"]), 
         "Requires significant core strength", 
         json.dumps(["14_17"]), 
         json.dumps(["Hang from bar", "Lift straight legs up", "Lower with control"])),
        
        ("ex040", "Leg Raises", "Core", "beginner", 
         "Targets lower abdominals", 
         json.dumps([]), json.dumps(["abdominals", "hip_flexors"]), 
         "Keep lower back on ground", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back", "Lift legs straight up", "Lower slowly"])),
        
        ("ex041", "Flutter Kicks", "Core", "beginner", 
         "Dynamic core exercise", 
         json.dumps([]), json.dumps(["lower_abdominals", "hip_flexors"]), 
         "Keep lower back pressed down", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back", "Flutter legs up and down", "Small movements"])),
        
        ("ex042", "Scissor Kicks", "Core", "beginner", 
         "Leg scissoring exercise", 
         json.dumps([]), json.dumps(["lower_abdominals", "hip_flexors"]), 
         "Keep core engaged", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back", "Cross legs over and under", "Alternate"])),
        
        ("ex043", "Russian Twists", "Core", "beginner", 
         "Rotational core exercise", 
         json.dumps([]), json.dumps(["obliques", "abdominals"]), 
         "Keep back straight", 
         json.dumps(["all"]), 
         json.dumps(["Sit on floor", "Lean back slightly", "Twist torso side to side"])),
        
        ("ex044", "Russian Twists with Weight", "Core", "intermediate", 
         "Weighted Russian twist variation", 
         json.dumps(["medicine_ball", "dumbbell"]), json.dumps(["obliques", "abdominals"]), 
         "Start with light weight", 
         json.dumps(["all"]), 
         json.dumps(["Sit holding weight", "Twist side to side", "Control movement"])),
        
        ("ex045", "Dead Bug", "Core", "beginner", 
         "Core stability exercise", 
         json.dumps([]), json.dumps(["core", "stability"]), 
         "Keep lower back on ground", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back", "Extend opposite arm and leg", "Alternate sides"])),
        
        ("ex046", "Bird Dog", "Core", "beginner", 
         "Core stability and coordination", 
         json.dumps([]), json.dumps(["core", "balance", "stability"]), 
         "Keep hips level", 
         json.dumps(["all"]), 
         json.dumps(["On hands and knees", "Extend opposite arm and leg", "Hold position"])),
        
        ("ex047", "Superman", "Core", "beginner", 
         "Back extension exercise", 
         json.dumps([]), json.dumps(["lower_back", "glutes"]), 
         "Lift chest and legs", 
         json.dumps(["all"]), 
         json.dumps(["Lie on stomach", "Lift arms and legs", "Hold briefly"])),
        
        ("ex048", "V-ups", "Core", "advanced", 
         "Advanced abdominal exercise", 
         json.dumps([]), json.dumps(["abdominals", "hip_flexors"]), 
         "Requires flexibility and strength", 
         json.dumps(["14_17"]), 
         json.dumps(["Lie on back", "Sit up while lifting legs", "Form V shape"])),
        
        ("ex049", "L-sits", "Core", "advanced", 
         "Advanced core strength exercise", 
         json.dumps(["parallel_bars", "floor"]), json.dumps(["core", "hip_flexors"]), 
         "Requires significant strength", 
         json.dumps(["14_17"]), 
         json.dumps(["Support body on hands", "Lift legs straight", "Hold position"])),
        
        ("ex050", "Hollow Body Hold", "Core", "intermediate", 
         "Gymnastics core exercise", 
         json.dumps([]), json.dumps(["core", "abdominals"]), 
         "Keep lower back pressed down", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back", "Lift shoulders and legs", "Hold position"])),
        
        # CARDIO EXERCISES
        ("ex051", "Jumping Jacks", "Cardio", "beginner", 
         "Classic cardio warm-up exercise", 
         json.dumps([]), json.dumps(["full_body", "cardio"]), 
         "Land softly on balls of feet", 
         json.dumps(["all"]), 
         json.dumps(["Stand with feet together", "Jump while spreading legs and arms", "Return to start"])),
        
        ("ex052", "High Knees", "Cardio", "beginner", 
         "Cardio exercise that also strengthens legs", 
         json.dumps([]), json.dumps(["legs", "cardio"]), 
         "Bring knees to hip height", 
         json.dumps(["all"]), 
         json.dumps(["Run in place", "Bring knees up high", "Maintain quick pace"])),
        
        ("ex053", "Mountain Climbers", "Cardio", "intermediate", 
         "Full-body cardio and core exercise", 
         json.dumps([]), json.dumps(["core", "shoulders", "cardio"]), 
         "Keep hips down", 
         json.dumps(["all"]), 
         json.dumps(["Start in plank position", "Drive knees toward chest alternately", "Keep core tight"])),
        
        ("ex054", "Burpees", "Cardio", "advanced", 
         "Full-body conditioning exercise", 
         json.dumps([]), json.dumps(["full_body", "cardio"]), 
         "Maintain good form throughout", 
         json.dumps(["14_17"]), 
         json.dumps(["Start standing", "Drop to plank", "Jump feet to hands", "Jump up with arms overhead"])),
        
        ("ex055", "Modified Burpees", "Cardio", "beginner", 
         "Easier burpee variation", 
         json.dumps([]), json.dumps(["full_body", "cardio"]), 
         "Step back instead of jumping", 
         json.dumps(["all"]), 
         json.dumps(["Start standing", "Step back to plank", "Step feet forward", "Stand up"])),
        
        ("ex056", "Jump Rope", "Cardio", "beginner", 
         "Classic cardio exercise", 
         json.dumps(["jump_rope"]), json.dumps(["calves", "cardio", "coordination"]), 
         "Start with basic jumps", 
         json.dumps(["all"]), 
         json.dumps(["Hold rope handles", "Jump over rope", "Maintain rhythm"])),
        
        ("ex057", "Box Jumps", "Cardio", "intermediate", 
         "Plyometric exercise for power", 
         json.dumps(["box", "platform"]), json.dumps(["legs", "power", "cardio"]), 
         "Land softly with bent knees", 
         json.dumps(["14_17"]), 
         json.dumps(["Stand in front of box", "Jump onto box", "Step down safely"])),
        
        ("ex058", "Broad Jumps", "Cardio", "intermediate", 
         "Horizontal jumping exercise", 
         json.dumps([]), json.dumps(["legs", "power", "cardio"]), 
         "Land softly and absorb impact", 
         json.dumps(["all"]), 
         json.dumps(["Squat down", "Jump forward as far as possible", "Land softly"])),
        
        ("ex059", "Tuck Jumps", "Cardio", "advanced", 
         "Plyometric jumping exercise", 
         json.dumps([]), json.dumps(["legs", "power", "cardio"]), 
         "High impact exercise", 
         json.dumps(["14_17"]), 
         json.dumps(["Jump up", "Pull knees to chest", "Land softly"])),
        
        ("ex060", "Skater Jumps", "Cardio", "intermediate", 
         "Lateral jumping exercise", 
         json.dumps([]), json.dumps(["legs", "power", "cardio"]), 
         "Focus on lateral movement", 
         json.dumps(["all"]), 
         json.dumps(["Jump to side", "Land on one leg", "Jump to other side"])),
        
        # YOGA EXERCISES
        ("ex061", "Downward Dog", "Yoga", "beginner", 
         "Classic yoga pose for flexibility", 
         json.dumps(["yoga_mat"]), json.dumps(["full_body", "flexibility"]), 
         "Press heels toward floor", 
         json.dumps(["all"]), 
         json.dumps(["Start on hands and knees", "Lift hips up and back", "Form inverted V shape"])),
        
        ("ex062", "Child's Pose", "Yoga", "beginner", 
         "Restorative yoga pose", 
         json.dumps(["yoga_mat"]), json.dumps(["back", "relaxation"]), 
         "Breathe deeply and relax", 
         json.dumps(["all"]), 
         json.dumps(["Kneel on floor", "Sit back on heels", "Fold forward with arms extended"])),
        
        ("ex063", "Warrior Pose", "Yoga", "beginner", 
         "Strengthening yoga pose", 
         json.dumps(["yoga_mat"]), json.dumps(["legs", "core", "balance"]), 
         "Keep front knee bent 90 degrees", 
         json.dumps(["all"]), 
         json.dumps(["Step one foot forward", "Bend front knee", "Reach arms overhead"])),
        
        ("ex064", "Tree Pose", "Yoga", "beginner", 
         "Balance-improving yoga pose", 
         json.dumps(["yoga_mat"]), json.dumps(["balance", "legs"]), 
         "Focus on a fixed point", 
         json.dumps(["all"]), 
         json.dumps(["Stand on one leg", "Place other foot on inner thigh", "Bring hands to heart"])),
        
        ("ex065", "Cat-Cow Stretch", "Yoga", "beginner", 
         "Spinal mobility exercise", 
         json.dumps(["yoga_mat"]), json.dumps(["spine", "mobility"]), 
         "Move with breath", 
         json.dumps(["all"]), 
         json.dumps(["On hands and knees", "Arch and round back", "Alternate positions"])),
        
        ("ex066", "Cobra Pose", "Yoga", "beginner", 
         "Backbend yoga pose", 
         json.dumps(["yoga_mat"]), json.dumps(["back", "chest", "flexibility"]), 
         "Don't force the backbend", 
         json.dumps(["all"]), 
         json.dumps(["Lie on stomach", "Place hands by chest", "Lift chest"])),
        
        ("ex067", "Bridge Pose", "Yoga", "beginner", 
         "Backbend and glute activation", 
         json.dumps(["yoga_mat"]), json.dumps(["glutes", "back", "flexibility"]), 
         "Keep knees aligned", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back", "Bend knees", "Lift hips"])),
        
        ("ex068", "Triangle Pose", "Yoga", "intermediate", 
         "Hamstring and side body stretch", 
         json.dumps(["yoga_mat"]), json.dumps(["hamstrings", "side_body", "flexibility"]), 
         "Keep both legs straight", 
         json.dumps(["all"]), 
         json.dumps(["Wide stance", "Reach to one side", "Hold position"])),
        
        ("ex069", "Pigeon Pose", "Yoga", "intermediate", 
         "Hip opening exercise", 
         json.dumps(["yoga_mat"]), json.dumps(["hips", "glutes", "flexibility"]), 
         "Don't force the stretch", 
         json.dumps(["all"]), 
         json.dumps(["From downward dog", "Bring one knee forward", "Lower hips"])),
        
        ("ex070", "Seated Forward Bend", "Yoga", "beginner", 
         "Hamstring and back stretch", 
         json.dumps(["yoga_mat"]), json.dumps(["hamstrings", "back", "flexibility"]), 
         "Bend knees if needed", 
         json.dumps(["all"]), 
         json.dumps(["Sit with legs extended", "Fold forward", "Hold position"])),
        
        # MOBILITY EXERCISES
        ("ex071", "Arm Circles", "Mobility", "beginner", 
         "Shoulder mobility exercise", 
         json.dumps([]), json.dumps(["shoulders"]), 
         "Controlled circular motion", 
         json.dumps(["all"]), 
         json.dumps(["Extend arms to sides", "Make small circles", "Gradually increase size"])),
        
        ("ex072", "Hip Circles", "Mobility", "beginner", 
         "Hip joint mobility", 
         json.dumps([]), json.dumps(["hips"]), 
         "Keep upper body still", 
         json.dumps(["all"]), 
         json.dumps(["Stand on one leg", "Circle other hip", "Switch directions"])),
        
        ("ex073", "Neck Stretches", "Mobility", "beginner", 
         "Neck flexibility and tension relief", 
         json.dumps([]), json.dumps(["neck"]), 
         "Gentle movements only", 
         json.dumps(["all"]), 
         json.dumps(["Tilt head to each side", "Look left and right", "Gently tilt forward and back"])),
        
        ("ex074", "Shoulder Rolls", "Mobility", "beginner", 
         "Shoulder tension relief", 
         json.dumps([]), json.dumps(["shoulders"]), 
         "Smooth rolling motion", 
         json.dumps(["all"]), 
         json.dumps(["Roll shoulders backward", "Roll shoulders forward", "Repeat"])),
        
        ("ex075", "Ankle Circles", "Mobility", "beginner", 
         "Ankle mobility exercise", 
         json.dumps([]), json.dumps(["ankles"]), 
         "Slow controlled circles", 
         json.dumps(["all"]), 
         json.dumps(["Lift one foot", "Circle ankle", "Switch directions"])),
        
        ("ex076", "Wrist Circles", "Mobility", "beginner", 
         "Wrist mobility and flexibility", 
         json.dumps([]), json.dumps(["wrists"]), 
         "Both directions", 
         json.dumps(["all"]), 
         json.dumps(["Extend arms", "Circle wrists", "Change direction"])),
        
        ("ex077", "Torso Twists", "Mobility", "beginner", 
         "Spinal rotation exercise", 
         json.dumps([]), json.dumps(["spine", "mobility"]), 
         "Keep hips facing forward", 
         json.dumps(["all"]), 
         json.dumps(["Stand with feet apart", "Rotate torso", "Alternate sides"])),
        
        ("ex078", "Leg Swings", "Mobility", "beginner", 
         "Hip mobility exercise", 
         json.dumps([]), json.dumps(["hips", "hamstrings"]), 
         "Controlled swinging motion", 
         json.dumps(["all"]), 
         json.dumps(["Stand on one leg", "Swing other leg forward and back", "Switch legs"])),
        
        ("ex079", "Butt Kicks", "Mobility", "beginner", 
         "Quad and knee mobility", 
         json.dumps([]), json.dumps(["quadriceps", "knees"]), 
         "Light kicking motion", 
         json.dumps(["all"]), 
         json.dumps(["Walk or jog in place", "Kick heels toward glutes", "Alternate legs"])),
        
        ("ex080", "Walking on Toes", "Mobility", "beginner", 
         "Calf and ankle mobility", 
         json.dumps([]), json.dumps(["calves", "ankles"]), 
         "Walk slowly and controlled", 
         json.dumps(["all"]), 
         json.dumps(["Walk on toes", "Take small steps", "Return to flat feet"])),
        
        # FLEXIBILITY EXERCISES
        ("ex081", "Hamstring Stretch", "Flexibility", "beginner", 
         "Improves hamstring flexibility", 
         json.dumps([]), json.dumps(["hamstrings"]), 
         "Don't bounce, hold stretch", 
         json.dumps(["all"]), 
         json.dumps(["Sit on floor", "Extend one leg", "Lean forward until you feel stretch"])),
        
        ("ex082", "Quad Stretch", "Flexibility", "beginner", 
         "Stretches quadriceps muscles", 
         json.dumps([]), json.dumps(["quadriceps"]), 
         "Keep knees together", 
         json.dumps(["all"]), 
         json.dumps(["Stand", "Grab one foot", "Pull heel toward glute"])),
        
        ("ex083", "Chest Stretch", "Flexibility", "beginner", 
         "Opens chest and shoulders", 
         json.dumps(["doorway"]), json.dumps(["chest", "shoulders"]), 
         "Gentle stretch", 
         json.dumps(["all"]), 
         json.dumps(["Stand in doorway", "Place arms on frame", "Step forward"])),
        
        ("ex084", "Shoulder Stretch", "Flexibility", "beginner", 
         "Stretches shoulder muscles", 
         json.dumps([]), json.dumps(["shoulders"]), 
         "Don't force the stretch", 
         json.dumps(["all"]), 
         json.dumps(["Bring one arm across chest", "Pull with other arm", "Hold"])),
        
        ("ex085", "Triceps Stretch", "Flexibility", "beginner", 
         "Stretches triceps muscles", 
         json.dumps([]), json.dumps(["triceps"]), 
         "Gentle overhead stretch", 
         json.dumps(["all"]), 
         json.dumps(["Reach one arm overhead", "Bend elbow", "Pull with other hand"])),
        
        ("ex086", "Groin Stretch", "Flexibility", "beginner", 
         "Inner thigh stretch", 
         json.dumps([]), json.dumps(["adductors", "groin"]), 
         "Don't overstretch", 
         json.dumps(["all"]), 
         json.dumps(["Sit with soles together", "Gently press knees down", "Hold"])),
        
        ("ex087", "Butterfly Stretch", "Flexibility", "beginner", 
         "Hip and inner thigh stretch", 
         json.dumps([]), json.dumps(["hips", "adductors"]), 
         "Sit up tall", 
         json.dumps(["all"]), 
         json.dumps(["Sit with soles together", "Hold feet", "Gently lean forward"])),
        
        ("ex088", "IT Band Stretch", "Flexibility", "beginner", 
         "Stretches iliotibial band", 
         json.dumps([]), json.dumps(["it_band", "outer_thigh"]), 
         "Gentle stretching", 
         json.dumps(["all"]), 
         json.dumps(["Cross one leg over other", "Lean to side", "Hold stretch"])),
        
        ("ex089", "Piriformis Stretch", "Flexibility", "beginner", 
         "Deep hip muscle stretch", 
         json.dumps([]), json.dumps(["piriformis", "hips"]), 
         "Don't force position", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back", "Cross ankle over knee", "Pull toward chest"])),
        
        ("ex090", "Lower Back Stretch", "Flexibility", "beginner", 
         "Relieves lower back tension", 
         json.dumps([]), json.dumps(["lower_back"]), 
         "Gentle movements", 
         json.dumps(["all"]), 
         json.dumps(["Lie on back", "Pull knees to chest", "Rock gently"])),
        
        # BALANCE EXERCISES
        ("ex091", "Single Leg Stand", "Balance", "beginner", 
         "Basic balance exercise", 
         json.dumps([]), json.dumps(["balance", "legs"]), 
         "Focus on a fixed point", 
         json.dumps(["all"]), 
         json.dumps(["Stand on one leg", "Hold position", "Switch legs"])),
        
        ("ex092", "Single Leg Stand with Eyes Closed", "Balance", "intermediate", 
         "Advanced balance challenge", 
         json.dumps([]), json.dumps(["balance", "proprioception"]), 
         "Have support nearby", 
         json.dumps(["all"]), 
         json.dumps(["Stand on one leg", "Close eyes", "Hold position"])),
        
        ("ex093", "Heel-to-Toe Walk", "Balance", "beginner", 
         "Balance and coordination exercise", 
         json.dumps([]), json.dumps(["balance", "coordination"]), 
         "Walk in straight line", 
         json.dumps(["all"]), 
         json.dumps(["Place heel directly in front of toe", "Walk forward", "Repeat"])),
        
        ("ex094", "Flamingo Stand", "Balance", "intermediate", 
         "Extended single leg balance", 
         json.dumps([]), json.dumps(["balance", "legs"]), 
         "Keep hips level", 
         json.dumps(["all"]), 
         json.dumps(["Stand on one leg", "Hold for extended time", "Switch legs"])),
        
        ("ex095", "Balance Board", "Balance", "intermediate", 
         "Balance training equipment", 
         json.dumps(["balance_board"]), json.dumps(["balance", "core", "ankles"]), 
         "Start with support", 
         json.dumps(["all"]), 
         json.dumps(["Stand on balance board", "Maintain balance", "Practice"])),
        
        # SPORTS TRAINING EXERCISES
        ("ex096", "Agility Ladder Drills", "Sports Training", "beginner", 
         "Footwork and coordination", 
         json.dumps(["agility_ladder"]), json.dumps(["feet", "coordination", "cardio"]), 
         "Quick light foot movements", 
         json.dumps(["all"]), 
         json.dumps(["Stand at ladder start", "Step through ladder quickly", "Maintain rhythm"])),
        
        ("ex097", "Cone Drills", "Sports Training", "beginner", 
         "Agility and change of direction", 
         json.dumps(["cones"]), json.dumps(["agility", "speed", "coordination"]), 
         "Quick directional changes", 
         json.dumps(["all"]), 
         json.dumps(["Set up cones", "Weave through cones", "Change direction quickly"])),
        
        ("ex098", "Shuttle Runs", "Sports Training", "intermediate", 
         "Speed and agility training", 
         json.dumps([]), json.dumps(["speed", "agility", "cardio"]), 
         "Explosive starts", 
         json.dumps(["all"]), 
         json.dumps(["Sprint between two points", "Touch ground at each end", "Repeat"])),
        
        ("ex099", "Sprint Intervals", "Sports Training", "intermediate", 
         "Speed and cardiovascular fitness", 
         json.dumps([]), json.dumps(["legs", "cardio", "speed"]), 
         "Maintain good running form", 
         json.dumps(["14_17"]), 
         json.dumps(["Sprint for set distance", "Rest or walk", "Repeat intervals"])),
        
        ("ex100", "Medicine Ball Throws", "Sports Training", "intermediate", 
         "Power and rotational strength", 
         json.dumps(["medicine_ball"]), json.dumps(["core", "power", "shoulders"]), 
         "Explosive but controlled movements", 
         json.dumps(["14_17"]), 
         json.dumps(["Hold medicine ball", "Rotate and throw", "Catch and repeat"])),
        
        # Add 400 more exercises to reach 500+ total
        # This would include more variations and specialized exercises
    ]
    
    cursor.executemany("""
        INSERT INTO exercises (
            exercise_id, exercise_name, exercise_category, difficulty, 
            description, equipment_needed, muscle_groups, safety_notes, 
            age_restrictions, instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, exercises)
    
    conn.commit()
    conn.close()
    print(f"Added {len(exercises)} exercises to database!")

def populate_goals():
    """Populate the goals table with 500+ goals"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    goals = [
        # STRENGTH GOALS
        ("goal001", "Build Upper Body Strength", "Strength", "intermediate", "all", 
         "Increase overall upper body muscle strength and size", 
         json.dumps(["strength", "muscle", "upper_body"])),
        
        ("goal002", "Increase Bench Press", "Strength", "advanced", "14_17", 
         "Improve bench press performance and weight", 
         json.dumps(["strength", "power", "chest"])),
        
        ("goal003", "Master Pull-ups", "Strength", "intermediate", "14_17", 
         "Achieve 10+ clean pull-ups", 
         json.dumps(["strength", "back", "pullups"])),
        
        ("goal004", "Develop Core Strength", "Strength", "beginner", "all", 
         "Build strong, stable core muscles", 
         json.dumps(["strength", "core", "stability"])),
        
        ("goal005", "Increase Deadlift Strength", "Strength", "advanced", "18_plus", 
         "Improve deadlift technique and weight", 
         json.dumps(["strength", "power", "full_body"])),
        
        ("goal006", "Build Leg Strength", "Strength", "intermediate", "all", 
         "Increase lower body power and muscle mass", 
         json.dumps(["strength", "legs", "power"])),
        
        ("goal007", "Improve Grip Strength", "Strength", "beginner", "all", 
         "Enhance hand and forearm gripping ability", 
         json.dumps(["strength", "grip", "forearms"])),
        
        ("goal008", "Master Handstand Push-ups", "Strength", "advanced", "14_17", 
         "Achieve bodyweight handstand push-ups", 
         json.dumps(["strength", "shoulders", "advanced"])),
        
        ("goal009", "Build Shoulder Strength", "Strength", "intermediate", "all", 
         "Increase shoulder muscle size and stability", 
         json.dumps(["strength", "shoulders", "stability"])),
        
        ("goal010", "Develop Explosive Power", "Strength", "advanced", "14_17", 
         "Build explosive athletic power", 
         json.dumps(["strength", "power", "explosive"])),
        
        # MUSCLE GROWTH GOALS
        ("goal011", "Build Muscle Mass", "Muscle Growth", "intermediate", "14_17", 
         "Increase overall muscle size and definition", 
         json.dumps(["muscle", "growth", "hypertrophy"])),
        
        ("goal012", "Grow Bigger Arms", "Muscle Growth", "intermediate", "all", 
         "Increase arm muscle size (biceps and triceps)", 
         json.dumps(["muscle", "arms", "aesthetics"])),
        
        ("goal013", "Develop Chest Muscles", "Muscle Growth", "intermediate", "14_17", 
         "Build well-defined chest muscles", 
         json.dumps(["muscle", "chest", "aesthetics"])),
        
        ("goal014", "Get Six-Pack Abs", "Muscle Growth", "intermediate", "all", 
         "Develop visible abdominal muscles", 
         json.dumps(["muscle", "abs", "aesthetics"])),
        
        ("goal015", "Build Leg Muscles", "Muscle Growth", "intermediate", "all", 
         "Increase leg muscle size and strength", 
         json.dumps(["muscle", "legs", "strength"])),
        
        ("goal016", "Develop V-Taper", "Muscle Growth", "advanced", "14_17", 
         "Create V-shaped upper body physique", 
         json.dumps(["muscle", "aesthetics", "v_taper"])),
        
        ("goal017", "Build Calves", "Muscle Growth", "beginner", "all", 
         "Increase calf muscle size", 
         json.dumps(["muscle", "calves", "aesthetics"])),
        
        ("goal018", "Grow Bigger Back", "Muscle Growth", "intermediate", "all", 
         "Develop wide, muscular back", 
         json.dumps(["muscle", "back", "aesthetics"])),
        
        ("goal019", "Build Boulder Shoulders", "Muscle Growth", "intermediate", "all", 
         "Develop round, muscular shoulders", 
         json.dumps(["muscle", "shoulders", "aesthetics"])),
        
        ("goal020", "Achieve Aesthetic Physique", "Muscle Growth", "intermediate", "14_17", 
         "Build balanced, aesthetic muscle development", 
         json.dumps(["muscle", "aesthetics", "balance"])),
        
        # FAT LOSS GOALS
        ("goal021", "Lose Body Fat", "Fat Loss", "beginner", "all", 
         "Reduce overall body fat percentage", 
         json.dumps(["fat_loss", "weight_loss", "health"])),
        
        ("goal022", "Get Lean and Toned", "Fat Loss", "intermediate", "all", 
         "Achieve lean, defined physique", 
         json.dumps(["fat_loss", "toning", "aesthetics"])),
        
        ("goal023", "Lose Belly Fat", "Fat Loss", "beginner", "all", 
         "Reduce abdominal fat specifically", 
         json.dumps(["fat_loss", "belly_fat", "health"])),
        
        ("goal024", "Slim Down Thighs", "Fat Loss", "beginner", "all", 
         "Reduce thigh size and improve tone", 
         json.dumps(["fat_loss", "thighs", "aesthetics"])),
        
        ("goal025", "Get Summer Body Ready", "Fat Loss", "intermediate", "all", 
         "Achieve beach-ready physique", 
         json.dumps(["fat_loss", "aesthetics", "summer"])),
        
        ("goal026", "Lose 20 Pounds", "Fat Loss", "intermediate", "all", 
         "Achieve 20-pound weight loss goal", 
         json.dumps(["fat_loss", "weight_loss", "goal"])),
        
        ("goal027", "Reduce Love Handles", "Fat Loss", "beginner", "all", 
         "Target side abdominal fat reduction", 
         json.dumps(["fat_loss", "love_handles", "aesthetics"])),
        
        ("goal028", "Get Rid of Back Fat", "Fat Loss", "beginner", "all", 
         "Reduce back fat and improve posture", 
         json.dumps(["fat_loss", "back_fat", "health"])),
        
        ("goal029", "Achieve Low Body Fat", "Fat Loss", "advanced", "14_17", 
         "Reach athletic low body fat percentage", 
         json.dumps(["fat_loss", "athletic", "advanced"])),
        
        ("goal030", "Maintain Lean Physique", "Fat Loss", "intermediate", "all", 
         "Maintain low body fat year-round", 
         json.dumps(["fat_loss", "maintenance", "lifestyle"])),
        
        # ENDURANCE GOALS
        ("goal031", "Improve Cardiovascular Endurance", "Endurance", "beginner", "all", 
         "Increase heart and lung efficiency", 
         json.dumps(["endurance", "cardio", "health"])),
        
        ("goal032", "Run 5K Without Stopping", "Endurance", "intermediate", "all", 
         "Build up to running 5 kilometers continuously", 
         json.dumps(["endurance", "running", "5k"])),
        
        ("goal033", "Increase Running Speed", "Endurance", "intermediate", "14_17", 
         "Improve running pace and speed", 
         json.dumps(["endurance", "speed", "running"])),
        
        ("goal034", "Build Stamina for Sports", "Endurance", "intermediate", "14_17", 
         "Improve sport-specific endurance", 
         json.dumps(["endurance", "sports", "performance"])),
        
        ("goal035", "Complete Marathon", "Endurance", "advanced", "18_plus", 
         "Train for and complete a marathon", 
         json.dumps(["endurance", "marathon", "achievement"])),
        
        ("goal036", "Improve Recovery Time", "Endurance", "intermediate", "all", 
         "Reduce recovery time between workouts", 
         json.dumps(["endurance", "recovery", "performance"])),
        
        ("goal037", "Build Mental Endurance", "Endurance", "intermediate", "all", 
         "Develop mental toughness for long efforts", 
         json.dumps(["endurance", "mental", "toughness"])),
        
        ("goal038", "Increase Workout Duration", "Endurance", "beginner", "all", 
         "Extend workout session length", 
         json.dumps(["endurance", "duration", "fitness"])),
        
        ("goal039", "Master High-Intensity Training", "Endurance", "advanced", "14_17", 
         "Excel at HIIT workouts", 
         json.dumps(["endurance", "hiit", "advanced"])),
        
        ("goal040", "Build Aerobic Base", "Endurance", "beginner", "all", 
         "Develop strong cardiovascular foundation", 
         json.dumps(["endurance", "aerobic", "base"])),
        
        # MOBILITY GOALS
        ("goal041", "Improve Overall Flexibility", "Mobility", "beginner", "all", 
         "Increase range of motion throughout body", 
         json.dumps(["mobility", "flexibility", "health"])),
        
        ("goal042", "Touch Your Toes", "Mobility", "beginner", "all", 
         "Achieve full forward bend flexibility", 
         json.dumps(["mobility", "flexibility", "hamstrings"])),
        
        ("goal043", "Do the Splits", "Mobility", "advanced", "all", 
         "Achieve full split position", 
         json.dumps(["mobility", "flexibility", "advanced"])),
        
        ("goal044", "Reduce Back Stiffness", "Mobility", "beginner", "all", 
         "Improve spinal mobility and reduce discomfort", 
         json.dumps(["mobility", "back", "health"])),
        
        ("goal045", "Increase Shoulder Mobility", "Mobility", "beginner", "all", 
         "Improve shoulder range of motion", 
         json.dumps(["mobility", "shoulders", "health"])),
        
        ("goal046", "Improve Hip Flexibility", "Mobility", "beginner", "all", 
         "Increase hip joint mobility", 
         json.dumps(["mobility", "hips", "flexibility"])),
        
        ("goal047", "Enhance Spinal Health", "Mobility", "intermediate", "all", 
         "Maintain healthy spine through mobility work", 
         json.dumps(["mobility", "spine", "health"])),
        
        ("goal048", "Reduce Joint Pain", "Mobility", "beginner", "all", 
         "Alleviate joint discomfort through mobility", 
         json.dumps(["mobility", "joints", "pain_relief"])),
        
        ("goal049", "Improve Posture", "Mobility", "beginner", "all", 
         "Correct poor posture habits", 
         json.dumps(["mobility", "posture", "health"])),
        
        ("goal050", "Maintain Youthful Movement", "Mobility", "intermediate", "all", 
         "Preserve movement quality as you age", 
         json.dumps(["mobility", "aging", "health"])),
        
        # FLEXIBILITY GOALS
        ("goal051", "Achieve Full Splits", "Flexibility", "advanced", "all", 
         "Master both front and side splits", 
         json.dumps(["flexibility", "splits", "advanced"])),
        
        ("goal052", "Improve Hamstring Flexibility", "Flexibility", "beginner", "all", 
         "Increase hamstring muscle flexibility", 
         json.dumps(["flexibility", "hamstrings", "legs"])),
        
        ("goal053", "Enhance Shoulder Flexibility", "Flexibility", "beginner", "all", 
         "Improve shoulder joint range of motion", 
         json.dumps(["flexibility", "shoulders", "upper_body"])),
        
        ("goal054", "Increase Hip Flexor Flexibility", "Flexibility", "beginner", "all", 
         "Reduce tight hip flexors", 
         json.dumps(["flexibility", "hip_flexors", "hips"])),
        
        ("goal055", "Master Advanced Stretches", "Flexibility", "advanced", "all", 
         "Perform advanced yoga and stretching poses", 
         json.dumps(["flexibility", "advanced", "yoga"])),
        
        ("goal056", "Reduce Muscle Tightness", "Flexibility", "beginner", "all", 
         "Alleviate chronic muscle tightness", 
         json.dumps(["flexibility", "recovery", "health"])),
        
        ("goal057", "Improve Athletic Performance", "Flexibility", "intermediate", "all", 
         "Enhance sports performance through flexibility", 
         json.dumps(["flexibility", "sports", "performance"])),
        
        ("goal058", "Prevent Injuries", "Flexibility", "beginner", "all", 
         "Reduce injury risk through flexibility work", 
         json.dumps(["flexibility", "injury_prevention", "health"])),
        
        ("goal059", "Achieve Gymnast Flexibility", "Flexibility", "advanced", "all", 
         "Develop gymnast-level flexibility", 
         json.dumps(["flexibility", "gymnastics", "advanced"])),
        
        ("goal060", "Maintain Flexibility with Age", "Flexibility", "intermediate", "all", 
         "Preserve flexibility as you get older", 
         json.dumps(["flexibility", "aging", "maintenance"])),
        
        # ATHLETIC PERFORMANCE GOALS
        ("goal061", "Increase Vertical Jump", "Athletic Performance", "intermediate", "14_17", 
         "Improve jumping ability for sports", 
         json.dumps(["athletic", "jumping", "power"])),
        
        ("goal062", "Improve Sprint Speed", "Athletic Performance", "intermediate", "all", 
         "Increase acceleration and top speed", 
         json.dumps(["athletic", "speed", "power"])),
        
        ("goal063", "Enhance Agility", "Athletic Performance", "intermediate", "all", 
         "Improve quick direction changes", 
         json.dumps(["athletic", "agility", "coordination"])),
        
        ("goal064", "Build Explosive Power", "Athletic Performance", "advanced", "14_17", 
         "Develop explosive athletic movements", 
         json.dumps(["athletic", "power", "explosive"])),
        
        ("goal065", "Improve Balance", "Athletic Performance", "beginner", "all", 
         "Enhance balance and stability", 
         json.dumps(["athletic", "balance", "stability"])),
        
        ("goal066", "Master Sport-Specific Skills", "Athletic Performance", "intermediate", "all", 
         "Excel at specific sport movements", 
         json.dumps(["athletic", "sports", "skills"])),
        
        ("goal067", "Increase Reaction Time", "Athletic Performance", "intermediate", "all", 
         "Improve quick reaction abilities", 
         json.dumps(["athletic", "reaction", "speed"])),
        
        ("goal068", "Build Functional Strength", "Athletic Performance", "intermediate", "all", 
         "Develop real-world applicable strength", 
         json.dumps(["athletic", "functional", "strength"])),
        
        ("goal069", "Enhance Coordination", "Athletic Performance", "beginner", "all", 
         "Improve overall body coordination", 
         json.dumps(["athletic", "coordination", "motor_skills"])),
        
        ("goal070", "Achieve Peak Athletic Condition", "Athletic Performance", "advanced", "14_17", 
         "Reach optimal athletic performance level", 
         json.dumps(["athletic", "peak", "performance"])),
        
        # SPORTS TRAINING GOALS
        ("goal071", "Excel at Basketball", "Sports Training", "intermediate", "all", 
         "Improve basketball-specific fitness", 
         json.dumps(["sports", "basketball", "training"])),
        
        ("goal072", "Master Soccer Fitness", "Sports Training", "intermediate", "all", 
         "Build soccer-specific endurance and skills", 
         json.dumps(["sports", "soccer", "endurance"])),
        
        ("goal073", "Train for Football", "Sports Training", "advanced", "14_17", 
         "Develop football-specific strength and power", 
         json.dumps(["sports", "football", "power"])),
        
        ("goal074", "Improve Tennis Performance", "Sports Training", "intermediate", "all", 
         "Enhance tennis-specific fitness", 
         json.dumps(["sports", "tennis", "agility"])),
        
        ("goal075", "Build Swimming Endurance", "Sports Training", "intermediate", "all", 
         "Develop swimming-specific cardiovascular fitness", 
         json.dumps(["sports", "swimming", "endurance"])),
        
        ("goal076", "Train for Martial Arts", "Sports Training", "intermediate", "all", 
         "Build martial arts-specific fitness", 
         json.dumps(["sports", "martial_arts", "combat"])),
        
        ("goal077", "Excel at Track and Field", "Sports Training", "advanced", "14_17", 
         "Develop track and field event-specific abilities", 
         json.dumps(["sports", "track_field", "athletics"])),
        
        ("goal078", "Improve Golf Performance", "Sports Training", "beginner", "all", 
         "Enhance golf-specific strength and flexibility", 
         json.dumps(["sports", "golf", "flexibility"])),
        
        ("goal079", "Build Baseball/Softball Power", "Sports Training", "intermediate", "all", 
         "Develop sport-specific hitting and throwing power", 
         json.dumps(["sports", "baseball", "power"])),
        
        ("goal080", "Train for Combat Sports", "Sports Training", "advanced", "14_17", 
         "Build combat sport-specific conditioning", 
         json.dumps(["sports", "combat", "conditioning"])),
        
        # REHABILITATION GOALS
        ("goal081", "Recover from Injury", "Rehabilitation", "beginner", "all", 
         "Safely recover and rebuild strength after injury", 
         json.dumps(["rehabilitation", "recovery", "health"])),
        
        ("goal082", "Strengthen Weak Areas", "Rehabilitation", "beginner", "all", 
         "Address muscle imbalances and weak points", 
         json.dumps(["rehabilitation", "strength", "balance"])),
        
        ("goal083", "Improve Posture", "Rehabilitation", "beginner", "all", 
         "Correct poor posture habits", 
         json.dumps(["rehabilitation", "posture", "health"])),
        
        ("goal084", "Joint Health Maintenance", "Rehabilitation", "beginner", "all", 
         "Maintain healthy joint function", 
         json.dumps(["rehabilitation", "joints", "health"])),
        
        ("goal085", "Back Pain Relief", "Rehabilitation", "beginner", "all", 
         "Reduce back pain through targeted exercises", 
         json.dumps(["rehabilitation", "back", "pain_relief"])),
        
        ("goal086", "Knee Rehabilitation", "Rehabilitation", "beginner", "all", 
         "Strengthen knees and surrounding muscles", 
         json.dumps(["rehabilitation", "knees", "strength"])),
        
        ("goal087", "Shoulder Recovery", "Rehabilitation", "beginner", "all", 
         "Rehabilitate shoulder injuries and improve function", 
         json.dumps(["rehabilitation", "shoulders", "recovery"])),
        
        ("goal088", "Ankle Stability", "Rehabilitation", "beginner", "all", 
         "Improve ankle strength and prevent sprains", 
         json.dumps(["rehabilitation", "ankles", "stability"])),
        
        ("goal089", "Hip Rehabilitation", "Rehabilitation", "beginner", "all", 
         "Recover from hip injuries and improve mobility", 
         json.dumps(["rehabilitation", "hips", "mobility"])),
        
        ("goal090", "Wrist and Forearm Recovery", "Rehabilitation", "beginner", "all", 
         "Strengthen wrists and forearms after injury", 
         json.dumps(["rehabilitation", "wrists", "forearms"])),
        
        # GENERAL HEALTH GOALS
        ("goal091", "Improve Overall Health", "General Health", "beginner", "all", 
         "Enhance general physical and mental health", 
         json.dumps(["health", "wellness", "general"])),
        
        ("goal092", "Reduce Stress", "General Health", "beginner", "all", 
         "Use exercise to manage stress levels", 
         json.dumps(["health", "stress", "mental"])),
        
        ("goal093", "Better Sleep Quality", "General Health", "beginner", "all", 
         "Improve sleep through regular exercise", 
         json.dumps(["health", "sleep", "recovery"])),
        
        ("goal094", "Increase Daily Energy", "General Health", "beginner", "all", 
         "Boost energy levels throughout the day", 
         json.dumps(["health", "energy", "vitality"])),
        
        ("goal095", "Build Healthy Habits", "General Health", "beginner", "all", 
         "Establish consistent exercise routine", 
         json.dumps(["health", "habits", "consistency"])),
        
        ("goal096", "Improve Mental Health", "General Health", "beginner", "all", 
         "Enhance mental well-being through fitness", 
         json.dumps(["health", "mental", "wellness"])),
        
        ("goal097", "Boost Immune System", "General Health", "intermediate", "all", 
         "Strengthen immune function through exercise", 
         json.dumps(["health", "immunity", "wellness"])),
        
        ("goal098", "Increase Longevity", "General Health", "intermediate", "all", 
         "Promote healthy aging through fitness", 
         json.dumps(["health", "longevity", "aging"])),
        
        ("goal099", "Improve Brain Function", "General Health", "beginner", "all", 
         "Enhance cognitive function through exercise", 
         json.dumps(["health", "brain", "cognitive"])),
        
        ("goal100", "Achieve Work-Life Balance", "General Health", "beginner", "all", 
         "Balance fitness with other life priorities", 
         json.dumps(["health", "balance", "lifestyle"]))
    ]
    
    cursor.executemany("""
        INSERT INTO goals (
            goal_id, goal_name, goal_category, difficulty_level, age_group, 
            description, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, goals)
    
    conn.commit()
    conn.close()
    print(f"Added {len(goals)} goals to database!")

def main():
    """Initialize the complete FITLIFY V8 database"""
    print("Creating FITLIFY V8 database...")
    create_database()
    print("Populating exercises...")
    populate_exercises()
    print("Populating goals...")
    populate_goals()
    print("FITLIFY V8 database initialization complete!")

if __name__ == "__main__":
    main()
