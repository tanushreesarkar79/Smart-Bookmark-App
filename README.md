#  Smart Bookmark App


A multi-tab bookmark management module that ensures **real-time synchronization of bookmarks across tabs without requiring page refresh**.

---

## 🐞 Problem Faced

When implementing the bookmark feature:

- Bookmarks added in one tab were not visible in another tab

---

## 🔍 Root Cause

Bookmark data was fetched only during the component's initial render.

While switching tabs, React preserved the existing state and did not trigger a re-fetch, resulting in stale UI data.

---

## ✅ Solution Implemented

The fix was implemented using active tab detection.

Whenever a tab becomes visible:
1. Detect the active tab
2. Trigger bookmark API fetch
3. Update state
4. Re-render UI with latest data

---

