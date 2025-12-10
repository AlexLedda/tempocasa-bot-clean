# 🚀 Guida Deployment AWS - Tempocasa Bot

Guida completa per deployare l'applicazione Tempocasa Bot su AWS con architettura ibrida.

## 📋 Prerequisiti

1. **Account AWS** con credenziali configurate
2. **AWS CLI** installato e configurato
3. **Terraform** installato (v1.0+)
4. **Docker** installato
5. **Node.js** 18+ e npm

### Configurazione AWS CLI

```bash
# Installa AWS CLI (se non già installato)
brew install awscli  # macOS
# oppure: pip install awscli

# Configura credenziali
aws configure
# AWS Access Key ID: [your-key]
# AWS Secret Access Key: [your-secret]
# Default region: eu-central-1
# Default output format: json

# Verifica configurazione
aws sts get-caller-identity
```

### Installa Terraform

```bash
# macOS
brew install terraform

# Verifica installazione
terraform --version
```

---

## 🏗️ Architettura AWS

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (S3 + CloudFront)              │
│  - React App hosted on S3                                   │
│  - CloudFront CDN for global distribution                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (AWS App Runner)                   │
│  - FastAPI application                                      │
│  - Auto-scaling                                             │
│  - VPC connector for private resources                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────┬──────────────────┬──────────────────────┐
│  MongoDB Atlas   │  ElastiCache     │  Secrets Manager     │
│  (Existing)      │  (Redis)         │  (Credentials)       │
└──────────────────┴──────────────────┴──────────────────────┘
```

**Costi stimati mensili**: €20-45

---

## 📝 Step 1: Preparazione Secrets

Crea il file `terraform/terraform.tfvars` con i tuoi secrets:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Modifica `terraform.tfvars` con i tuoi valori reali:

```hcl
# AWS Configuration
aws_region  = "eu-central-1"
environment = "production"

# Frontend S3 Bucket (deve essere globalmente unico!)
frontend_bucket_name = "tempocasa-frontend-prod-12345"  # Cambia 12345

# MongoDB Atlas (il tuo connection string esistente)
mongo_url = "mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority"
db_name   = "tempocasa"

# JWT Secret (genera con: openssl rand -hex 32)
jwt_secret_key = "your-generated-secret-key"

# Cloudinary
cloudinary_cloud_name = "your-cloud-name"
cloudinary_api_key    = "your-api-key"
cloudinary_api_secret = "your-api-secret"

# OpenAI
openai_api_key = "sk-..."

# Twilio
twilio_account_sid     = "AC..."
twilio_auth_token      = "your-token"
twilio_whatsapp_number = "whatsapp:+..."

# Telegram
telegram_bot_token = "123456:ABC-DEF..."
```

> **⚠️ IMPORTANTE**: Non committare mai `terraform.tfvars` su git! È già nel `.gitignore`.

---

## 🚀 Step 2: Deploy Infrastruttura AWS

```bash
cd terraform

# Inizializza Terraform
terraform init

# Verifica il piano di deployment
terraform plan

# Applica le modifiche (crea tutta l'infrastruttura)
terraform apply
# Digita 'yes' quando richiesto

# Salva gli output (li userai dopo)
terraform output > ../aws-outputs.txt
```

Questo creerà:
- ✅ VPC con subnet pubbliche e private
- ✅ ElastiCache Redis cluster
- ✅ AWS Secrets Manager con tutte le credenziali
- ✅ S3 bucket per frontend
- ✅ CloudFront distribution
- ✅ IAM roles per App Runner
- ✅ VPC connector per App Runner

**Tempo stimato**: 10-15 minuti

---

## 🐳 Step 3: Deploy Backend (App Runner)

```bash
cd ..  # Torna alla root del progetto

# Esegui lo script di deployment
./scripts/deploy-backend-aws.sh
```

Lo script:
1. Crea repository ECR (Elastic Container Registry)
2. Builda l'immagine Docker del backend
3. Pusha l'immagine su ECR
4. Crea/aggiorna il servizio App Runner
5. Configura health checks e auto-scaling

**Tempo stimato**: 5-10 minuti

Al termine vedrai:
```
✅ Deployment complete!
🌐 Service URL: https://xxxxx.eu-central-1.awsapprunner.com
🏥 Health Check: https://xxxxx.eu-central-1.awsapprunner.com/api/health
```

Testa il backend:
```bash
# Ottieni l'URL del backend
BACKEND_URL=$(aws apprunner describe-service \
    --service-arn $(aws apprunner list-services --region eu-central-1 \
        --query "ServiceSummaryList[?ServiceName=='tempocasa-backend-service'].ServiceArn" \
        --output text) \
    --region eu-central-1 \
    --query 'Service.ServiceUrl' \
    --output text)

# Testa health check
curl https://${BACKEND_URL}/api/health
```

---

## 🌐 Step 4: Deploy Frontend (S3 + CloudFront)

```bash
# Esegui lo script di deployment
./scripts/deploy-frontend-aws.sh
```

Lo script:
1. Builda la React app con il backend URL corretto
2. Carica i file su S3
3. Invalida la cache CloudFront

**Tempo stimato**: 3-5 minuti

Al termine vedrai:
```
✅ Frontend deployment complete!
🌐 CloudFront URL: https://xxxxx.cloudfront.net
```

---

## ✅ Step 5: Verifica Deployment

### 1. Testa il Frontend

Apri il CloudFront URL nel browser:
```bash
# Ottieni l'URL
cd terraform
terraform output cloudfront_domain
```

### 2. Testa il Backend

```bash
# Health check
curl https://YOUR-BACKEND-URL/api/health

# Dovrebbe rispondere:
# {"status": "healthy", "timestamp": "..."}
```

### 3. Verifica Redis

Controlla i logs del backend:
```bash
aws logs tail /aws/apprunner/tempocasa-backend-service --follow --region eu-central-1
```

Cerca:
```
✓ Redis connected: redis://xxxxx.cache.amazonaws.com:6379
```

### 4. Test End-to-End

1. Apri il frontend
2. Fai login
3. Crea/modifica un immobile
4. Verifica upload immagini
5. Testa funzionalità bot

---

## 📊 Monitoring e Logs

### CloudWatch Logs

```bash
# Backend logs
aws logs tail /aws/apprunner/tempocasa-backend-service --follow --region eu-central-1

# Filtra errori
aws logs filter-pattern "ERROR" \
    --log-group-name /aws/apprunner/tempocasa-backend-service \
    --region eu-central-1
```

### Metriche App Runner

```bash
# Vai alla console AWS
open https://eu-central-1.console.aws.amazon.com/apprunner/home
```

### Metriche ElastiCache

```bash
# Vai alla console ElastiCache
open https://eu-central-1.console.aws.amazon.com/elasticache/home
```

---

## 🔄 Aggiornamenti Futuri

### Aggiornare il Backend

```bash
# Modifica il codice, poi:
./scripts/deploy-backend-aws.sh

# App Runner farà automaticamente rolling deployment
```

### Aggiornare il Frontend

```bash
# Modifica il codice, poi:
./scripts/deploy-frontend-aws.sh

# CloudFront cache verrà invalidata automaticamente
```

### Aggiornare l'Infrastruttura

```bash
cd terraform

# Modifica i file .tf, poi:
terraform plan
terraform apply
```

---

## 🗑️ Distruggere l'Infrastruttura

Se vuoi rimuovere tutto:

```bash
# 1. Elimina il servizio App Runner
aws apprunner delete-service \
    --service-arn $(aws apprunner list-services --region eu-central-1 \
        --query "ServiceSummaryList[?ServiceName=='tempocasa-backend-service'].ServiceArn" \
        --output text) \
    --region eu-central-1

# 2. Svuota il bucket S3
aws s3 rm s3://YOUR-BUCKET-NAME --recursive

# 3. Distruggi l'infrastruttura Terraform
cd terraform
terraform destroy
# Digita 'yes' quando richiesto
```

---

## 🐛 Troubleshooting

### Problema: "Bucket name already exists"

Il nome del bucket S3 deve essere globalmente unico. Modifica `frontend_bucket_name` in `terraform.tfvars`:

```hcl
frontend_bucket_name = "tempocasa-frontend-prod-YOUR-UNIQUE-ID"
```

### Problema: "Access Denied" su ECR

```bash
# Re-login a ECR
aws ecr get-login-password --region eu-central-1 | \
    docker login --username AWS --password-stdin \
    $(aws sts get-caller-identity --query Account --output text).dkr.ecr.eu-central-1.amazonaws.com
```

### Problema: Backend non si connette a Redis

Verifica che il VPC connector sia configurato correttamente:

```bash
cd terraform
terraform output vpc_connector_arn
```

### Problema: Frontend non carica

1. Verifica che il build sia andato a buon fine
2. Controlla CloudFront distribution status
3. Aspetta 5-10 minuti per la propagazione DNS

```bash
# Controlla status CloudFront
aws cloudfront get-distribution \
    --id $(cd terraform && terraform output -raw cloudfront_distribution_id) \
    --query 'Distribution.Status' \
    --output text
```

---

## 💰 Costi Stimati

| Servizio | Tipo | Costo/mese |
|----------|------|------------|
| ElastiCache Redis | t3.micro | ~€15 |
| App Runner | 1 vCPU, 2GB | ~€5-25* |
| S3 | Storage + requests | ~€1-2 |
| CloudFront | Data transfer | ~€1-3 |
| Secrets Manager | 1 secret | ~€0.40 |
| **TOTALE** | | **€22-45** |

*Dipende dal traffico e dalle ore di utilizzo

---

## 🎯 Prossimi Passi Consigliati

1. **Custom Domain**: Configura un dominio personalizzato per CloudFront
2. **SSL Certificate**: Usa AWS Certificate Manager per HTTPS
3. **CI/CD**: Configura GitHub Actions per deployment automatico
4. **Backup**: Configura backup automatici MongoDB Atlas
5. **Monitoring**: Configura CloudWatch Alarms per errori critici

---

## 📚 Risorse Utili

- [AWS App Runner Docs](https://docs.aws.amazon.com/apprunner/)
- [ElastiCache Redis Docs](https://docs.aws.amazon.com/elasticache/)
- [CloudFront Docs](https://docs.aws.amazon.com/cloudfront/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
