# Supabase Email Templates — Literature Tracker

Ready-to-paste HTML for the four Supabase auth email templates. All four
share the same visual style: white card on light gray background, blue
brand button, footer line. Email-client safe (table layout, inline
styles, no external CSS, no JavaScript).

## Where to paste

1. **Supabase dashboard** → your project → **Authentication** → **Email Templates**
2. For each template, paste the HTML into the **Message body** field and
   the matching subject line into the **Subject** field.
3. After all four are saved, set the sender name once:
   **Authentication** → **Settings** (or **Email** subsection) →
   **Sender Name**: `Literature Tracker`

> Tip: send yourself a real test email after each save (e.g. trigger a
> password reset to your own account) to confirm the layout renders
> correctly in Gmail, Outlook, and Apple Mail.

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
          <td style="padding:32px 32px 8px;">
            <div style="font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#2563eb;">Literature Tracker</div>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 16px;">
            <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#0f172a;font-weight:700;">Confirm your email address</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
              Welcome to <strong>Literature Tracker</strong> — your home for following the latest journal articles in chemistry, engineering, and materials science.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#334155;">
              Click the button below to confirm your email and start selecting journals to follow.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 32px 32px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;">Confirm email</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px;">
            <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#64748b;">
              Or copy and paste this link into your browser:
            </p>
            <p style="margin:0;font-size:13px;line-height:1.5;color:#2563eb;word-break:break-all;">
              <a href="{{ .ConfirmationURL }}" style="color:#2563eb;text-decoration:underline;">{{ .ConfirmationURL }}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e2e8f0;padding:20px 32px;">
            <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#94a3b8;">
              Didn't sign up for Literature Tracker? You can safely ignore this email.
            </p>
            <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
              Literature Tracker · <a href="https://literature-tracker.com" style="color:#94a3b8;text-decoration:underline;">literature-tracker.com</a>
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
          <td style="padding:32px 32px 8px;">
            <div style="font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#2563eb;">Literature Tracker</div>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 16px;">
            <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#0f172a;font-weight:700;">Reset your password</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
              We received a request to reset the password for your <strong>Literature Tracker</strong> account.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#334155;">
              Click below to choose a new password. The link is valid for one hour.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 32px 32px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;">Reset password</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px;">
            <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#64748b;">
              Or copy and paste this link into your browser:
            </p>
            <p style="margin:0;font-size:13px;line-height:1.5;color:#2563eb;word-break:break-all;">
              <a href="{{ .ConfirmationURL }}" style="color:#2563eb;text-decoration:underline;">{{ .ConfirmationURL }}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e2e8f0;padding:20px 32px;">
            <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#94a3b8;">
              If you didn't request a password reset, you can ignore this email — your password will stay the same.
            </p>
            <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
              Literature Tracker · <a href="https://literature-tracker.com" style="color:#94a3b8;text-decoration:underline;">literature-tracker.com</a>
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
          <td style="padding:32px 32px 8px;">
            <div style="font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#2563eb;">Literature Tracker</div>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 16px;">
            <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#0f172a;font-weight:700;">Sign in to Literature Tracker</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#334155;">
              Click the button below to sign in. This link is valid for one hour and can only be used once.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 32px 32px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;">Sign in</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px;">
            <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#64748b;">
              Or copy and paste this link into your browser:
            </p>
            <p style="margin:0;font-size:13px;line-height:1.5;color:#2563eb;word-break:break-all;">
              <a href="{{ .ConfirmationURL }}" style="color:#2563eb;text-decoration:underline;">{{ .ConfirmationURL }}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e2e8f0;padding:20px 32px;">
            <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#94a3b8;">
              If you didn't request this email, you can safely ignore it.
            </p>
            <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
              Literature Tracker · <a href="https://literature-tracker.com" style="color:#94a3b8;text-decoration:underline;">literature-tracker.com</a>
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
          <td style="padding:32px 32px 8px;">
            <div style="font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#2563eb;">Literature Tracker</div>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 16px;">
            <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#0f172a;font-weight:700;">Confirm your new email</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
              We received a request to change the email address on your <strong>Literature Tracker</strong> account.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#334155;">
              Click below to confirm the change.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 32px 32px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:8px;">Confirm new email</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px;">
            <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#64748b;">
              Or copy and paste this link into your browser:
            </p>
            <p style="margin:0;font-size:13px;line-height:1.5;color:#2563eb;word-break:break-all;">
              <a href="{{ .ConfirmationURL }}" style="color:#2563eb;text-decoration:underline;">{{ .ConfirmationURL }}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e2e8f0;padding:20px 32px;">
            <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#94a3b8;">
              If you didn't request this change, ignore this email — your account email will stay the same.
            </p>
            <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
              Literature Tracker · <a href="https://literature-tracker.com" style="color:#94a3b8;text-decoration:underline;">literature-tracker.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

---

## Design notes

- **Colors:** primary blue `#2563eb` matches the app's `text-blue-600` brand color. Background `#f1f5f9` is `slate-100`. Card uses pure white for max contrast in any client.
- **Typography:** system font stack — picks SF Pro on macOS/iOS, Segoe UI on Windows, and falls back through Helvetica/Arial. No web fonts (most clients block them anyway).
- **Layout:** nested `<table>`s with inline styles. This is the gold standard for cross-client compatibility (Gmail, Outlook desktop, Apple Mail, mobile clients all render this consistently).
- **Width:** capped at 560px so it stays readable on mobile without zooming.
- **Buttons:** padding-based, no images. Even if the recipient's client blocks images by default, the button still renders.
- **Fallback link:** always shown in plain text below the button so corporate email clients that strip HTML buttons (or paranoid users who don't trust buttons) can still complete the action.
- **Footer:** muted gray (`#94a3b8` = slate-400) with disclaimer line + branded sign-off.

## Things you might want to tweak later

- Add a small logo image at the top — host the PNG somewhere stable (Supabase storage, your domain, or imgur), reference with `<img src="...">`. Keep alt text. Don't rely on it rendering — keep the text "LITERATURE TRACKER" eyebrow as a fallback.
- Switch to a colored gradient header band if you want more visual identity.
- Add a "Tips" line in the welcome email: "Your first step: pick journals to follow at literature-tracker.com/Settings".
