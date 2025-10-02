git s# 🔧 Environment Variables Setup Guide

## 📋 Quick Setup Instructions

1. **Create `.env` file** in your project root
2. **Copy contents** from `environment-config.txt`
3. **Replace placeholder values** with your actual API keys
4. **Never commit** the `.env` file to Git (it's already in `.gitignore`)

## 🔑 Required API Keys & Services

### 1. **Supabase** (Database & Auth)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```
**How to get:**
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Go to Settings → API
- Copy Project URL and anon public key

### 2. **DataForSEO** (SEO Data)
```env
VITE_DATAFORSEO_LOGIN=your_username
VITE_DATAFORSEO_PASSWORD=your_password
```
**How to get:**
- Go to [dataforseo.com](https://dataforseo.com)
- Sign up for an account
- Get your login credentials

### 3. **Stripe** (Payments)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
**How to get:**
- Go to [stripe.com](https://stripe.com)
- Create account → Dashboard
- Copy publishable key (test mode for development)

### 4. **Google Analytics 4**
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```
**How to get:**
- Go to [analytics.google.com](https://analytics.google.com)
- Create GA4 property
- Copy Measurement ID

### 5. **Google OAuth** (Search Console & Analytics)
```env
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CLIENT_SECRET=your_client_secret
```
**How to get:**
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create project → APIs & Services → Credentials
- Create OAuth 2.0 Client ID
- Add authorized redirect URIs

### 6. **AI Services** (Choose one or more)

#### Lovable AI Gateway (Recommended)
```env
VITE_LOVABLE_API_KEY=your_lovable_key
```
**How to get:**
- Contact Lovable support for API access

#### OpenAI (Alternative)
```env
VITE_OPENAI_API_KEY=sk-...
```
**How to get:**
- Go to [platform.openai.com](https://platform.openai.com)
- Create account → API Keys

#### Anthropic Claude (Alternative)
```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
```
**How to get:**
- Go to [console.anthropic.com](https://console.anthropic.com)
- Create account → API Keys

#### Google Gemini (Alternative)
```env
VITE_GOOGLE_AI_API_KEY=your_gemini_key
```
**How to get:**
- Go to [Google AI Studio](https://aistudio.google.com)
- Create API key

### 7. **Sentry** (Error Monitoring - Optional)
```env
VITE_SENTRY_DSN=https://...
```
**How to get:**
- Go to [sentry.io](https://sentry.io)
- Create project → Settings → DSN

## 🚀 Quick Start (Minimal Setup)

For basic functionality, you only need:

```env
# Essential
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_DATAFORSEO_LOGIN=your_login
VITE_DATAFORSEO_PASSWORD=your_password

# Optional but recommended
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_GA_MEASUREMENT_ID=your_ga_id
VITE_LOVABLE_API_KEY=your_ai_key
```

## 🔒 Security Best Practices

1. **Never commit** `.env` to Git
2. **Use different keys** for development/production
3. **Rotate keys** regularly
4. **Limit permissions** to minimum required
5. **Monitor usage** and costs

## 🧪 Testing Your Setup

After setting up your `.env` file:

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Check browser console** for any missing environment variable errors

3. **Test key features:**
   - User authentication (Supabase)
   - SEO data fetching (DataForSEO)
   - AI features (if configured)

## 🚨 Troubleshooting

### Common Issues:

1. **"Environment variable not found"**
   - Check `.env` file is in project root
   - Restart development server after changes
   - Ensure variable names start with `VITE_`

2. **API key not working**
   - Verify key is correct (no extra spaces)
   - Check API key permissions
   - Ensure billing is set up (if required)

3. **CORS errors**
   - Add your domain to API provider's allowed origins
   - Check if using HTTPS in production

## 📞 Support

If you need help with any API setup:
- Check provider documentation
- Contact their support teams
- Review our error logs in browser console

## 🔄 Environment File Template

Copy the contents from `environment-config.txt` to create your `.env` file, then replace all placeholder values with your actual API keys.
