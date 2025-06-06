import sqlite3
import os
from flask import Flask, request, jsonify, send_file, send_from_directory, Response
from flask.typing import ResponseReturnValue
from typing import Union
from flask_cors import CORS
import jwt
import datetime
import os
from werkzeug.security import check_password_hash, generate_password_hash
import database as db

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

SECRET_KEY = 'your-secret-key'  # In production, use a secure key

# Routes
@app.route('/api/register', methods=['POST'])
def register() -> ResponseReturnValue:
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Create new user in database
    user, error = db.create_user(data['username'], data['email'], data['password'])
    
    if error:
        return jsonify({'message': error}), 400
    
    if not user:
        return jsonify({'message': 'Failed to create user. Please try again.'}), 500
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login() -> ResponseReturnValue:
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
    
    # Find user in database
    user = db.get_user_by_email(data['email'])
    
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Generate token
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, SECRET_KEY)
    
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'points': user['points'],
            'streak': user['streak'],
            'days_strong': user['days_strong']
        }
    })

@app.route('/api/messages/generate', methods=['GET'])
def generate_message() -> ResponseReturnValue:
    messages = [
        'Remember, every ending is a new beginning.',
        'You are stronger than you know.',
        'Focus on self-love and growth today.',
        'Take time to heal and rediscover yourself.',
        "It's okay to not be okay sometimes.",
        'Your worth is not defined by someone else\'s inability to see it.',
        'Healing is not linear, but it is possible.',
        'Today is another step forward in your journey.',
        'You deserve peace and happiness.',
        'Trust the process and be patient with yourself.'
    ]
    
    import random
    message = random.choice(messages)
    
    return jsonify({'message': message})

def verify_token() -> dict | None:
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route('/api/user/update-points', methods=['POST'])
def update_points() -> ResponseReturnValue:
    token_data = verify_token()
    if not token_data:
        return jsonify({'message': 'Invalid or expired token'}), 401
    
    data = request.get_json()
    if not data or 'points' not in data:
        return jsonify({'message': 'Missing required fields'}), 400
    
    user_id = token_data['user_id']
    points = data['points']
    
    # Update user points using database module
    result, error = db.update_user_points(user_id, points)
    
    if error:
        return jsonify({'message': error}), 500
    
    if not result:
        return jsonify({'message': 'Failed to update points'}), 500
    
    return jsonify({
        'message': 'Points updated successfully',
        'points': result['points'],
        'streak': result['streak'],
        'days_strong': result['days_strong']
    })

@app.route('/api/user/ghost-mode/settings', methods=['GET', 'POST'])
def ghost_mode_settings() -> ResponseReturnValue:
    token_data = verify_token()
    if not token_data:
        return jsonify({'message': 'Invalid or expired token'}), 401
    
    user_id = token_data['user_id']
    
    if request.method == 'GET':
        settings = db.get_ghost_mode_settings(user_id)
        if settings is None:
            return jsonify({'message': 'Failed to retrieve ghost mode settings'}), 500
            
        # Create default settings if none exist
        if not settings:
            default_settings = {
                'blockMessages': False,
                'hideStatus': False,
                'muteNotifications': False,
                'hideActivity': False
            }
            if not db.update_ghost_mode_settings(user_id, default_settings):
                return jsonify({'message': 'Failed to create default settings'}), 500
            settings = db.get_ghost_mode_settings(user_id)
            if settings is None:
                return jsonify({'message': 'Failed to retrieve ghost mode settings'}), 500
        
        return jsonify({
            'blockMessages': bool(settings.get('block_messages', False)),
            'hideStatus': bool(settings.get('hide_status', False)),
            'muteNotifications': bool(settings.get('mute_notifications', False)),
            'hideActivity': bool(settings.get('hide_activity', False))
        })
    
    # POST method
    data = request.get_json()
    if not data or 'settings' not in data:
        return jsonify({'message': 'Missing settings data'}), 400
    
    settings = data['settings']
    if not isinstance(settings, dict):
        return jsonify({'message': 'Invalid settings format'}), 400
        
    # Validate settings fields
    required_fields = ['blockMessages', 'hideStatus', 'muteNotifications', 'hideActivity']
    for field in required_fields:
        if field not in settings:
            return jsonify({'message': f'Missing required field: {field}'}), 400
        if not isinstance(settings[field], bool):
            return jsonify({'message': f'Invalid value for {field}: must be boolean'}), 400
    
    if not db.update_ghost_mode_settings(user_id, settings):
        return jsonify({'message': 'Failed to update ghost mode settings'}), 500
    
    return jsonify({
        'message': 'Ghost mode settings updated successfully',
        'settings': settings
    })

@app.route('/api/user/ghost-mode/days', methods=['GET'])
def get_ghost_mode_days() -> ResponseReturnValue:
    token_data = verify_token()
    if not token_data:
        return jsonify({'message': 'Invalid or expired token'}), 401
    
    user_id = token_data['user_id']
    
    ghost_mode_days = db.get_ghost_mode_days(user_id)
    if ghost_mode_days is None:
        return jsonify({'message': 'Failed to get ghost mode days'}), 500
    
    return jsonify({'days': ghost_mode_days})

@app.route('/api/breakup-messages/<message_type>', methods=['GET'])
def get_breakup_messages(message_type) -> ResponseReturnValue:
    import csv
    import os
    
    if message_type not in ['emoji', 'call', 'text']:
        return jsonify({'message': 'Invalid message type'}), 400
    
    # Use absolute path for assets directory
    assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
    csv_file = os.path.join(assets_dir, f'breakup_{message_type}.csv')
    
    try:
        messages = []
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Handle both single-column and multi-column CSV files
                content = row.get('content') or row.get('message') or list(row.values())[0]
                tone = row.get('tone', 'classic')
                message = {
                    'content': content,
                    'tone': tone
                }
                messages.append(message)
        return jsonify(messages)
    except FileNotFoundError:
        return jsonify({'message': f'Failed to load {message_type} breakup messages'}), 404
    except Exception as e:
        app.logger.error(f'Error loading breakup messages: {str(e)}')
        return jsonify({'message': 'Error loading messages'}), 500

@app.route('/api/user/social-platforms', methods=['GET', 'POST', 'DELETE'])
def manage_social_platforms() -> ResponseReturnValue:
    token_data = verify_token()
    if not token_data:
        return jsonify({'message': 'Invalid or expired token'}), 401
    
    user_id = token_data['user_id']
    
    try:
        if request.method == 'GET':
            platforms = db.get_user_social_platforms(user_id)
            if platforms is None:
                return jsonify({'message': 'Failed to get social platforms'}), 500
            return jsonify(platforms)
        
        if request.method == 'POST':
            data = request.get_json()
            if not data or 'platform' not in data:
                return jsonify({'message': 'Missing platform data'}), 400
            
            platform = data['platform']
            if not platform.get('name'):
                return jsonify({'message': 'Platform name is required'}), 400
            
            if not isinstance(platform.get('username', ''), str):
                return jsonify({'message': 'Username must be a string'}), 400
            
            result = db.add_social_platform(user_id, platform['name'], platform.get('username', ''))
            if not result:
                return jsonify({'message': 'Failed to connect platform'}), 500
            
            return jsonify({
                'message': 'Platform connected successfully',
                'platform': platform
            })
        
        # DELETE method
        data = request.get_json()
        if not data or 'platform_name' not in data:
            return jsonify({'message': 'Missing platform name'}), 400
        
        if not isinstance(data['platform_name'], str):
            return jsonify({'message': 'Platform name must be a string'}), 400
        
        if db.remove_social_platform(user_id, data['platform_name']):
            return jsonify({'message': 'Platform disconnected successfully'})
        return jsonify({'message': 'Failed to disconnect platform'}), 500
    
    except Exception as e:
        app.logger.error(f'Error managing social platforms: {str(e)}')
        return jsonify({'message': 'Internal server error'}), 500
        
@app.route('/api/user/rewards', methods=['GET'])
def get_rewards() -> ResponseReturnValue:
    token_data = verify_token()
    if not token_data:
        return jsonify({'message': 'Invalid or expired token'}), 401
    
    user_id = token_data['user_id']
    user = db.get_user_by_id(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    user_points = user['points']
    
    # Define available rewards
    rewards = [
        {
            'id': 1,
            'title': 'Digital Journal Theme',
            'description': 'Unlock a premium journal theme',
            'points': 100,
            'unlocked': user_points >= 100
        },
        {
            'id': 2,
            'title': 'Custom Affirmations',
            'description': 'Create and save your own affirmations',
            'points': 200,
            'unlocked': user_points >= 200
        },
        {
            'id': 3,
            'title': 'Advanced Analytics',
            'description': 'Get detailed insights into your healing journey',
            'points': 300,
            'unlocked': user_points >= 300
        },
        {
            'id': 4,
            'title': 'Meditation Collection',
            'description': 'Access premium guided meditations',
            'points': 500,
            'unlocked': user_points >= 500
        },
    ]
    
    # Get user's claimed rewards from database
    claimed_rewards = db.get_user_claimed_rewards(user_id)
    
    # Mark rewards as claimed if they are in the user's claimed rewards
    for reward in rewards:
        reward['claimed'] = reward['id'] in claimed_rewards
    
    return jsonify(rewards)

@app.route('/api/user/rewards/claim', methods=['POST'])
def claim_reward() -> ResponseReturnValue:
    token_data = verify_token()
    if not token_data:
        return jsonify({'message': 'Invalid or expired token'}), 401
    
    data = request.get_json()
    if not data or 'reward_id' not in data:
        return jsonify({'message': 'Missing reward_id'}), 400
    
    user_id = token_data['user_id']
    user = db.get_user_by_id(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Define reward point requirements
    reward_points = {
        1: 100,  # Digital Journal Theme
        2: 200,  # Custom Affirmations
        3: 300,  # Advanced Analytics
        4: 500,  # Meditation Collection
    }
    
    reward_id = data['reward_id']
    
    # Check if reward exists
    if reward_id not in reward_points:
        return jsonify({'message': 'Invalid reward ID'}), 400
    
    # Check if user has enough points
    if user['points'] < reward_points[reward_id]:
        return jsonify({'message': 'Not enough points to claim this reward'}), 400
    
    # Check if reward is already claimed
    if db.is_reward_claimed(user_id, reward_id):
        return jsonify({'message': 'Reward already claimed'}), 400
    
    # Add reward to user's claimed rewards
    if db.claim_reward(user_id, reward_id):
        return jsonify({
            'message': 'Reward claimed successfully',
            'rewards': db.get_user_claimed_rewards(user_id)
        })
    
    return jsonify({'message': 'Failed to claim reward'}), 500

@app.route('/api/user/achievements', methods=['GET'])
def get_achievements() -> ResponseReturnValue:
    token_data = verify_token()
    if not token_data:
        return jsonify({'message': 'Invalid or expired token'}), 401
    
    user_id = token_data['user_id']
    user = db.get_user_by_id(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Get user data for achievement calculations
    user_streak = user.get('streak', 0)
    user_days_strong = user.get('days_strong', 0)
    ghost_mode_days = db.get_ghost_mode_days(user_id)
    
    # Get completed achievements with dates
    completed_achievements = db.get_user_achievements(user_id)
    completed_ids = {ach['achievement_id']: ach['completed_at'] for ach in completed_achievements}
    
    # Define achievements and check if they're completed
    achievements = [
        {
            'id': 1,
            'title': '7-Day Streak',
            'description': 'Logged in for 7 consecutive days',
            'points': 50,
            'completed': user_streak >= 7,
            'completed_at': completed_ids.get(1)
        },
        {
            'id': 2,
            'title': '30-Day Journey',
            'description': 'Reached 30 days in your healing journey',
            'points': 100,
            'completed': user_days_strong >= 30,
            'completed_at': completed_ids.get(2)
        },
        {
            'id': 3,
            'title': 'Ghost Mode Master',
            'description': 'Used Ghost Mode features for 30 days',
            'points': 150,
            'completed': ghost_mode_days >= 30,
            'completed_at': completed_ids.get(3)
        },
    ]
    
    # Check for newly completed achievements and save them
    for achievement in achievements:
        if achievement['completed'] and not achievement['completed_at']:
            db.save_achievement(user_id, achievement['id'])
            # Update points
            db.update_user_points(user_id, achievement['points'])
    
    return jsonify(achievements)

@app.route('/api/user/recent-achievements', methods=['GET'])
def get_recent_achievements() -> ResponseReturnValue:
    token_data = verify_token()
    if not token_data:
        return jsonify({'message': 'Invalid or expired token'}), 401
    
    user_id = token_data['user_id']
    completed_achievements = db.get_user_achievements(user_id)
    
    # Get all achievements to map IDs to full achievement data
    all_achievements = [
        {
            'id': 1,
            'title': '7-Day Streak',
            'description': 'Logged in for 7 consecutive days',
            'points': 50
        },
        {
            'id': 2,
            'title': '30-Day Journey',
            'description': 'Reached 30 days in your healing journey',
            'points': 100
        },
        {
            'id': 3,
            'title': 'Ghost Mode Master',
            'description': 'Used Ghost Mode features for 30 days',
            'points': 150
        },
    ]
    
    achievement_map = {ach['id']: ach for ach in all_achievements}
    
    # Combine completion dates with achievement details and sort by completion date
    recent_achievements = []
    for completed in completed_achievements:
        achievement = achievement_map.get(completed['achievement_id'])
        if achievement:
            recent_achievements.append({
                **achievement,
                'completed_at': completed['completed_at']
            })
    
    # Sort achievements by completion date, most recent first
    recent_achievements.sort(key=lambda x: x['completed_at'], reverse=True)
    
    return jsonify(recent_achievements)

@app.route('/api/quiz/magic', methods=['GET'])
def get_magic_quiz() -> ResponseReturnValue:
    try:
        import csv
        
        # Use absolute path for assets directory
        assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
        csv_file = os.path.join(assets_dir, 'magic_quiz.csv')
        
        questions = []
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                question = {
                    'question': row['Question'],
                    'options': [
                        row['Option1'],
                        row['Option2'],
                        row['Option3'],
                        row['Option4']
                    ]
                }
                questions.append(question)
        
        return jsonify(questions)
    except FileNotFoundError:
        return jsonify({'message': 'Quiz questions not found'}), 404
    except Exception as e:
        app.logger.error(f'Error loading quiz questions: {str(e)}')
        return jsonify({'message': 'Error loading quiz questions'}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path) -> ResponseReturnValue:
    try:
        # First try to serve static files from public directory
        if path and os.path.exists(os.path.join('public', path)):
            return send_from_directory('public', path)
        # For assets, try to serve from public/assets
        if path.startswith('assets/') and os.path.exists(os.path.join('public', path)):
            return send_from_directory('public', path)
        # For all other routes, serve index.html from public directory
        return send_from_directory('public', 'index.html')
    except Exception as e:
        app.logger.error(f'Error serving frontend: {str(e)}')
        return 'Internal Server Error', 500

if __name__ == '__main__':
    import os
    from flask import send_from_directory
    db.init_db()
    app.run(debug=True)