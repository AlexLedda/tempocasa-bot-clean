# WhatsApp Real Estate Bot - Railway Deployment (Twilio)

## 🚀 Quick Deploy to Railway

### 1. Prepare Files for Deployment

All files in this `/app/railway-deploy/` directory are ready to deploy:
- `whatsapp-twilio.js` - Main bot service using Twilio API
- `package.json` - Node.js dependencies
- `Dockerfile` - Container configuration (optional, Railway can use Nixpacks)
- `.env.example` - Environment variables template

### 2. Deploy to Railway

#### Option A: GitHub Deploy (Recommended)
1. Create a new repository on GitHub
2. Push this `railway-deploy` folder contents to the repository
3. Go to [Railway.app](https://railway.app)
4. Click "New Project" → "Deploy from GitHub repo"
5. Select your repository
6. Railway will automatically detect and deploy

#### Option B: Railway CLI Deploy
```bash
cd /app/railway-deploy
npm install -g @railway/cli
railway login
railway init
railway up
```

### 3. Configure Environment Variables on Railway

Go to your Railway project → Variables tab and add:

```
TWILIO_ACCOUNT_SID=AC...your_account_sid
TWILIO_AUTH_TOKEN=...your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
FASTAPI_URL=https://your-backend-url.com
PORT=3000
```

**Important Notes:**
- `TWILIO_WHATSAPP_NUMBER`: Use format `whatsapp:+14155238886` (Twilio Sandbox number or your registered number)
- `FASTAPI_URL`: Your FastAPI backend URL (without /api, will be added in code)
- Railway automatically sets `PORT` but you can override it

### 4. Get Your Railway Deployment URL

After deployment, Railway will give you a URL like:
```
https://your-app-name.up.railway.app
```

### 5. Configure Twilio Webhook

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to: Messaging → Try it out → Send a WhatsApp message
3. Click on "Sandbox settings"
4. Set "When a message comes in" to:
   ```
   https://your-app-name.up.railway.app/webhook
   ```
5. Method: HTTP POST
6. Save configuration

### 6. Test Your Bot

1. Send a WhatsApp message to your Twilio number (Sandbox: +1 415 523 8886)
2. First message: Join your sandbox with code (e.g., "join <your-code>")
3. Send any test message
4. Check Railway logs for activity

### 7. Verify Deployment

Check these endpoints:
- **Health Check**: `https://your-app-name.up.railway.app/`
- **Expected Response**: 
  ```json
  {
    "status": "active",
    "service": "WhatsApp Bot Twilio",
    "timestamp": "2024-11-08T12:00:00.000Z"
  }
  ```

## 🔍 Troubleshooting

### Check Railway Logs
```bash
railway logs
```
Or view in Railway Dashboard → Deployments → Logs

### Common Issues

**1. 502 Bad Gateway**
- Check if `PORT` environment variable is set
- Verify app is binding to `0.0.0.0` not `localhost`
- Check Railway logs for startup errors

**2. Twilio Webhook Errors**
- Verify webhook URL is correct and accessible
- Check TWILIO credentials are correct
- Ensure FASTAPI_URL is reachable from Railway

**3. Backend Connection Failed**
- Verify FASTAPI_URL is correct
- Check backend `/api/whatsapp/webhook` endpoint exists
- Test backend endpoint independently

### Test Backend Endpoint
```bash
curl -X POST https://your-backend-url.com/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+1234567890","message":"test","timestamp":"2024-11-08T12:00:00Z"}'
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | `AC...` (32 chars) |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `...` (32 chars) |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp Number | `whatsapp:+14155238886` |
| `FASTAPI_URL` | Backend API URL | `https://api.example.com` |
| `PORT` | Server port (auto-set by Railway) | `3000` |

## 🔄 Update Deployment

To update your bot:
1. Make changes to code locally
2. Commit and push to GitHub
3. Railway will automatically redeploy

Or using CLI:
```bash
railway up
```

## 📊 Monitoring

- View logs: Railway Dashboard → Deployments → Logs
- Monitor requests: Check Railway metrics
- WhatsApp messages: Twilio Console → Logs

## 🆘 Support

If issues persist:
1. Check Railway build logs
2. Verify all environment variables
3. Test Twilio webhook with Postman
4. Check FastAPI backend is responding

---

**Last Updated**: November 2024
**Service**: Twilio WhatsApp API
**Platform**: Railway.app
