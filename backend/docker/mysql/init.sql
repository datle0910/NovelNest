-- Create unified database for monolith
CREATE DATABASE IF NOT EXISTS novelnest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to story_user
GRANT ALL PRIVILEGES ON novelnest_db.* TO 'story_user'@'%';

FLUSH PRIVILEGES;
