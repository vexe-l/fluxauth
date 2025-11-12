# 🚀 Deploy to Your Server

## Quick Deploy (One Command)

```bash
bash deploy-to-server.sh
```

When prompted for password, enter: `ranga123`

That's it! The script will:
1. ✅ Build the frontend
2. ✅ Package everything
3. ✅ Upload to your server
4. ✅ Install dependencies
5. ✅ Set up Nginx
6. ✅ Start backend with PM2
7. ✅ Configure everything

## After Deployment

Your app will be live at:
- **Frontend**: http://91.99.184.74
- **Backend API**: http://91.99.184.74/api/health

## Useful Commands

### Check if it's running:
```bash
ssh root@91.99.184.74 "pm2 status"
```

### View logs:
```bash
ssh root@91.99.184.74 "pm2 logs fluxauth-backend"
```

### Restart backend:
```bash
ssh root@91.99.184.74 "pm2 restart fluxauth-backend"
```

### Stop everything:
```bash
ssh root@91.99.184.74 "pm2 stop fluxauth-backend"
```

## Troubleshooting

**If deployment fails:**
```bash
# SSH into server manually
ssh root@91.99.184.74

# Check what went wrong
pm2 logs fluxauth-backend --lines 50
```

**If port 80 is already in use:**
```bash
ssh root@91.99.184.74 "netstat -tulpn | grep :80"
# Kill the process using port 80
```

**To redeploy:**
Just run the script again:
```bash
bash deploy-to-server.sh
```

## What Gets Deployed

- ✅ Backend API (Node.js + Express)
- ✅ Frontend (React build)
- ✅ Database (SQLite)
- ✅ Nginx (web server)
- ✅ PM2 (process manager)

## Security Notes

After deployment, you should:
1. Change the API key in `/var/www/fluxauth/backend/.env`
2. Set up SSL/HTTPS (use Let's Encrypt)
3. Configure firewall rules
4. Change the server password

## Need Help?

If something goes wrong, check:
1. Server logs: `ssh root@91.99.184.74 "pm2 logs"`
2. Nginx logs: `ssh root@91.99.184.74 "tail -f /var/log/nginx/error.log"`
3. Backend status: `ssh root@91.99.184.74 "pm2 status"`
