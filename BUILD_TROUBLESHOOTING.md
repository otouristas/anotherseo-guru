# 🔧 Build Troubleshooting Guide

## 🚨 Common Netlify Build Issues & Solutions

### Issue 1: Build Script Returns Non-Zero Exit Code

**Symptoms:**
- Build fails during "building site" stage
- Exit code 1 or similar error codes

**Solutions Applied:**
✅ **Fixed Vite Configuration:**
- Changed from `terser` to `esbuild` minification for better Netlify compatibility
- Simplified manual chunks to avoid build conflicts
- Removed problematic hardcoded environment variables
- Set target to `es2020` instead of `esnext`

✅ **Fixed Netlify Configuration:**
- Updated build command to `npm ci && npm run build`
- Added Node.js memory optimization: `NODE_OPTIONS="--max-old-space-size=4096"`
- Removed problematic conditional redirects
- Simplified build plugins (commented out potentially problematic ones)

✅ **Fixed Package.json:**
- Updated build script to use production mode explicitly
- Ensured all required dependencies are present

### Issue 2: Missing Dependencies

**Check Required Dependencies:**
```bash
npm install --save-dev @types/node
npm install --save-dev typescript
npm install --save-dev @vitejs/plugin-react-swc
```

### Issue 3: TypeScript Errors

**Common Fixes:**
- Ensure all imports are correctly typed
- Check for missing type definitions
- Verify `tsconfig.json` configuration

### Issue 4: Environment Variables

**Setup Required:**
1. Create `.env` file with required variables
2. Set environment variables in Netlify dashboard
3. Ensure all `VITE_` prefixed variables are properly configured

### Issue 5: Memory Issues

**Solutions Applied:**
- Added `NODE_OPTIONS="--max-old-space-size=4096"` to build environment
- Optimized Vite build configuration
- Simplified chunk splitting

## 🔍 Debugging Steps

### Step 1: Test Build Locally
```bash
npm ci
npm run build
```

### Step 2: Check Build Logs
Look for specific error messages in Netlify build logs:
- Missing dependencies
- TypeScript errors
- Import/export issues
- Environment variable problems

### Step 3: Verify Configuration Files
- `package.json` - dependencies and scripts
- `vite.config.ts` - build configuration
- `netlify.toml` - deployment settings
- `tsconfig.json` - TypeScript configuration

### Step 4: Environment Variables
Ensure these are set in Netlify:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_DATAFORSEO_LOGIN
VITE_DATAFORSEO_PASSWORD
VITE_STRIPE_PUBLISHABLE_KEY
```

## 🚀 Build Optimization Applied

### Vite Configuration Changes:
```typescript
// Before (problematic)
build: {
  target: 'esnext',
  minify: 'terser',
  sourcemap: mode === 'development',
  // Complex terser options
}

// After (optimized)
build: {
  target: 'es2020',
  minify: 'esbuild', // Better Netlify compatibility
  sourcemap: false, // Disable for production
  // Simplified configuration
}
```

### Netlify Configuration Changes:
```toml
# Before
command = "npm run build"

# After
command = "npm ci && npm run build"

[build.environment]
NODE_OPTIONS = "--max-old-space-size=4096"
```

## 🎯 Next Steps

1. **Push Changes:** Use the updated configuration files
2. **Monitor Build:** Check Netlify build logs for any remaining issues
3. **Test Deployment:** Verify the deployed site works correctly
4. **Environment Variables:** Set up production environment variables in Netlify dashboard

## 📞 Support

If build issues persist:
1. Check Netlify build logs for specific error messages
2. Test build locally with `npm run build`
3. Verify all dependencies are properly installed
4. Ensure environment variables are correctly set

## 🔧 Quick Fixes Applied

- ✅ Simplified Vite build configuration
- ✅ Optimized Netlify build settings
- ✅ Added memory optimization
- ✅ Removed problematic redirects and plugins
- ✅ Fixed package.json build scripts
- ✅ Created build test script
