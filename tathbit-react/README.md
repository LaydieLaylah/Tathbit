# Tathbit — تثبيت

Responsive React + Vite starter for the Tathbit Qur’an memorisation repetition tracker.

## Run locally

1. Install Node.js (LTS).
2. Open this folder in VS Code / terminal.
3. Run `npm install`.
4. Run `npm run dev` and open the local URL printed by Vite.

## Included

- Welcome screen: Continue as guest or open combined sign-in/sign-up UI.
- Home dashboard, My pages list, and Settings.
- Add an individual page or range from 1–604; existing tracked pages are preserved.
- One-tap increment only; no decrement or page deletion controls.
- Default target is 50; changing it affects newly added pages only.
- Partial page-number search, status filters, ascending/descending sort.
- Guest progress saved in this browser's localStorage.
- Working JSON export and restore; restore asks before replacing local data.
- Responsive desktop collapsible sidebar and mobile bottom navigation.

## Important limitations

The account UI is a visual placeholder only. It does not authenticate users, store credentials, or sync across devices. Connect a secure authentication provider and database (e.g. Appwrite) before enabling real accounts. Guest progress is stored locally in this browser; clearing browser data can remove it, so export backups periodically.
