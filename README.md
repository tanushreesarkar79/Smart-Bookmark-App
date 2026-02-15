#  Smart Bookmark App


A multi-tab bookmark management module that ensures **real-time synchronization of bookmarks across tabs without requiring page refresh**.

---

## 📖 Overview
This project addresses a common UI issue in multi-tab interfaces — stale data rendering.

Previously, when a bookmark was added or modified in one tab, the changes were not reflected in another tab unless the page was refreshed.  
The system now dynamically fetches data based on active tab visibility to maintain a consistent UI state.

---

## ✨ Features
- Real-time bookmark synchronization
- No manual refresh required
- Active-tab based data fetching
- Eliminates stale UI state
- React Hooks based implementation

---

## 🛠 Tech Stack

| Layer | Technology |
|------|------|
| Frontend | React.js |
| State Handling | React Hooks |
| Data Fetching | API Calls |
| UI Logic | Conditional Rendering |

---

## 🐞 Problem Faced

When implementing the bookmark feature:

- Bookmarks added in one tab were not visible in another tab
- UI displayed outdated cached data
- Users had to refresh the page manually
- Application state became inconsistent

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

## 💡 Implementation Logic

```javascript
useEffect(() => {
  if (activeTab === "bookmarkTab") {
    fetchBookmarks();
  }
}, [activeTab]);
```

---

## 🎯 Result

| Before | After |
|------|------|
| Manual refresh required | Automatic update |
| Stale UI | Live synchronized data |
| Inconsistent state | Consistent state |
| Poor user experience | Smooth user experience |

---

## 🧠 Key Learning
In multi-view interfaces, component mount is not equal to view visibility.  
Critical data should be fetched based on active view state instead of initial render.

---



## 🧪 Test Scenarios

| Action | Expected Result |
|------|------|
| Add bookmark in another tab | Visible instantly |
| Switch tabs | Data reloads automatically |
| Delete bookmark | Removed everywhere |
| Reload page | Consistent data |

