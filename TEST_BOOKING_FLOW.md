# 🧪 Booking System Test Guide

## ⚠️ Important: Resend API Key Setup

Before testing, you MUST set up a Resend API key:

### Quick Setup:

1. Go to [https://resend.com](https://resend.com)
2. Sign up for free (3000 emails/month)
3. Create API key
4. Update `.env.local`:
```bash
RESEND_API_KEY=re_your_actual_key_here
```
5. Restart dev server: `npm run dev`

---

## 🚀 Testing Flow

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Homepage
1. Go to `http://localhost:3000`
2. Scroll to "Services" section
3. You should see service cards with **"Book Now"** badges

### Step 3: Click Service Card
1. Click ANY service card (e.g., "Home Cleaning")
2. Modal should open with:
   - Title: "Book: Home Cleaning"
   - Progress: "Step 1 of 2"
   - Progress bar
   - Form fields

### Step 4: Fill Form
Fill all required fields:
```
Name: John Doe
Email: your-real-email@example.com  ⚠️ USE YOUR REAL EMAIL
Confirm Email: your-real-email@example.com
Phone: +31612345678
Address: Street 1, 1234AB Amsterdam
Preferred Date: Tomorrow (or any future date)
Preferred Time: Morning (8AM-12PM)
Notes: (Optional)
```

### Step 5: Submit Form
1. Click "Send Verification Email"
2. Button shows "Sending..." with spinner
3. Modal transitions to Step 2
4. Shows: "📧 Check Your Email!"

### Step 6: Check Email
1. Open your email inbox
2. Look for email from: `noreply@cleanoo.nl`
3. Subject: "Verify your booking with Cleanoo"
4. Email should contain:
   - Booking details (service, date, time)
   - Blue "Verify My Booking" button

### Step 7: Click Email Link
1. Click "Verify My Booking" button in email
2. Opens: `http://localhost:3000/verify-booking?token=xxx`
3. You should see:
   - ✅ Green checkmark: "Email Verified!"
   - Your booking details
   - "Create Your Password" form

### Step 8: Set Password
1. Enter password (min 6 characters)
2. Confirm password
3. Click "Complete Booking"
4. Button shows "Completing..." with spinner

### Step 9: Success!
1. Should show success toast: "Account created and booking confirmed!"
2. Auto-redirected to: `/dashboard`
3. You're now logged in!

### Step 10: Check Welcome Email
1. Check your email inbox again
2. Should receive 2nd email: "🎉 Your Cleanoo booking is confirmed!"
3. Contains:
   - Login details
   - Booking details
   - "Go to Dashboard" button

---

## ✅ Expected Results

### Database Changes:
```sql
-- New user created
SELECT * FROM users WHERE email = 'your@email.com';
-- Should show: email_verified = TRUE

-- New booking created
SELECT * FROM bookings WHERE email = 'your@email.com';
-- Should show: status = 'confirmed', user_id = [user_id]
```

### UI Behavior:
- ✅ Modal opens smoothly
- ✅ Form validation works
- ✅ Email confirmation matches
- ✅ Date picker (min: today)
- ✅ Progress bar updates
- ✅ Loading states show
- ✅ Success messages display
- ✅ Auto-redirect works

### Emails Sent:
1. **Verification Email** (immediately after form submit)
2. **Welcome Email** (after password creation)

---

## 🐛 Troubleshooting

### ❌ "Failed to send verification email"
**Cause:** Resend API key not set or invalid
**Fix:**
```bash
# Check .env.local
cat .env.local | grep RESEND_API_KEY

# Should NOT be placeholder!
# If it is, get real key from resend.com
```

### ❌ Modal doesn't open
**Cause:** JavaScript error
**Fix:**
1. Open browser console (F12)
2. Look for errors
3. Check if `BookingWizard` is imported

### ❌ "Email addresses do not match"
**Cause:** Typo in email confirmation
**Fix:** Type carefully, check for spaces

### ❌ Can't select past dates
**Expected:** Date picker only allows future dates
**Fix:** This is correct behavior!

### ❌ Email not received
**Causes:**
1. Wrong email address entered
2. Email in spam folder ← Check here first!
3. Resend API key issues
4. Resend account not active

**Fix:**
1. Check spam/junk folder
2. Verify Resend account is active
3. Check terminal logs for errors

### ❌ "Invalid verification token"
**Causes:**
1. Token expired (24 hours)
2. Already used
3. Database reset

**Fix:** Start over, create new booking

---

## 📊 Test Checklist

- [ ] Dev server running
- [ ] Resend API key configured
- [ ] Homepage loads
- [ ] Service cards visible
- [ ] "Book Now" badges show
- [ ] Modal opens on click
- [ ] All form fields work
- [ ] Validation triggers
- [ ] Email sent successfully
- [ ] Email received (check spam!)
- [ ] Verification link works
- [ ] Password form shows
- [ ] Account created
- [ ] Auto-login works
- [ ] Dashboard loads
- [ ] Welcome email received
- [ ] User in database
- [ ] Booking in database

---

## 🎯 Multiple Bookings Test

Test with different services:
1. Home Cleaning
2. Office Cleaning
3. Deep Cleaning

Each should:
- Show correct service name in modal
- Include service in email
- Store correct service_type in DB

---

## 📝 Test Scenarios

### Scenario 1: Happy Path ✅
Everything works perfectly (tested above)

### Scenario 2: Invalid Email
1. Enter invalid email: `notanemail`
2. Should show error: "Please enter a valid email"

### Scenario 3: Email Mismatch
1. Email: `test@example.com`
2. Confirm: `test2@example.com`
3. Should show: "Email addresses do not match"

### Scenario 4: Short Password
1. In verify page, enter password: `12345` (5 chars)
2. Should show error: "Password must be at least 6 characters long"

### Scenario 5: Password Mismatch
1. Password: `password123`
2. Confirm: `password456`
3. Should show: "Passwords do not match"

### Scenario 6: Existing Email
1. Complete one booking (account created)
2. Try to book again with same email
3. Should show: "An account with this email already exists. Please login instead."

---

## 🔍 Console Logs to Check

### Terminal (Backend):
```
✅ SQLite database successfully initialized
📊 Database tables created successfully
✅ Verification email sent to: user@example.com
✅ Welcome email sent to: user@example.com
```

### Browser Console:
```
No errors should appear!
```

---

## 💾 Database Verification

Check database after successful booking:

```bash
sqlite3 database.sqlite

-- Check user
SELECT * FROM users WHERE email = 'your@email.com';

-- Check booking
SELECT * FROM bookings WHERE email = 'your@email.com';

-- Exit
.quit
```

Expected:
```
User: email_verified = 1, password = [hashed]
Booking: status = 'confirmed', user_id = [user_id]
```

---

## 🎉 Success Indicators

✅ **UI:**
- Modal opens/closes smoothly
- Form validation works
- Progress bar updates
- Success messages show
- Redirects work

✅ **Backend:**
- No errors in terminal
- Emails sent successfully
- Database updated correctly
- Tokens created/validated

✅ **Email:**
- Both emails received
- HTML renders correctly
- Links work
- Styling intact

---

## 🚨 Common Mistakes

1. **Using placeholder API key** → Get real key!
2. **Not checking spam folder** → Always check!
3. **Using same email twice** → User already exists
4. **Not restarting dev server** → After .env changes
5. **Typo in email** → No email received

---

## 📞 Need Help?

If tests fail:
1. Check this guide again
2. Review console logs (browser + terminal)
3. Verify environment variables
4. Test Resend API key separately
5. Check `BOOKING_SYSTEM_SETUP.md` for setup

---

**Test Duration:** ~5 minutes per flow
**Last Updated:** January 2025
**Status:** Ready for Testing 🚀
