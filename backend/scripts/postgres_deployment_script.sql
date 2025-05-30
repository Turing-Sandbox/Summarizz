CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    profile_image VARCHAR(255),
    bio TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    location VARCHAR(255),
    website VARCHAR(255),
    is_private BOOLEAN DEFAULT FALSE,
    
    -- Subscription fields
    subscription_status VARCHAR(20) CHECK (subscription_status IN ('free', 'active', 'past_due', 'canceled', 'trialing', 'incomplete', 'incomplete_expired')) DEFAULT 'free',
    subscription_tier VARCHAR(10) CHECK (subscription_tier IN ('free', 'pro')) DEFAULT 'free',
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    subscription_period_start TIMESTAMP WITH TIME ZONE,
    subscription_period_end TIMESTAMP WITH TIME ZONE,
    subscription_canceled_at TIMESTAMP WITH TIME ZONE,
    grace_period_end TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_users_stripe_subscription_id ON users(stripe_subscription_id);

CREATE TABLE content (
    content_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    thumbnail VARCHAR(255),
    date_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_time INTEGER,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    score REAL
);

CREATE INDEX idx_content_creator_id ON content(creator_id);
CREATE INDEX idx_content_date_created ON content(date_created);

CREATE TABLE comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES content(content_id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_edited_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    like_count INTEGER DEFAULT 0
);

CREATE INDEX idx_comments_content_id ON comments(content_id);
CREATE INDEX idx_comments_owner_id ON comments(owner_id);


CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('comment', 'like', 'share', 'follow', 'followedContent', 'followedShare')),
    text_preview VARCHAR(255),
    content_id UUID REFERENCES content(content_id) ON DELETE SET NULL,
    comment_id UUID REFERENCES comments(comment_id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_timestamp ON notifications(timestamp);


CREATE TABLE user_relationships (
    id SERIAL PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (follower_id, following_id)
);

CREATE INDEX idx_user_relationships_follower ON user_relationships(follower_id);
CREATE INDEX idx_user_relationships_following ON user_relationships(following_id);


CREATE TABLE follow_requests (
    id SERIAL PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (requester_id, target_id)
);

CREATE INDEX idx_follow_requests_requester ON follow_requests(requester_id);
CREATE INDEX idx_follow_requests_target ON follow_requests(target_id);


CREATE TABLE user_content_interactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(content_id) ON DELETE CASCADE,
    interaction_type VARCHAR(10) NOT NULL CHECK (interaction_type IN ('like', 'bookmark', 'share')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, content_id, interaction_type)
);

CREATE INDEX idx_user_content_interactions_combined ON user_content_interactions(user_id, content_id);
CREATE INDEX idx_user_content_interactions_type ON user_content_interactions(interaction_type);


CREATE TABLE pending_subscriptions (
    subscription_id VARCHAR(100) PRIMARY KEY,
    stripe_customer_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete', 'incomplete_expired')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    processed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_pending_subscriptions_customer_id ON pending_subscriptions(stripe_customer_id);
CREATE INDEX idx_pending_subscriptions_processed ON pending_subscriptions(processed);


CREATE TABLE oauth_connections (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'github')),
    provider_user_id VARCHAR(255) NOT NULL,
    access_token VARCHAR(255),
    refresh_token VARCHAR(255),
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, provider),
    UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_oauth_connections_user_id ON oauth_connections(user_id);


CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);