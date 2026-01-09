# ZenRaid Ultimate Website

🔫💧 **Tactical Water Combat Gaming Platform**

A stunning, futuristic website for ZenRaid - the world's first IoT-powered tactical water combat gaming system.

## 🌟 Features

### Website Features
- **Responsive Design** - Perfect on all devices
- **Animated Backgrounds** - Particle effects and grid animations
- **Smooth Animations** - Intersection observer-based fade-ins
- **Mobile Menu** - Fully accessible hamburger menu
- **SEO Optimized** - Schema.org markup, Open Graph, Twitter Cards
- **PWA Ready** - Web manifest for app-like experience
- **Accessible** - ARIA labels, keyboard navigation, skip links

### Pages
- **index.html** - Main landing page with:
  - Hero section with floating product image
  - Stats bar with animated counters
  - Products showcase with tilt effects
  - Features grid
  - How to Play timeline
  - Rank system preview
  - Team/About section
  - Newsletter signup with D1 integration

- **ranks.html** - Full rank system page with:
  - All 14 ranks across 5 tiers
  - Visual rank pyramid
  - Detailed rank cards with features
  - Benefits section

### Backend (Cloudflare)
- **D1 Database** - Email subscriber storage
- **Worker** - API endpoints for subscription
- **Edge Deployment** - Fast global delivery

## 📁 File Structure

```
zenraid-ultimate/
├── index.html              # Main landing page
├── ranks.html              # Full ranks page
├── styles.css              # All CSS styles (unified)
├── script.js               # JavaScript functionality
├── wrangler.json           # Cloudflare configuration
├── site.webmanifest        # PWA manifest
├── src/
│   └── index.js            # Cloudflare Worker code
├── assets/
│   ├── zenraid_logo.png
│   ├── zenraid_logo_and_text.png
│   ├── zenraid_SMG_model.png
│   ├── zenraid_pistol_model.png
│   ├── zenraid_long_barrel_assult_riffle_model.png
│   ├── zenraid_smart_vest_and_wristband.png
│   ├── zenraid_smart_vest_another_example.png
│   ├── zenraid_team.png
│   └── zenraid_vest_and_handwrist.png
└── favicon files...
```

## 🚀 Deployment

### Option 1: Cloudflare Pages (Static Only)

1. Push to GitHub
2. Connect to Cloudflare Pages
3. Build settings:
   - Framework preset: None
   - Build command: (leave blank)
   - Output directory: (leave blank)

### Option 2: Cloudflare Workers (With D1 Database)

1. **Create D1 Database:**
   ```bash
   wrangler d1 create zenraid-subscribers
   ```

2. **Update wrangler.json** with your database ID

3. **Create the subscribers table:**
   ```sql
   CREATE TABLE subscribers (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       email TEXT UNIQUE NOT NULL,
       ip_address TEXT,
       user_agent TEXT,
       subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       confirmed INTEGER DEFAULT 0
   );
   ```
   
   Run in D1 Console or:
   ```bash
   wrangler d1 execute zenraid-subscribers --command="CREATE TABLE..."
   ```

4. **Deploy:**
   ```bash
   wrangler deploy
   ```

## 🎨 Design System

### Colors
- Primary: `#00E5FF` (Cyan)
- Background: `#0A0A0F` (Near black)
- Card: `#12121A`
- Text Primary: `#FFFFFF`
- Text Secondary: `#A0A0B0`

### Rank Tier Colors
- Tier 5 (Executive): `#FFD700` (Gold)
- Tier 4 (Senior): `#B366FF` (Purple)
- Tier 3 (Field): `#0096FF` (Blue)
- Tier 2 (Junior): `#00FF88` (Green)
- Tier 1 (Entry): `#888888` (Gray)

### Typography
- Display: Orbitron (futuristic)
- Body: Rajdhani (gaming)
- Accent: Exo 2

## 📧 API Endpoints

### POST /api/subscribe
Subscribe an email address.

**Request:**
```json
{
    "email": "user@example.com"
}
```

**Response:**
```json
{
    "success": true,
    "message": "You're on the list!",
    "count": 42
}
```

### GET /api/subscribers/count
Get total subscriber count.

**Response:**
```json
{
    "success": true,
    "count": 42
}
```

### GET /api/subscribers
Get all subscribers (admin use).

**Response:**
```json
{
    "success": true,
    "subscribers": [
        {"email": "user@example.com", "subscribed_at": "2025-01-08T12:00:00Z"}
    ],
    "count": 42
}
```

## 🔧 Development

### Local Preview
```bash
# Install wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Start local dev server
wrangler dev
```

### Making Changes

1. **CSS**: Edit `styles.css` - all styles in one file
2. **JavaScript**: Edit `script.js` - all client-side code
3. **Worker**: Edit `src/index.js` - API endpoints
4. **Content**: Edit HTML files directly

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

## 📄 License

© 2025 ZenRaid OÜ. All rights reserved.

---

**Ready to join the Raid?** 🎯💧🔫
