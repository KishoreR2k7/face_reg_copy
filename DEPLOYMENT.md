# Face Recognition System - Deployment Guide

## 🚀 Deployment Options

### 1️⃣ Local Network Deployment (Simplest)

**Best for:** Internal office/school network

**Steps:**

1. **Get your server IP:**
   ```powershell
   ipconfig
   ```
   Note the IPv4 address (e.g., 192.168.1.100)

2. **Update Backend CORS (allow network access):**
   Edit `src/api_backend.py`:
   ```python
   # Change line 12 from:
   CORS(app)
   # To:
   CORS(app, origins=["*"])
   ```

3. **Update Frontend API URL:**
   Edit `ui/services/api.ts`:
   ```typescript
   // Change line 3 from:
   const BASE_URL = 'http://127.0.0.1:5000';
   // To:
   const BASE_URL = 'http://YOUR_SERVER_IP:5000';
   ```

4. **Build Frontend:**
   ```cmd
   cd ui
   npm run build
   ```

5. **Run on server:**
   ```cmd
   RUN_ALL_CMD.bat
   ```

6. **Access from network:**
   - Users open: `http://YOUR_SERVER_IP:5173`
   - Login with credentials from `.env`

**Firewall Settings:**
- Allow ports 5000 and 5173 on Windows Firewall

---

### 2️⃣ Docker Deployment (Recommended)

**Best for:** Portable, consistent deployment across systems

**Prerequisites:**
- Install Docker Desktop: https://www.docker.com/products/docker-desktop

**Steps:**

1. **Build and run:**
   ```powershell
   docker-compose up -d
   ```

2. **Access:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

3. **Stop:**
   ```powershell
   docker-compose down
   ```

4. **View logs:**
   ```powershell
   docker-compose logs -f
   ```

**Production Docker:**
For production, update `docker-compose.yml`:
```yaml
    environment:
      - FLASK_ENV=production
      - DEBUG=False
```

---

### 3️⃣ Cloud Deployment

#### Option A: AWS EC2

1. **Launch EC2 Instance:**
   - Ubuntu 22.04 LTS
   - t3.medium or larger (for face recognition)
   - Open ports: 22, 80, 443, 5000, 5173

2. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install python3-pip nodejs npm git
   ```

3. **Clone and setup:**
   ```bash
   git clone https://github.com/Thiyanesh07/Face-Recognition-Project.git
   cd Face-Recognition-Project
   pip install -r requirements.txt
   cd ui && npm install && npm run build
   ```

4. **Use PM2 for process management:**
   ```bash
   sudo npm install -g pm2
   pm2 start src/api_backend.py --name backend --interpreter python3
   pm2 start "npm run dev" --name frontend
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx reverse proxy:**
   ```bash
   sudo apt install nginx
   ```
   Create `/etc/nginx/sites-available/face-recognition`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5173;
       }

       location /api {
           proxy_pass http://localhost:5000;
       }
   }
   ```

#### Option B: Azure App Service

1. Create Web App (Python 3.11)
2. Deploy backend via GitHub Actions
3. Create Static Web App for frontend
4. Configure CORS and environment variables

#### Option C: Google Cloud Run

1. Build container images
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Configure networking and secrets

---

### 4️⃣ Production Checklist

**Security:**
- [ ] Change SECRET_KEY in `.env` to strong random value
- [ ] Change all default passwords
- [ ] Enable HTTPS (use Let's Encrypt)
- [ ] Implement rate limiting
- [ ] Add IP whitelisting if needed
- [ ] Set up proper CORS origins (not "*")
- [ ] Use environment variables, not `.env` file

**Performance:**
- [ ] Use production WSGI server (Gunicorn/uWSGI instead of Flask dev server)
- [ ] Enable frontend build optimization
- [ ] Set up CDN for static assets
- [ ] Configure caching
- [ ] Use PostgreSQL instead of SQLite for multi-user

**Monitoring:**
- [ ] Set up logging (CloudWatch, Azure Monitor, etc.)
- [ ] Configure alerts for errors
- [ ] Monitor disk space (for attendance logs)
- [ ] Track API response times

**Backup:**
- [ ] Automated database backups
- [ ] Backup embeddings and models
- [ ] Version control for configurations

---

### 5️⃣ Production Configuration

**Backend Production Setup:**

Create `wsgi.py`:
```python
from src.api_backend import app

if __name__ == "__main__":
    app.run()
```

Use Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
```

**Frontend Production Build:**
```bash
cd ui
npm run build
npm install -g serve
serve -s dist -l 5173
```

---

### 6️⃣ Environment Variables for Production

Create `.env.production`:
```env
# Strong secret key (generate with: python -c "import secrets; print(secrets.token_hex(32))")
SECRET_KEY=your_very_long_random_secret_key_here

# Database (use PostgreSQL in production)
DATABASE_URL=postgresql://user:password@localhost/face_recognition

# Email credentials (use secrets manager in cloud)
EMAIL1=admin@yourdomain.com
PWD1=strong_password_1

# Flask environment
FLASK_ENV=production
DEBUG=False

# CORS settings
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

### 7️⃣ Scalability Considerations

**For > 100 users:**
- Use Redis for session management
- Load balancer for multiple backend instances
- Separate face recognition processing to worker queue
- Use cloud storage (S3/Azure Blob) for attendance logs

**For > 1000 faces:**
- Optimize FAISS index (GPU acceleration)
- Use vector database (Pinecone, Weaviate)
- Cache frequently accessed embeddings

---

## 🎯 Quick Deployment Comparison

| Method | Ease | Cost | Scalability | Best For |
|--------|------|------|-------------|----------|
| Local Network | ⭐⭐⭐⭐⭐ | Free | Low | Small office/school |
| Docker | ⭐⭐⭐⭐ | Free | Medium | Development/testing |
| AWS/Azure/GCP | ⭐⭐⭐ | $$$ | High | Production |
| Dedicated Server | ⭐⭐⭐ | $$ | Medium | Medium business |

---

## 🔧 Common Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Database locked:**
- Use PostgreSQL instead of SQLite
- Or ensure only one backend instance

**Face recognition slow:**
- Use GPU (CUDA)
- Reduce image resolution in config.yaml
- Skip frames (process every 3rd frame)

---

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs` or terminal output
2. Verify environment variables are set
3. Ensure ports are not blocked by firewall
4. Check network connectivity between services

---

**Recommended for production: Docker deployment with Nginx reverse proxy and SSL certificate**
