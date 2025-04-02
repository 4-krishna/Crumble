from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# In a real app, you would use a database
# For this demo, we'll use a simple JSON file
USERS_FILE = 'users.json'
SECRET_KEY = 'your-secret-key'  # In production, use a secure key

# Initialize users file if it doesn't exist
def init_users_file():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump([], f)

# Get all users
def get_users():
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

# Save users
def save_users(users):
    try:
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f)
        return True
    except Exception as e:
        print(f"Error saving users: {e}")
        return False

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    users = get_users()
    
    # Check if user already exists
    if any(user['email'] == data['email'] for user in users):
        return jsonify({'message': 'User already exists'}), 400
    
    # Create new user
    new_user = {
        'id': len(users) + 1,
        'username': data['username'],
        'email': data['email'],
        'password': generate_password_hash(data['password']),
        'points': 0,
        'streak': 0,
        'days_strong': 0,
        'rewards': []
    }
    
    users.append(new_user)
    save_success = save_users(users)
    
    if not save_success:
        return jsonify({'message': 'Failed to save user data. Please try again.'}), 500
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
    
    users = get_users()
    
    # Find user
    user = next((user for user in users if user['email'] == data['email']), None)
    
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
def generate_message():
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

@app.route('/api/user/update-points', methods=['POST'])
def update_points():
    # This would normally verify the JWT token
    data = request.get_json()
    
    if not data or 'user_id' not in data or 'points' not in data:
        return jsonify({'message': 'Missing required fields'}), 400
    
    users = get_users()
    
    # Find user
    user_index = next((i for i, user in enumerate(users) if user['id'] == data['user_id']), None)
    
    if user_index is None:
        return jsonify({'message': 'User not found'}), 404
    
    # Update points
    users[user_index]['points'] += data['points']
    
    # Update streak if points are being added (assuming positive points means user is active)
    if data['points'] > 0:
        # Check if this is a new day compared to last activity
        current_date = datetime.datetime.now().strftime('%Y-%m-%d')
        last_active = users[user_index].get('last_active_date')
        
        if last_active != current_date:
            if last_active and (datetime.datetime.strptime(current_date, '%Y-%m-%d') - 
                               datetime.datetime.strptime(last_active, '%Y-%m-%d')).days == 1:
                # Consecutive day, increase streak
                users[user_index]['streak'] += 1
                # Increase days_strong counter
                users[user_index]['days_strong'] += 1
            elif last_active and (datetime.datetime.strptime(current_date, '%Y-%m-%d') - 
                                 datetime.datetime.strptime(last_active, '%Y-%m-%d')).days > 1:
                # Streak broken, reset to 1
                users[user_index]['streak'] = 1
                # Still increase days_strong
                users[user_index]['days_strong'] += 1
            else:
                # First activity or same day
                users[user_index]['streak'] = max(1, users[user_index].get('streak', 0))
                users[user_index]['days_strong'] = max(1, users[user_index].get('days_strong', 0))
            
            # Update last active date
            users[user_index]['last_active_date'] = current_date
    
    save_users(users)
    
    return jsonify({
        'message': 'Points updated successfully',
        'points': users[user_index]['points'],
        'streak': users[user_index]['streak'],
        'days_strong': users[user_index]['days_strong']
    })

@app.route('/api/user/ghost-mode/settings', methods=['GET', 'POST'])
def ghost_mode_settings():
    data = request.get_json()
    
    if not data or 'user_id' not in data:
        return jsonify({'message': 'Missing user_id'}), 400
    
    users = get_users()
    
    # Find user
    user_index = next((i for i, user in enumerate(users) if user['id'] == data['user_id']), None)
    
    if user_index is None:
        return jsonify({'message': 'User not found'}), 404
    
    if request.method == 'GET':
        # Return current settings or defaults if not set
        settings = users[user_index].get('ghost_mode_settings', {
            'blockMessages': False,
            'hideStatus': False,
            'muteNotifications': False,
            'hideActivity': False
        })
        return jsonify(settings)
    
    elif request.method == 'POST':
        # Update settings
        if 'settings' not in data:
            return jsonify({'message': 'Missing settings data'}), 400
        
        # Store or update ghost mode settings
        users[user_index]['ghost_mode_settings'] = data['settings']
        save_users(users)
        
        return jsonify({
            'message': 'Ghost mode settings updated successfully',
            'settings': users[user_index]['ghost_mode_settings']
        })

@app.route('/api/user/social-platforms', methods=['GET', 'POST', 'DELETE'])
def manage_social_platforms():
    data = request.get_json()
    
    if not data or 'user_id' not in data:
        return jsonify({'message': 'Missing user_id'}), 400
    
    users = get_users()
    
    # Find user
    user_index = next((i for i, user in enumerate(users) if user['id'] == data['user_id']), None)
    
    if user_index is None:
        return jsonify({'message': 'User not found'}), 404
    
    if request.method == 'GET':
        # Return connected platforms or empty list if none
        platforms = users[user_index].get('connected_platforms', [])
        return jsonify(platforms)
    
    elif request.method == 'POST':
        # Connect a new platform
        if 'platform' not in data:
            return jsonify({'message': 'Missing platform data'}), 400
        
        # Initialize connected_platforms if it doesn't exist
        if 'connected_platforms' not in users[user_index]:
            users[user_index]['connected_platforms'] = []
        
        # Add platform if not already connected
        if not any(p['name'] == data['platform']['name'] for p in users[user_index]['connected_platforms']):
            users[user_index]['connected_platforms'].append(data['platform'])
            save_users(users)
            return jsonify({
                'message': f"Platform {data['platform']['name']} connected successfully",
                'platforms': users[user_index]['connected_platforms']
            })
        else:
            return jsonify({'message': 'Platform already connected'}), 400
    
    elif request.method == 'DELETE':
        # Disconnect a platform
        if 'platform_name' not in data:
            return jsonify({'message': 'Missing platform_name'}), 400
        
        if 'connected_platforms' in users[user_index]:
            # Remove platform if it exists
            users[user_index]['connected_platforms'] = [
                p for p in users[user_index]['connected_platforms'] 
                if p['name'] != data['platform_name']
            ]
            save_users(users)
        
        return jsonify({
            'message': f"Platform {data['platform_name']} disconnected successfully",
            'platforms': users[user_index].get('connected_platforms', [])
        })

@app.route('/api/user/rewards', methods=['GET'])
def get_rewards():
    data = request.get_json()
    
    if not data or 'user_id' not in data:
        return jsonify({'message': 'Missing user_id'}), 400
    
    users = get_users()
    
    # Find user
    user_index = next((i for i, user in enumerate(users) if user['id'] == data['user_id']), None)
    
    if user_index is None:
        return jsonify({'message': 'User not found'}), 404
    
    # Get user's points to determine which rewards are unlocked
    user_points = users[user_index]['points']
    
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
    
    # Get user's claimed rewards
    claimed_rewards = users[user_index].get('rewards', [])
    
    # Mark rewards as claimed if they are in the user's claimed rewards
    for reward in rewards:
        reward['claimed'] = reward['id'] in claimed_rewards
    
    return jsonify(rewards)

@app.route('/api/user/rewards/claim', methods=['POST'])
def claim_reward():
    data = request.get_json()
    
    if not data or 'user_id' not in data or 'reward_id' not in data:
        return jsonify({'message': 'Missing required fields'}), 400
    
    users = get_users()
    
    # Find user
    user_index = next((i for i, user in enumerate(users) if user['id'] == data['user_id']), None)
    
    if user_index is None:
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
    if users[user_index]['points'] < reward_points[reward_id]:
        return jsonify({'message': 'Not enough points to claim this reward'}), 400
    
    # Initialize rewards array if it doesn't exist
    if 'rewards' not in users[user_index]:
        users[user_index]['rewards'] = []
    
    # Check if reward is already claimed
    if reward_id in users[user_index]['rewards']:
        return jsonify({'message': 'Reward already claimed'}), 400
    
    # Add reward to user's claimed rewards
    users[user_index]['rewards'].append(reward_id)
    save_users(users)
    
    return jsonify({
        'message': 'Reward claimed successfully',
        'rewards': users[user_index]['rewards']
    })

@app.route('/api/user/achievements', methods=['GET'])
def get_achievements():
    data = request.get_json()
    
    if not data or 'user_id' not in data:
        return jsonify({'message': 'Missing user_id'}), 400
    
    users = get_users()
    
    # Find user
    user_index = next((i for i, user in enumerate(users) if user['id'] == data['user_id']), None)
    
    if user_index is None:
        return jsonify({'message': 'User not found'}), 404
    
    # Get user data for achievement calculations
    user_streak = users[user_index].get('streak', 0)
    user_days_strong = users[user_index].get('days_strong', 0)
    
    # Define achievements and check if they're completed
    achievements = [
        {
            'id': 1,
            'title': '7-Day Streak',
            'description': 'Logged in for 7 consecutive days',
            'points': 50,
            'completed': user_streak >= 7
        },
        {
            'id': 2,
            'title': '30-Day Journey',
            'description': 'Reached 30 days in your healing journey',
            'points': 100,
            'completed': user_days_strong >= 30
        },
        {
            'id': 3,
            'title': 'Ghost Mode Master',
            'description': 'Used Ghost Mode features for 30 days',
            'points': 150,
            'completed': False  # This would need additional tracking logic
        },
    ]
    
    return jsonify(achievements)

# Initialize the app
init_users_file()

if __name__ == '__main__':
    app.run(debug=True)