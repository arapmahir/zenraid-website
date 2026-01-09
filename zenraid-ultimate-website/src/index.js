/**
 * ZenRaid Cloudflare Worker
 * Handles email subscriptions with D1 Database
 */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
        // Handle API routes
        if (url.pathname.startsWith('/api/')) {
            return handleAPI(request, env, url);
        }
        
        // Serve static assets for all other requests
        return env.ASSETS.fetch(request);
    }
};

async function handleAPI(request, env, url) {
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // Route handling
    switch (url.pathname) {
        case '/api/subscribe':
            if (request.method === 'POST') {
                return handleSubscribe(request, env, corsHeaders);
            }
            break;
            
        case '/api/subscribers/count':
            if (request.method === 'GET') {
                return handleGetCount(env, corsHeaders);
            }
            break;
            
        case '/api/subscribers':
            if (request.method === 'GET') {
                return handleGetSubscribers(env, corsHeaders);
            }
            break;
    }

    return new Response(
        JSON.stringify({ error: 'Not Found' }),
        { status: 404, headers: corsHeaders }
    );
}

/**
 * Handle email subscription
 */
async function handleSubscribe(request, env, headers) {
    try {
        const { email } = await request.json();
        
        // Validate email
        if (!email || !isValidEmail(email)) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    message: 'Please enter a valid email address.' 
                }),
                { status: 400, headers }
            );
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        
        // Get IP address for rate limiting (optional)
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        
        // Get user agent for analytics (optional)
        const userAgent = request.headers.get('User-Agent') || 'unknown';
        
        // Check if email already exists
        const existing = await env.DB.prepare(
            'SELECT email FROM subscribers WHERE email = ?'
        ).bind(normalizedEmail).first();
        
        if (existing) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    message: 'This email is already subscribed!' 
                }),
                { status: 400, headers }
            );
        }

        // Insert into database
        await env.DB.prepare(
            `INSERT INTO subscribers (email, ip_address, user_agent, subscribed_at) 
             VALUES (?, ?, ?, datetime('now'))`
        ).bind(normalizedEmail, ip, userAgent).run();

        // Get updated count
        const countResult = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM subscribers'
        ).first();

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: "You're on the list! Watch your inbox for updates.",
                count: countResult?.count || 0
            }),
            { status: 200, headers }
        );

    } catch (error) {
        console.error('Subscribe error:', error);
        
        // Check for unique constraint violation
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    message: 'This email is already subscribed!' 
                }),
                { status: 400, headers }
            );
        }

        return new Response(
            JSON.stringify({ 
                success: false, 
                message: 'Something went wrong. Please try again later.' 
            }),
            { status: 500, headers }
        );
    }
}

/**
 * Get subscriber count
 */
async function handleGetCount(env, headers) {
    try {
        const result = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM subscribers'
        ).first();

        return new Response(
            JSON.stringify({ 
                success: true, 
                count: result?.count || 0 
            }),
            { status: 200, headers }
        );

    } catch (error) {
        console.error('Count error:', error);
        return new Response(
            JSON.stringify({ 
                success: false, 
                count: 0 
            }),
            { status: 500, headers }
        );
    }
}

/**
 * Get all subscribers (admin endpoint - you might want to add authentication)
 */
async function handleGetSubscribers(env, headers) {
    try {
        // Optional: Add authentication check here
        // const authHeader = request.headers.get('Authorization');
        // if (!isValidAuth(authHeader)) { return unauthorized response }
        
        const result = await env.DB.prepare(
            'SELECT email, subscribed_at FROM subscribers ORDER BY subscribed_at DESC LIMIT 1000'
        ).all();

        return new Response(
            JSON.stringify({ 
                success: true, 
                subscribers: result.results || [],
                count: result.results?.length || 0
            }),
            { status: 200, headers }
        );

    } catch (error) {
        console.error('Get subscribers error:', error);
        return new Response(
            JSON.stringify({ 
                success: false, 
                subscribers: [],
                count: 0
            }),
            { status: 500, headers }
        );
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
