# 🚨 CRITICAL: DNS Hijacking Detected

## Problem

Your ISP (likely Indonesian provider) is hijacking Bybit's DNS and redirecting it to:
- **Fake domain**: `api.bybit.com.co.id`
- **Fake IP**: `185.192.124.198`

This is preventing the bot from connecting to the real Bybit API.

## Solutions (Try in order)

### Solution 1: Use VPN (RECOMMENDED)

**Recommended VPN locations:**
- Singapore
- Hong Kong
- United States
- Japan

**Free VPNs that work:**
- ProtonVPN (free tier available)
- Windscribe (10GB/month free)
- Cloudflare WARP (free)

**After connecting to VPN:**
```bash
npm run start:live
```

---

### Solution 2: Change System DNS (If no VPN)

**Windows:**

1. Open Control Panel → Network and Sharing Center
2. Click your network connection → Properties
3. Select "Internet Protocol Version 4 (TCP/IPv4)" → Properties
4. Select "Use the following DNS server addresses":
   - Preferred: `1.1.1.1` (Cloudflare)
   - Alternate: `8.8.8.8` (Google)
5. Click OK

**After changing DNS:**
```bash
ipconfig /flushdns
npm run start:live
```

---

### Solution 3: Edit Windows Hosts File (Quick Fix)

**Add this line to: `C:\Windows\System32\drivers\etc\hosts`**

```
103.144.182.26  api.bybit.com
103.144.182.26  stream.bybit.com
```

**Requires Administrator** - Right-click Notepad → Run as Administrator → Open the hosts file.

**After editing hosts:**
```bash
ipconfig /flushdns
npm run start:live
```

---

### Solution 4: Use Proxy Server

If you have access to a proxy server (SOCKS5 or HTTP proxy):

1. Edit `.env` and add:
```env
PROXY_HOST=your-proxy-host
PROXY_PORT=your-proxy-port
```

2. I'll need to modify the bot code to use the proxy.

---

## How to Verify It's Fixed

Run this test:
```bash
nslookup api.bybit.com 8.8.8.8
```

**Should show:**
- IP in 103.x.x.x range (Singapore)
- **NOT** `185.192.124.198`
- **NOT** ending in `.co.id`

---

## Why This Happens

Indonesian ISPs (like Telkom, Indihome, etc.) sometimes:
- Block cryptocurrency exchange domains
- Redirect DNS to fake servers
- Implement DNS filtering for "protection"

**This is legal in Indonesia** but prevents crypto trading.

---

## Current Status

❌ Cannot connect to Bybit API
❌ DNS hijacked to fake server
❌ Trading bot cannot operate

**Action Required**: Implement one of the solutions above before starting the bot.

---

## After Fixing

Once DNS is working correctly, run:
```bash
npm run start:live
```

The bot will connect successfully and start trading.
