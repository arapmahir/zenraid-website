export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare(
      'INSERT INTO subscribers (email, ip_address, user_agent) VALUES (?, ?, ?)'
    ).bind(
      email,
      request.headers.get('CF-Connecting-IP'),
      request.headers.get('User-Agent')
    ).run();

    const count = await env.DB.prepare('SELECT COUNT(*) as count FROM subscribers').first();

    return new Response(JSON.stringify({ 
      success: true, 
      count: count?.count || 0 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    if (error.message?.includes('UNIQUE')) {
      return new Response(JSON.stringify({ error: 'Already subscribed' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet(context) {
  try {
    const count = await context.env.DB.prepare('SELECT COUNT(*) as count FROM subscribers').first();
    return new Response(JSON.stringify({ count: count?.count || 0 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ count: 0 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
