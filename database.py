from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
import json

# Database setup
DATABASE_PATH = 'crumble.db'

class DatabaseConnection:
    def __init__(self):
        self.conn = None
    
    def __enter__(self):
        self.conn = sqlite3.connect(DATABASE_PATH)
        self.conn.row_factory = sqlite3.Row
        return self.conn
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn:
            if exc_type is None:
                self.conn.commit()
            else:
                self.conn.rollback()
            self.conn.close()
        return False

def get_db():
    return DatabaseConnection()

def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        days_strong INTEGER DEFAULT 0,
        last_active_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create rewards table to track claimed rewards
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        reward_id INTEGER,
        claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Create ghost mode settings table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS ghost_mode_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        block_messages BOOLEAN DEFAULT 0,
        hide_status BOOLEAN DEFAULT 0,
        mute_notifications BOOLEAN DEFAULT 0,
        hide_activity BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Create social platforms table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS social_platforms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        platform_name TEXT,
        username TEXT,
        connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Create breakup messages table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS breakup_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,  -- 'emoji', 'call', 'text'
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tone TEXT  -- 'classic', 'gentle', 'blunt', 'humorous'
    )
    ''')
    
    # Create quiz responses table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS quiz_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        question_id INTEGER,
        response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    conn.commit()
    conn.close()
    
    # Migrate existing users if any
    migrate_users_from_json()
    
    # Add default breakup messages
    add_default_breakup_messages()

def migrate_users_from_json():
    """Migrate existing users from JSON file to SQLite database"""
    json_file = 'users.json'
    
    if not os.path.exists(json_file):
        return
        
    try:
        with open(json_file, 'r') as f:
            users = json.load(f)
            
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        for user in users:
            # Check if user already exists
            cursor.execute('SELECT id FROM users WHERE email = ?', (user['email'],))
            if cursor.fetchone() is None:
                cursor.execute('''
                INSERT INTO users (id, username, email, password, points, streak, days_strong, last_active_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    user['id'],
                    user['username'],
                    user['email'],
                    user['password'],
                    user['points'],
                    user['streak'],
                    user['days_strong'],
                    user.get('last_active_date')
                ))
                
                # Migrate rewards if any
                if 'rewards' in user and user['rewards']:
                    for reward_id in user['rewards']:
                        cursor.execute('''
                        INSERT INTO user_rewards (user_id, reward_id)
                        VALUES (?, ?)
                        ''', (user['id'], reward_id))
                
                # Migrate ghost mode settings if any
                if 'ghost_mode_settings' in user:
                    settings = user['ghost_mode_settings']
                    cursor.execute('''
                    INSERT INTO ghost_mode_settings 
                    (user_id, block_messages, hide_status, mute_notifications, hide_activity)
                    VALUES (?, ?, ?, ?, ?)
                    ''', (
                        user['id'],
                        settings.get('blockMessages', 0),
                        settings.get('hideStatus', 0),
                        settings.get('muteNotifications', 0),
                        settings.get('hideActivity', 0)
                    ))
                
                # Migrate connected platforms if any
                if 'connected_platforms' in user:
                    for platform in user['connected_platforms']:
                        cursor.execute('''
                        INSERT INTO social_platforms (user_id, platform_name, username)
                        VALUES (?, ?, ?)
                        ''', (
                            user['id'],
                            platform['name'],
                            platform.get('username', '')
                        ))
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error migrating users: {e}")

def add_default_breakup_messages():
    """Add default breakup messages to the database"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Check if messages already exist
    cursor.execute('SELECT COUNT(*) FROM breakup_messages')
    if cursor.fetchone()[0] > 0:
        conn.close()
        return
    
    # Emoji breakup messages
    emoji_messages = [
        {
            'type': 'emoji',
            'title': 'The Classic Goodbye',
            'content': '👋 💔 🚶‍♂️',
            'tone': 'classic'
        },
        {
            'type': 'emoji',
            'title': 'It\'s Not You, It\'s Me',
            'content': '🙅‍♂️ 👉 😔 👈 🙅‍♀️',
            'tone': 'gentle'
        },
        {
            'type': 'emoji',
            'title': 'Moving On',
            'content': '🏃‍♂️ 💨 ➡️ 🌈 ✨',
            'tone': 'blunt'
        },
        {
            'type': 'emoji',
            'title': 'The Lighthearted Exit',
            'content': '🎭 🎪 👋 😂 🎭',
            'tone': 'humorous'
        }
    ]
    
    # Call breakup scripts
    call_messages = [
        {
            'type': 'call',
            'title': 'The Respectful Goodbye',
            'content': "I've been doing a lot of thinking about us, and I feel that we've grown apart. I value the time we've spent together, but I think it's best if we end our relationship and move forward separately.",
            'tone': 'classic'
        },
        {
            'type': 'call',
            'title': 'The Gentle Letdown',
            'content': "I care about you deeply, which is why this is so difficult to say. I've realized that our relationship isn't fulfilling my needs, and I think we both deserve to find happiness, even if that's not with each other.",
            'tone': 'gentle'
        },
        {
            'type': 'call',
            'title': 'The Direct Approach',
            'content': "I need to be straightforward with you. This relationship isn't working for me anymore, and I've decided to end it. I wish you the best, but I need to move on.",
            'tone': 'blunt'
        },
        {
            'type': 'call',
            'title': 'The Lighthearted Farewell',
            'content': "So, remember how we always joked that your cat hates me? I think the cat was right all along. In all seriousness though, I think we're better as friends, and I'd like to end our romantic relationship.",
            'tone': 'humorous'
        }
    ]
    
    # Text breakup messages
    text_messages = [
        {
            'type': 'text',
            'title': 'The Thoughtful Text',
            'content': "Hi [Name], I've been reflecting on our relationship, and I feel we should talk. I don't think we're compatible in the ways that matter for a long-term relationship. I've valued our time together, but I think it's best if we part ways. I wish you all the best.",
            'tone': 'classic'
        },
        {
            'type': 'text',
            'title': 'The Caring Goodbye',
            'content': "[Name], this is really hard for me to say, but I need to be honest with you. I don't feel the same way about our relationship as I once did. You're an amazing person, and I care about you deeply, but I think we need to end things between us. I hope you can understand.",
            'tone': 'gentle'
        },
        {
            'type': 'text',
            'title': 'The No-Nonsense Text',
            'content': "[Name], I've decided to end our relationship. We want different things, and I don't see a future for us together. I wish you well, but it's time for both of us to move on.",
            'tone': 'blunt'
        },
        {
            'type': 'text',
            'title': 'The Lighthearted Breakup',
            'content': "Hey [Name], remember how we always said honesty is the best policy? Well, honestly, I think we make better friends than partners. Our romantic relationship has run its course, but I still think you're awesome. Let's call it quits on the dating thing, ok?",
            'tone': 'humorous'
        }
    ]
    
    # Insert all messages
    for message in emoji_messages + call_messages + text_messages:
        cursor.execute('''
        INSERT INTO breakup_messages (type, title, content, tone)
        VALUES (?, ?, ?, ?)
        ''', (
            message['type'],
            message['title'],
            message['content'],
            message['tone']
        ))
    
    conn.commit()
    conn.close()

# User management functions
def get_user_by_email(email):
    """Get a user by email"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
            user = cursor.fetchone()
            if user:
                return dict(user)
            return None
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")
        return None

def get_user_by_id(user_id):
    """Get a user by ID"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
            user = cursor.fetchone()
            if user:
                return dict(user)
            return None
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")
        return None

def create_user(username, email, password):
    """Create a new user"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if user already exists
            cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
            if cursor.fetchone() is not None:
                return None, "User already exists"
            
            # Hash password
            hashed_password = generate_password_hash(password)
            
            # Insert new user
            cursor.execute('''
            INSERT INTO users (username, email, password, points, streak, days_strong)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (username, email, hashed_password, 0, 0, 0))
            
            user_id = cursor.lastrowid
            
            # Create default ghost mode settings
            cursor.execute('''
            INSERT INTO ghost_mode_settings (user_id, block_messages, hide_status, mute_notifications, hide_activity)
            VALUES (?, ?, ?, ?, ?)
            ''', (user_id, 0, 0, 0, 0))
            
            # Get the created user
            cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
            user = cursor.fetchone()
            
            if user:
                return dict(user), None
            return None, "Failed to create user"
            
    except sqlite3.Error as e:
        return None, f"Database error: {str(e)}"
    except Exception as e:
        return None, f"Unexpected error: {str(e)}"

def update_user_points(user_id, points_to_add):
    """Update user points and related stats"""
    import datetime
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Get current user data
            cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
            user = cursor.fetchone()
            
            if not user:
                return None, "User not found"
            
            user = dict(user)
            
            # Update points
            new_points = user['points'] + points_to_add
            
            # Update streak and days_strong if points are being added
            new_streak = user['streak']
            new_days_strong = user['days_strong']
            
            if points_to_add > 0:
                current_date = datetime.datetime.now().strftime('%Y-%m-%d')
                last_active = user.get('last_active_date')
                
                if last_active != current_date:
                    if last_active and (datetime.datetime.strptime(current_date, '%Y-%m-%d') - 
                                       datetime.datetime.strptime(last_active, '%Y-%m-%d')).days == 1:
                        # Consecutive day, increase streak
                        new_streak += 1
                        # Increase days_strong counter
                        new_days_strong += 1
                    elif last_active and (datetime.datetime.strptime(current_date, '%Y-%m-%d') - 
                                         datetime.datetime.strptime(last_active, '%Y-%m-%d')).days > 1:
                        # Streak broken, reset to 1
                        new_streak = 1
                        # Still increase days_strong
                        new_days_strong += 1
                    else:
                        # First activity or same day
                        new_streak = max(1, new_streak)
                        new_days_strong = max(1, new_days_strong)
                    
                    # Update last active date
                    cursor.execute('''
                    UPDATE users SET last_active_date = ? WHERE id = ?
                    ''', (current_date, user_id))
            
            # Update user
            cursor.execute('''
            UPDATE users SET points = ?, streak = ?, days_strong = ? WHERE id = ?
            ''', (new_points, new_streak, new_days_strong, user_id))
            
            # Get updated user
            cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
            updated_user = cursor.fetchone()
            
            if updated_user:
                return dict(updated_user), None
            return None, "Failed to update user"
            
    except sqlite3.Error as e:
        return None, f"Database error: {str(e)}"
    except Exception as e:
        return None, f"Unexpected error: {str(e)}"

# Breakup message functions
def get_breakup_messages(message_type=None):
    """Get breakup messages, optionally filtered by type"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if message_type:
        cursor.execute('SELECT * FROM breakup_messages WHERE type = ?', (message_type,))
    else:
        cursor.execute('SELECT * FROM breakup_messages')
    
    messages = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return messages

# Quiz and recommendation functions
def save_quiz_response(user_id, question_id, response):
    """Save a user's quiz response"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO quiz_responses (user_id, question_id, response)
    VALUES (?, ?, ?)
    ''', (user_id, question_id, response))
    
    conn.commit()
    conn.close()
    
    return True

def get_user_quiz_responses(user_id):
    """Get a user's quiz responses"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT * FROM quiz_responses WHERE user_id = ?
    ORDER BY question_id
    ''', (user_id,))
    
    responses = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return responses

# Reward functions
def get_user_rewards(user_id):
    """Get a user's claimed rewards"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT reward_id FROM user_rewards WHERE user_id = ?
    ''', (user_id,))
    
    rewards = [row['reward_id'] for row in cursor.fetchall()]
    
    conn.close()
    
    return rewards

def claim_reward(user_id, reward_id):
    """Claim a reward for a user"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Check if already claimed
    cursor.execute('''
    SELECT id FROM user_rewards WHERE user_id = ? AND reward_id = ?
    ''', (user_id, reward_id))
    
    if cursor.fetchone() is not None:
        conn.close()
        return False, "Reward already claimed"
    
    # Add reward
    cursor.execute('''
    INSERT INTO user_rewards (user_id, reward_id)
    VALUES (?, ?)
    ''', (user_id, reward_id))
    
    conn.commit()
    conn.close()
    
    return True, None

# Ghost mode functions
def get_ghost_mode_settings(user_id):
    """Get ghost mode settings for a user"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM ghost_mode_settings WHERE user_id = ?', (user_id,))
            settings = cursor.fetchone()
            
            if settings:
                return dict(settings)
            # Return default settings if none found
            return {
                'block_messages': False,
                'hide_status': False,
                'mute_notifications': False,
                'hide_activity': False
            }
    except sqlite3.Error as e:
        return None
    except Exception as e:
        return None

def update_ghost_mode_settings(user_id, settings):
    """Update a user's ghost mode settings"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            UPDATE ghost_mode_settings
            SET block_messages = ?,
                hide_status = ?,
                mute_notifications = ?,
                hide_activity = ?
            WHERE user_id = ?
            ''', (
                settings.get('blockMessages', False),
                settings.get('hideStatus', False),
                settings.get('muteNotifications', False),
                settings.get('hideActivity', False),
                user_id
            ))
            
            if cursor.rowcount == 0:
                # No existing settings, create new ones
                cursor.execute('''
                INSERT INTO ghost_mode_settings
                (user_id, block_messages, hide_status, mute_notifications, hide_activity)
                VALUES (?, ?, ?, ?, ?)
                ''', (
                    user_id,
                    settings.get('blockMessages', False),
                    settings.get('hideStatus', False),
                    settings.get('muteNotifications', False),
                    settings.get('hideActivity', False)
                ))
            
            return True
    
    except sqlite3.Error as e:
        return False
    except Exception as e:
        return False

# Social platform functions
def get_user_social_platforms(user_id):
    """Get all social platforms connected to a user"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT platform_name, username, connected_at
            FROM social_platforms
            WHERE user_id = ?
            ORDER BY connected_at DESC
            ''', (user_id,))
            
            platforms = [dict(row) for row in cursor.fetchall()]
            return platforms
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")
        return None

def add_social_platform(user_id, platform_name, username=''):
    """Add a social platform connection for a user"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if platform is already connected
            cursor.execute('''
            SELECT id FROM social_platforms
            WHERE user_id = ? AND platform_name = ?
            ''', (user_id, platform_name))
            
            if cursor.fetchone() is not None:
                return False
            
            # Add new platform connection
            cursor.execute('''
            INSERT INTO social_platforms (user_id, platform_name, username)
            VALUES (?, ?, ?)
            ''', (user_id, platform_name, username))
            
            return True
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")
        return False

def remove_social_platform(user_id, platform_name):
    """Remove a social platform connection for a user"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            DELETE FROM social_platforms
            WHERE user_id = ? AND platform_name = ?
            ''', (user_id, platform_name))
            
            return cursor.rowcount > 0
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")
        return False

def get_ghost_mode_days(user_id):
    """Get the number of days a user has used ghost mode"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT COUNT(DISTINCT date(timestamp)) as days
                FROM ghost_mode_logs
                WHERE user_id = ?
            ''', (user_id,))
            result = cursor.fetchone()
            return result['days'] if result else 0
    except sqlite3.Error:
        return 0

def get_user_achievements(user_id):
    """Get user's achievements with completion dates"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            # Create achievements table if it doesn't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_achievements (
                    user_id INTEGER,
                    achievement_id INTEGER,
                    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_id, achievement_id)
                )
            ''')
            
            # Get completed achievements
            cursor.execute('''
                SELECT achievement_id, completed_at
                FROM user_achievements
                WHERE user_id = ?
                ORDER BY completed_at DESC
            ''', (user_id,))
            return [dict(row) for row in cursor.fetchall()]
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")
        return []

def save_achievement(user_id, achievement_id):
    """Save a completed achievement"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR IGNORE INTO user_achievements (user_id, achievement_id)
                VALUES (?, ?)
            ''', (user_id, achievement_id))
            return True
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")
        return False

def get_user_claimed_rewards(user_id):
    """Get all rewards claimed by a user"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT reward_id
            FROM user_rewards
            WHERE user_id = ?
            ''', (user_id,))
            
            return [row['reward_id'] for row in cursor.fetchall()]
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")
        return []

def is_reward_claimed(user_id, reward_id):
    """Check if a user has claimed a specific reward"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            SELECT id
            FROM user_rewards
            WHERE user_id = ? AND reward_id = ?
            ''', (user_id, reward_id))
            
            return cursor.fetchone() is not None
    except sqlite3.Error as e:
        print(f"Database error: {str(e)}")
        return False
    """Get a user's connected social platforms"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM social_platforms WHERE user_id = ?', (user_id,))
            platforms = cursor.fetchall()
            
            if platforms:
                return [dict(platform) for platform in platforms]
            return []
    except sqlite3.Error as e:
        return None
    except Exception as e:
        return None

def connect_social_platform(user_id, platform_name, username):
    """Connect a social platform for a user"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Check if already connected
            cursor.execute('SELECT id FROM social_platforms WHERE user_id = ? AND platform_name = ?',
                         (user_id, platform_name))
            
            if cursor.fetchone() is not None:
                return False, "Platform already connected"
            
            # Connect platform
            cursor.execute('''
            INSERT INTO social_platforms (user_id, platform_name, username)
            VALUES (?, ?, ?)
            ''', (user_id, platform_name, username))
            
            return True, None
    except sqlite3.Error as e:
        return False, f"Database error: {str(e)}"
    except Exception as e:
        return False, f"Unexpected error: {str(e)}"

def disconnect_social_platform(user_id, platform_name):
    """Disconnect a social platform for a user"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            DELETE FROM social_platforms WHERE user_id = ? AND platform_name = ?
            ''', (user_id, platform_name))
            return cursor.rowcount > 0
    except sqlite3.Error as e:
        return False
    except Exception as e:
        return False