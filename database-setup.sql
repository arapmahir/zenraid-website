-- ZenRaid D1 Database Setup
-- Run this in Cloudflare D1 Console or via wrangler

-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed INTEGER DEFAULT 0,
    source TEXT DEFAULT 'website'
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS idx_subscribers_date ON subscribers(subscribed_at);

-- View all subscribers
-- SELECT * FROM subscribers ORDER BY subscribed_at DESC;

-- Get subscriber count
-- SELECT COUNT(*) as count FROM subscribers;

-- Export emails for newsletter
-- SELECT email FROM subscribers WHERE confirmed = 1 ORDER BY email;
