-- Create unified database for monolith
CREATE DATABASE IF NOT EXISTS novelnest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Keep old databases for backward compatibility during migration
CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS story_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to story_user
GRANT ALL PRIVILEGES ON novelnest_db.* TO 'story_user'@'%';
GRANT ALL PRIVILEGES ON auth_db.* TO 'story_user'@'%';
GRANT ALL PRIVILEGES ON story_db.* TO 'story_user'@'%';

FLUSH PRIVILEGES;
