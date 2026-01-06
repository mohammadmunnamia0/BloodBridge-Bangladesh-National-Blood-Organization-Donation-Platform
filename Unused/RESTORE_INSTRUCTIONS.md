# Unused Files - Restore Instructions

This folder contains files that were identified as unused in the BloodBridge Foundation project on January 6, 2026.

## 📁 Moved Files

### Client Side - Components
- `client/src/App.jsx` → Not imported in main.jsx (Routes.jsx is used instead)
- `client/src/Components/Navbar.jsx` → Unused (Shared/Navbar.jsx is the active one)
- `client/src/Components/PendingHospitals.jsx` → Never imported anywhere (207 lines)
- `client/src/Components/PendingOrganizations.jsx` → Never imported anywhere (197 lines)

### Client Side - Utilities & Context
- `client/src/Utlity/LocalStorage.js` → Empty file, never imported
- `client/src/context/AuthContext.jsx` → Empty placeholder component, never used

### Client Side - Assets
**From `client/src/assets/`:**
- `404.jpg` - Not referenced in any component
- `memory.jpg` - Not referenced in any component
- `memory.png` - Not referenced in any component
- `react.svg` - Not referenced in any component
- `wave.svg` - Not referenced in any component

**From `client/public/`:**
- `Hero/hero.jpg` - Commented out in Hero.jsx
- `Hero/hero1.jpg` - Commented out in Hero.jsx
- `logo.png` - Not referenced in any component
- `Project Showcase/` - Documentation screenshots (7 images)

### Server Side
- `server/routes/admin.js` → 929 lines, replaced by adminRoutes.js
- `server/env.text` → Sample env file with duplicate entries

### Documentation Files (Not Needed to Run Website)
**From root directory:**
- `VERCEL_DEPLOYMENT_GUIDE.md` - Deployment guide
- `QUICK_DEPLOY.md` - Quick deployment instructions
- `PURCHASE_FLOW_TEST_GUIDE.md` - Testing guide
- `PURCHASE_FLOW_FIXES.md` - Implementation notes
- `ORGANIZATION_SYSTEM_IMPLEMENTATION.md` - Feature documentation
- `DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `ADMIN_FEATURES.md` - Admin features documentation
- `ADMIN_PANEL_UPDATE.md` - Admin panel notes
- `DATA_CONNECTION_SUMMARY.md` - Data connection documentation
- `image.png` - Documentation screenshot
- `image-1.png` - Documentation screenshot

### Deployment Scripts (Optional)
- `deploy.bat` - Windows deployment script
- `deploy.sh` - Linux/Mac deployment script

---

## 🔄 How to Restore Files

If you need to restore any of these files, follow these steps:

### Restore Individual Files
```bash
# Example: Restore App.jsx
mv "Unused/client/src/App.jsx" "client/src/App.jsx"

# Example: Restore admin.js route
mv "Unused/server/routes/admin.js" "server/routes/admin.js"

# Example: Restore an image
mv "Unused/client/src/assets/404.jpg" "client/src/assets/404.jpg"
```

### Restore All Files at Once
```bash
# Navigate to project root
cd "c:\Work Station\Practicum\BloodBridge-Foundation"

# Restore all client files
cp -r "Unused/client/"* "client/"

# Restore all server files
cp -r "Unused/server/"* "server/"
```

### Using PowerShell (Windows)
```powershell
# Example: Restore App.jsx
Move-Item "Unused\client\src\App.jsx" "client\src\App.jsx"

# Restore entire folder
Copy-Item -Recurse "Unused\client\*" "client\" -Force
```

---

## ⚠️ Important Notes

### Files That Are ACTIVE and Should NOT Be Restored Over:
- `client/src/Components/Shared/Navbar.jsx` ✅ (Active navbar)
- `server/routes/adminRoutes.js` ✅ (Active admin routes)
- All files in `server/models/` ✅
- All files in `client/src/pages/` ✅
- `client/public/Hero/Banner.png` ✅ (Used in Hero.jsx)

### Before Restoring:
1. **Verify the file is actually needed** - Check if the functionality still works without it
2. **Check for conflicts** - Make sure you're not overwriting an active file
3. **Test after restore** - Run the application to ensure everything works

---

## 🗑️ Safe to Delete

If after testing for a while you confirm these files are not needed, you can safely delete this entire `Unused` folder.

---

## 📊 Summary

**Total Files Moved:**
- 6 JavaScript/JSX component files (~1,500+ lines)
- 10 image/asset files
- 1 server route file (929 lines)
- 1 text file
- 9 documentation markdown files
- 2 documentation images
- 2 deployment scripts

**Estimated Space Saved:** ~5-10 MB

**Repository Status:** All active features remain functional. Website should run normally without these files.

---

*Created: January 6, 2026*
*Action: Moved unused files to preserve them while cleaning up the project structure*
