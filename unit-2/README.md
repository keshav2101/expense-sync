# Unit 2: JavaScript & React.js — ExpenseSync

## 1. Aim
To build interactive, client-side financial management applications using **Vanilla JavaScript (Part A)** and modern **React.js SPA with Vite (Part B)**. The unit covers ES6 fundamentals, DOM manipulation, custom hooks, context-based state management, client-side routing, and Splitwise-style bill splitting with penny/paise rounding absorption.

---

## 2. Syllabus Concepts Covered (21CSE354T)

### Part A: JavaScript Fundamentals & DOM
* **DOM Traversal & Manipulation**: Dynamic element generation (`createElement`, `appendChild`), event delegation, innerHTML and textContent management.
* **ES6+ Features**: `let`/`const`, arrow functions, destructuring, template literals, spread/rest operators, modules.
* **Array Functional Programming**: `map()`, `filter()`, `reduce()`, `find()`, `forEach()`.
* **Precision Decimal Mathematics**: Handling IEEE-754 floating-point inaccuracies, penny/paise remainder allocation to ensure total bill sum matches $100\%$ exact.
* **Third-Party Library Integration**: Canvas Confetti for celebratory animations upon successful settlement.

### Part B: React.js Component Architecture
* **JSX & Component Lifecycle**: Functional components, props destructuring, composition, and conditional rendering.
* **React Hooks**:
  * `useState`: Managing local component state (search query, modals, form values).
  * `useEffect`: Synchronization with `localStorage` and side-effects.
  * `useContext`: Global theme management (`ThemeContext`) and user authentication / currency state (`AuthContext`).
  * `useMemo`: Memoizing expensive calculations (filtered/sorted expenses, category aggregates, budget status).
* **Custom Hooks with `useDebugValue`**:
  * `useExpenses`: Encapsulates CRUD operations, pagination, category totals, budget alerts, and CSV export, exposing debug information in React DevTools.
  * `useDebounce`: Throttles real-time search queries to eliminate unnecessary re-renders.
* **Single-Page Application Routing**: React Router v6 (`BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`, `useParams`).

---

## 3. What Was Built

### Part A: `part-a-vanilla-js/`
* `index.html`, `style.css`, `app.js`: Interactive vanilla JavaScript bill split calculator supporting all 4 split models:
  1. **Equal Split**: Even division with remainder absorbed by the last member.
  2. **Exact Split**: Individual currency amounts with real-time discrepancy warnings.
  3. **Percentage Split**: Percent allocations validated to total 100%.
  4. **Shares (Ratio) Split**: Proportional ratio allocation (e.g., 2:1:1).

### Part B: `part-b-react/`
* Complete Vite + React Single-Page Application:
  * **Dashboard (`Dashboard.jsx`)**: 4 stat cards, SVG category donut chart, category budget progress bars with 80% warning and 100% danger alerts, and recent transactions.
  * **Personal Expenses (`Expenses.jsx`)**: Debounced search, category filter, payment filter, sorting, pagination, CSV export, and Add/Edit/Delete modals.
  * **Groups (`Groups.jsx` & `GroupDetail.jsx`)**: Splitwise-style groups, member balances, greedy min-cash-flow debt simplification display, and group activity feeds.
  * **Settle Up (`SettleUp.jsx`)**: Form to record payments between members with instant balance updates and settlement logs.

---

## 4. How to Run

### Part A: Vanilla JavaScript Calculator
```bash
# Navigate to Part A
cd unit-2/part-a-vanilla-js

# Open directly or serve with python/node:
open index.html
# Or:
python3 -m http.server 3001
```

### Part B: React Application (Vite)
```bash
# Navigate to Part B
cd unit-2/part-b-react

# Install dependencies (already completed)
npm install

# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

To verify a production build:
```bash
npm run build
```

---

## 5. Sample Output & User Flow
1. **Live Split Preview**: When entering ₹2,400 with 4 group members, the system dynamically calculates ₹600.00 each. If ₹100.00 is split among 3 members, Member 1 gets ₹33.33, Member 2 gets ₹33.33, and Member 3 absorbs the remainder at ₹33.34 so the sum strictly equals ₹100.00.
2. **Debounced Search**: Typing "Swiggy" in the personal expenses search bar filters the table smoothly with a 300ms debounce.
3. **Budget Health Bar**: Categories exceeding 80% render a warning badge; categories exceeding 100% trigger an over-budget alert.

---

## 6. Viva Q&A (5 Key Questions)

### Q1: What are the Rules of Hooks in React, and why do they exist?
**Answer:**
1. **Only call hooks at the top level**: Do not call hooks inside loops, conditions, or nested functions.
2. **Only call hooks from React function components or custom hooks**.
React relies on the order in which hooks are called across renders to preserve state between multiple `useState` or `useEffect` calls. Changing the call order breaks React's internal fiber linked list.

### Q2: What is the purpose of `useDebugValue` in a custom React hook?
**Answer:** `useDebugValue` formats and displays custom debugging labels for custom hooks inside **React DevTools**. In our `useExpenses` hook, it exposes `Expenses: N items (Total: ₹X)` directly in DevTools, enabling senior engineers and evaluators to inspect hook internals without polluting console logs.

### Q3: Why is `useMemo` used for filtering and category aggregations?
**Answer:** Computing category totals and filtering arrays over hundreds of records on every render can cause frame drops. `useMemo` caches the calculated result and only re-executes the functional block when its declared dependencies (`[expenses, searchTerm, categoryFilter, paymentFilter, sortBy]`) change.

### Q4: How is fractional penny/paise rounding handled when splitting bills?
**Answer:** In financial calculations, dividing amounts like ₹100 by 3 yields $33.3333...$. Summing three ₹33.33 parts equals ₹99.99, losing 1 paisa. Our algorithm computes base shares using `Math.floor((total / N) * 100) / 100` and assigns the remaining difference `total - sum(first N-1 shares)` to the last member, guaranteeing conservation of money.

### Q5: How does React Context API differ from Redux or local state?
**Answer:** Local state is scoped to a single component and requires "prop drilling" to pass down nested hierarchies. React Context (`createContext`, `useContext`) provides a native way to broadcast global values (like `ThemeContext` and `AuthContext`) across the entire component tree without third-party libraries like Redux.
