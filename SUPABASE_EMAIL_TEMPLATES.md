# Supabase Email Templates — Literature Tracker

Branded HTML for the four Supabase auth emails. Each template includes
the Literature Tracker atom logo, brand-blue button, friendly copy, and
custom footer (replaces Supabase's default "powered by Supabase" line).

The logo image is hosted on your live site (`/apple-touch-icon.png`),
so the same domain Vercel serves your app from also serves the logo —
no separate hosting step needed.

**Design choices:**
- No redundant H1 inside the body — the email subject line already
  conveys the action; repeating it in big text inside the email is just
  visual noise.
- No "or copy and paste this link" block — modern services (Linear,
  Vercel, Stripe, GitHub, Notion) rely on the button alone. Power users
  can right-click → Copy link if they need the URL.

---

## Step-by-step: applying the templates

### Step 1 — Set the sender identity (one-time)

1. Go to **Authentication → Settings** (or **Email**, depending on
   your dashboard version) at:
   https://supabase.com/dashboard/project/fvjvcxvgxoloyfvchfof/auth/providers

   Look for **SMTP Settings** or **Email**.

2. If you're staying on Supabase's built-in mail (free tier, 2/hr cap):
   - **Sender Name:** `Literature Tracker`
   - **Sender email:** leave at the default (Supabase will use its own
     `noreply@mail.app.supabase.io` — you can't change this without
     custom SMTP)

3. With Resend SMTP set up:
   - **Sender Name:** `Literature Tracker`
   - **Sender email:** `noreply@literature-tracker.com`

### Step 2 — Paste each of the four templates below

Open https://supabase.com/dashboard/project/fvjvcxvgxoloyfvchfof/auth/templates

For each template:
1. Paste the **Subject** into the Subject field
2. Paste the **HTML** into the Message body field (replacing the entire
   default content — the "powered by Supabase ⚡" footer goes away
   automatically when you do this)
3. Click Save

### Step 3 — Test

Trigger a password-reset to your own email. Confirm:
- From: "Literature Tracker"
- Subject: "Reset your Literature Tracker password"
- Logo image at top (may need to click "show images" in Gmail)
- Branded button + footer
- No mention of "Supabase"

---

## 1. Confirm Signup

**Subject:** `Confirm your Literature Tracker account`

**Message body:**

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr>
          <td align="center" style="padding:32px 32px 8px;">
            <img src="https://literature-tracker.com/apple-touch-icon.png" alt="Literature Tracker" width="68" height="68" style="display:block;width:68px;height:68px;border:0;outline:none;text-decoration:none;border-radius:14px;" />
            <div style="margin-top:12px;font-size:22px;font-weight:700;color:#2563eb;letter-spacing:-0.01em;">Literature Tracker</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 8px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;text-align:center;">
              Welcome! Confirm your email to start following the latest journal articles in chemistry, engineering, and materials science.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:16px 32px 32px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;">Confirm email</a>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e2e8f0;padding:20px 32px;">
            <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#94a3b8;">
              Didn't sign up for Literature Tracker? You can safely ignore this email.
            </p>
            <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
              <a href="https://literature-tracker.com" style="color:#94a3b8;text-decoration:underline;">literature-tracker.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

---

## 2. Reset Password

**Subject:** `Reset your Literature Tracker password`

**Message body:**

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr>
          <td align="center" style="padding:32px 32px 8px;">
            <img src="https://literature-tracker.com/apple-touch-icon.png" alt="Literature Tracker" width="68" height="68" style="display:block;width:68px;height:68px;border:0;outline:none;text-decoration:none;border-radius:14px;" />
            <div style="margin-top:12px;font-size:22px;font-weight:700;color:#2563eb;letter-spacing:-0.01em;">Literature Tracker</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 8px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;text-align:center;">
              We received a request to reset the password for your Literature Tracker account. Click below to choose a new password.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:16px 32px 32px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;">Reset password</a>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e2e8f0;padding:20px 32px;">
            <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#94a3b8;">
              If you didn't request a password reset, you can ignore this email — your password will stay the same.
            </p>
            <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
              <a href="https://literature-tracker.com" style="color:#94a3b8;text-decoration:underline;">literature-tracker.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

---

## 3. Magic Link

**Subject:** `Your Literature Tracker sign-in link`

**Message body:**

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr>
          <td align="center" style="padding:32px 32px 8px;">
            <img src="https://literature-tracker.com/apple-touch-icon.png" alt="Literature Tracker" width="68" height="68" style="display:block;width:68px;height:68px;border:0;outline:none;text-decoration:none;border-radius:14px;" />
            <div style="margin-top:12px;font-size:22px;font-weight:700;color:#2563eb;letter-spacing:-0.01em;">Literature Tracker</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 8px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;text-align:center;">
              Click below to sign in to Literature Tracker. This link is valid for one hour and can only be used once.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:16px 32px 32px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;">Sign in</a>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e2e8f0;padding:20px 32px;">
            <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#94a3b8;">
              If you didn't request this email, you can safely ignore it.
            </p>
            <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
              <a href="https://literature-tracker.com" style="color:#94a3b8;text-decoration:underline;">literature-tracker.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

---

## 4. Change Email Address

**Subject:** `Confirm your new Literature Tracker email`

**Message body:**

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr>
          <td align="center" style="padding:32px 32px 8px;">
            <img src="https://literature-tracker.com/apple-touch-icon.png" alt="Literature Tracker" width="68" height="68" style="display:block;width:68px;height:68px;border:0;outline:none;text-decoration:none;border-radius:14px;" />
            <div style="margin-top:12px;font-size:22px;font-weight:700;color:#2563eb;letter-spacing:-0.01em;">Literature Tracker</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 8px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;text-align:center;">
              We received a request to change the email address on your Literature Tracker account. Click below to confirm the change.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:16px 32px 32px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;">Confirm new email</a>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e2e8f0;padding:20px 32px;">
            <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#94a3b8;">
              If you didn't request this change, ignore this email — your account email will stay the same.
            </p>
            <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
              <a href="https://literature-tracker.com" style="color:#94a3b8;text-decoration:underline;">literature-tracker.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

---

## What changes vs. the default Supabase email

| Element | Default | After applying these templates |
|---|---|---|
| Sender name | "Supabase Auth" | "Literature Tracker" |
| Subject | "Reset Your Password" | "Reset your Literature Tracker password" |
| Logo | none | atom icon at top |
| Branding text | none | "Literature Tracker" wordmark |
| Body text | "Follow this link…" | Friendly explanatory copy |
| Button | plain blue underline link | rounded blue button matching app |
| Footer | "powered by Supabase ⚡" + "Opt out" | "literature-tracker.com" + ignore-if-unwanted note |

## Notes about the logo image

- Hosted at `https://literature-tracker.com/apple-touch-icon.png` — the
  same image used as your app's iOS home-screen icon, so it's already
  served by Vercel.
- Some email clients (Gmail web, Outlook) **block external images by
  default**. The recipient may need to click "Show images" once. After
  that, Gmail remembers the choice for future emails from your sender.
- The "Literature Tracker" wordmark text below the image is the
  fallback — if the image is blocked, the wordmark still conveys
  branding.
- The image has `border-radius:12px` for a rounded-square look matching
  the app's iOS icon style.
