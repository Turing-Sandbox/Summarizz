
-- Test data for Summarizz application
-- This script populates the database with test data for development purposes

-- Users (100 users)
INSERT INTO users (first_name, last_name, email, username, profile_image, bio, phone, date_of_birth, location, website, is_private, subscription_status, subscription_tier)
SELECT
    'FirstName' || i,
    'LastName' || i,
    'user' || i || '@example.com',
    'username' || i,
    CASE WHEN i % 5 = 0 THEN 'https://randomuser.me/api/portraits/men/' || (i % 50) || '.jpg'
         WHEN i % 5 = 1 THEN 'https://randomuser.me/api/portraits/women/' || (i % 50) || '.jpg'
         ELSE NULL
    END,
    CASE WHEN i % 3 = 0 THEN 'Bio for user ' || i || '. This is a sample biography text that describes the user interests and background.'
         ELSE NULL
    END,
    CASE WHEN i % 4 = 0 THEN '+1-555-' || (100 + i) || '-' || (1000 + i)
         ELSE NULL
    END,
    CASE WHEN i % 2 = 0 THEN '1990-01-01'::DATE + (i || ' days')::INTERVAL
         ELSE NULL
    END,
    CASE WHEN i % 3 = 0 THEN 'City' || (i % 20)
         ELSE NULL
    END,
    CASE WHEN i % 5 = 0 THEN 'https://website' || i || '.com'
         ELSE NULL
    END,
    CASE WHEN i % 10 = 0 THEN TRUE ELSE FALSE END,
    CASE 
        WHEN i % 10 = 0 THEN 'active'
        WHEN i % 10 = 1 THEN 'trialing'
        WHEN i % 10 = 2 THEN 'past_due'
        WHEN i % 10 = 3 THEN 'canceled'
        ELSE 'free'
    END,
    CASE WHEN i % 10 < 4 THEN 'pro' ELSE 'free' END
FROM generate_series(1, 100) i;

-- Add some Stripe data for paid users
UPDATE users
SET 
    stripe_customer_id = 'cus_' || md5(random()::text),
    stripe_subscription_id = 'sub_' || md5(random()::text),
    subscription_period_start = NOW() - INTERVAL '30 days',
    subscription_period_end = NOW() + INTERVAL '30 days'
WHERE subscription_tier = 'pro';

-- Content (500 articles)
INSERT INTO content (creator_id, title, content, summary, thumbnail, date_created, date_updated, read_time, likes, views, shares, score)
SELECT
    u.user_id,
    'Article Title ' || i || ': ' || (
        CASE 
            WHEN i % 5 = 0 THEN 'How to Improve Your Productivity'
            WHEN i % 5 = 1 THEN 'The Future of AI Technology'
            WHEN i % 5 = 2 THEN 'Understanding Modern Web Development'
            WHEN i % 5 = 3 THEN 'Best Practices for Data Science'
            ELSE 'Essential Tips for Software Engineers'
        END
    ),
    'This is the full content for article ' || i || '. ' || 
    repeat('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, vitae aliquam nisl nunc vitae nisl. ', 20) ||
    'End of article ' || i || '.',
    CASE WHEN i % 2 = 0 THEN 
        'Summary for article ' || i || ': ' || 
        'This article discusses important concepts related to ' || 
        CASE 
            WHEN i % 5 = 0 THEN 'productivity improvement techniques.'
            WHEN i % 5 = 1 THEN 'artificial intelligence advancements.'
            WHEN i % 5 = 2 THEN 'modern web development frameworks.'
            WHEN i % 5 = 3 THEN 'data science methodologies.'
            ELSE 'software engineering best practices.'
        END
    ELSE NULL END,
    CASE WHEN i % 3 = 0 THEN 'https://picsum.photos/id/' || (i % 1000) || '/300/200'
         ELSE NULL
    END,
    NOW() - (i || ' hours')::INTERVAL,
    CASE WHEN i % 10 = 0 THEN NOW() - (i || ' minutes')::INTERVAL
         ELSE NOW() - (i || ' hours')::INTERVAL
    END,
    (i % 20) + 1,
    (i % 100) * 10,
    (i % 1000) + 100,
    (i % 50) + 1,
    (random() * 10)::REAL
FROM generate_series(1, 500) i
CROSS JOIN (SELECT user_id FROM users ORDER BY random() LIMIT 1) u;

-- Comments (2000 comments)
INSERT INTO comments (content_id, owner_id, text, timestamp, last_edited_timestamp, like_count)
SELECT
    c.content_id,
    u.user_id,
    CASE 
        WHEN i % 5 = 0 THEN 'Great article! I really enjoyed reading this.'
        WHEN i % 5 = 1 THEN 'I have a question about this topic. Can you elaborate more?'
        WHEN i % 5 = 2 THEN 'I disagree with some points, but overall it was informative.'
        WHEN i % 5 = 3 THEN 'Thanks for sharing this information. Very helpful!'
        ELSE 'This is comment ' || i || '. ' || repeat('Comment text. ', i % 5 + 1)
    END,
    NOW() - ((i % 100) || ' minutes')::INTERVAL,
    NOW() - ((i % 100) || ' minutes')::INTERVAL,
    (i % 50)
FROM 
    generate_series(1, 2000) i
CROSS JOIN (SELECT content_id FROM content ORDER BY random() LIMIT 1) c
CROSS JOIN (SELECT user_id FROM users ORDER BY random() LIMIT 1) u;

-- Notifications (3000 notifications)
INSERT INTO notifications (user_id, sender_id, type, text_preview, content_id, comment_id, timestamp, is_read)
SELECT
    u1.user_id,
    u2.user_id,
    CASE 
        WHEN i % 6 = 0 THEN 'comment'
        WHEN i % 6 = 1 THEN 'like'
        WHEN i % 6 = 2 THEN 'share'
        WHEN i % 6 = 3 THEN 'follow'
        WHEN i % 6 = 4 THEN 'followedContent'
        ELSE 'followedShare'
    END,
    CASE 
        WHEN i % 6 = 0 THEN 'New comment on your article'
        WHEN i % 6 = 1 THEN 'Someone liked your article'
        WHEN i % 6 = 2 THEN 'Your article was shared'
        WHEN i % 6 = 3 THEN 'New follower'
        WHEN i % 6 = 4 THEN 'New content from someone you follow'
        ELSE 'Someone you follow shared an article'
    END,
    CASE WHEN i % 3 <> 0 THEN c.content_id ELSE NULL END,
    CASE WHEN i % 6 = 0 THEN cm.comment_id ELSE NULL END,
    NOW() - ((i % 1000) || ' minutes')::INTERVAL,
    CASE WHEN i % 3 = 0 THEN TRUE ELSE FALSE END
FROM 
    generate_series(1, 3000) i
CROSS JOIN (SELECT user_id FROM users ORDER BY random() LIMIT 1) u1
CROSS JOIN (SELECT user_id FROM users ORDER BY random() LIMIT 1) u2
LEFT JOIN (SELECT content_id FROM content ORDER BY random() LIMIT 1) c ON i % 3 <> 0
LEFT JOIN (SELECT comment_id FROM comments ORDER BY random() LIMIT 1) cm ON i % 6 = 0;

-- User Relationships (500 follows)
INSERT INTO user_relationships (follower_id, following_id, created_at)
SELECT DISTINCT
    u1.user_id AS follower_id,
    u2.user_id AS following_id,
    NOW() - ((ROW_NUMBER() OVER()) % 100 || ' hours')::INTERVAL AS created_at
FROM 
    users u1
CROSS JOIN 
    users u2
WHERE 
    u1.user_id <> u2.user_id
LIMIT 500;

-- Follow Requests (100 requests)
INSERT INTO follow_requests (requester_id, target_id, created_at)
SELECT DISTINCT
    u1.user_id AS requester_id,
    u2.user_id AS target_id,
    NOW() - ((ROW_NUMBER() OVER()) % 24 || ' hours')::INTERVAL AS created_at
FROM 
    users u1
CROSS JOIN 
    users u2
WHERE 
    u1.user_id <> u2.user_id
    AND u2.is_private = TRUE
    AND NOT EXISTS (
        SELECT 1 FROM user_relationships 
        WHERE follower_id = u1.user_id AND following_id = u2.user_id
    )
LIMIT 100;

-- User Content Interactions (3000 interactions)
INSERT INTO user_content_interactions (user_id, content_id, interaction_type, created_at)
SELECT DISTINCT
    u.user_id,
    c.content_id,
    CASE 
        WHEN i % 3 = 0 THEN 'like'
        WHEN i % 3 = 1 THEN 'bookmark'
        ELSE 'share'
    END,
    NOW() - ((i % 1000) || ' minutes')::INTERVAL
FROM 
    generate_series(1, 5000) i
CROSS JOIN (SELECT user_id FROM users ORDER BY random() LIMIT 1) u
CROSS JOIN (SELECT content_id FROM content ORDER BY random() LIMIT 1) c
LIMIT 3000
ON CONFLICT (user_id, content_id, interaction_type) DO NOTHING;

-- Pending Subscriptions (20 entries)
INSERT INTO pending_subscriptions (subscription_id, stripe_customer_id, status, created_at, period_start, period_end, canceled_at, updated_at, processed)
SELECT
    'sub_' || md5(random()::text),
    'cus_' || md5(random()::text),
    CASE 
        WHEN i % 5 = 0 THEN 'active'
        WHEN i % 5 = 1 THEN 'trialing'
        WHEN i % 5 = 2 THEN 'past_due'
        WHEN i % 5 = 3 THEN 'canceled'
        ELSE 'incomplete'
    END,
    NOW() - ((i % 30) || ' days')::INTERVAL,
    NOW() - ((i % 30) || ' days')::INTERVAL,
    NOW() + ((30 - (i % 30)) || ' days')::INTERVAL,
    CASE WHEN i % 5 = 3 THEN NOW() - ((i % 10) || ' days')::INTERVAL ELSE NULL END,
    NOW() - ((i % 10) || ' hours')::INTERVAL,
    CASE WHEN i % 2 = 0 THEN TRUE ELSE FALSE END
FROM generate_series(1, 20) i;

-- OAuth Connections (50 entries)
INSERT INTO oauth_connections (user_id, provider, provider_user_id, access_token, refresh_token, token_expires_at, created_at)
SELECT DISTINCT
    u.user_id,
    CASE WHEN i % 2 = 0 THEN 'google' ELSE 'github' END,
    md5(random()::text),
    md5(random()::text),
    md5(random()::text),
    NOW() + ((i % 30) || ' days')::INTERVAL,
    NOW() - ((i % 60) || ' days')::INTERVAL
FROM 
    generate_series(1, 100) i
CROSS JOIN (SELECT user_id FROM users ORDER BY random() LIMIT 1) u
LIMIT 50
ON CONFLICT (user_id, provider) DO NOTHING;

-- Password Reset Tokens (30 entries)
INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
SELECT
    u.user_id,
    md5(random()::text),
    CASE 
        WHEN i % 3 = 0 THEN NOW() - ((i % 10) || ' hours')::INTERVAL
        ELSE NOW() + ((i % 24) || ' hours')::INTERVAL
    END,
    CASE WHEN i % 3 = 0 THEN TRUE ELSE FALSE END
FROM 
    generate_series(1, 30) i
CROSS JOIN (SELECT user_id FROM users ORDER BY random() LIMIT 1) u;

-- Update content metrics based on interactions
UPDATE content c
SET 
    likes = (SELECT COUNT(*) FROM user_content_interactions WHERE content_id = c.content_id AND interaction_type = 'like'),
    shares = (SELECT COUNT(*) FROM user_content_interactions WHERE content_id = c.content_id AND interaction_type = 'share');

-- Update comment like counts
UPDATE comments c
SET 
    like_count = (SELECT (random() * 50)::INTEGER FROM generate_series(1, 1) LIMIT 1)
WHERE c.like_count = 0;