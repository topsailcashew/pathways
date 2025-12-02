# Firestore Security Rules Deployment Instructions

## Overview
The Firestore security rules have been updated to include proper access controls for stage progression and communications features. The rules are ready to be deployed.

## What Was Changed
1. **Removed duplicate communications rule** - The old permissive rule has been removed
2. **Kept proper security rules** for:
   - `communications` collection: Staff can read/write, members can read their own
   - `members/{memberId}/activity` sub-collection: Staff can read/write, members can read their own
   - `message_templates` collection: Staff only
   - `stage_triggers` collection: Staff only

## Deployment Steps

### Option 1: Deploy from Terminal
```bash
# 1. Make sure you're logged in to Firebase
firebase login

# 2. Set the Firebase project (if not already set)
firebase use <your-project-id>

# 3. Deploy the security rules
firebase deploy --only firestore:rules
```

### Option 2: Deploy from Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project
3. Navigate to Firestore Database > Rules
4. Copy the contents of `firestore.rules` from this repository
5. Paste into the Firebase console
6. Click "Publish"

## Verification
After deployment, verify the rules are working:
1. Test that staff users can read/write to all collections
2. Test that regular members can only read their own communications and activity
3. Test that non-authenticated users cannot access any data

## Troubleshooting
- If you get "No currently active project" error, run `firebase use --add` to select your project
- If you get authentication errors, run `firebase login` again
- Check that you have the correct permissions in the Firebase project

## Files Modified
- `firestore.rules` - Updated security rules (commit: d656ded)
