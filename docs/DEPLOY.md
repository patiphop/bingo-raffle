# Deploy Guide (GitHub Pages + Google Apps Script)

## 1) Create the Google Sheet
1. Create a new Google Sheet.
2. Add sheets with the exact names and headers from `backend/GoogleSheetsTemplate.json`.
3. Keep row 1 as headers.

## 2) Add Apps Script backend
1. In the Sheet, open **Extensions → Apps Script**.
2. Create a file `Code.gs` and paste from `backend/Code.gs`.
3. Save the project.

## 3) Deploy as Web App
1. Click **Deploy → New deployment**.
2. Select **Web app**.
3. **Execute as:** Me (script owner).
4. **Who has access:** Anyone with the link.
5. Click **Deploy** and copy the deployment URL (ends with `/exec`).

## 4) Configure Frontend
1. Host the `frontend/` folder with GitHub Pages (e.g. branch `gh-pages`).
2. Open `frontend/index.html` in your browser.
3. Set the **API Base URL** (the `/exec` URL from the Web App) and click **Save**.

## 5) Usage
- **Host:** open `host.html` → configure → Start → Draw/Undo/End/Reset.
- **Player:** open `player.html` → Enter Game ID + Display Name → Join → (Bingo: see card, Claim).
- **Board:** open `board.html?gameId=G_xxx` full-screen on a projector.

## 6) Notes
- For production, restrict origins in Apps Script and implement host token auth.
- LINE Notify can be added later (send on winner/end events).
