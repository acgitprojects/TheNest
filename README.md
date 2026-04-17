# TheNest

## SSH / Deployment

```bash
# Connect to server
ssh thenest

# Deploy (build + push + restart)
npm run deploy
```

- **Server**: 43.156.235.198 (`thenest` alias in `~/.ssh/config`)
- **App path**: `/var/www/thenest`
- **Domain**: https://thenest.upnx.asia
- **Process**: pm2 under `ubuntu` user, process name `thenest`