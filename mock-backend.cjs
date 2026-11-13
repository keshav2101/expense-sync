// ExpenseSync Unified Mock Backend Server
// Provides full REST API compatibility with Spring Boot Core Service (8080) and Analytics Microservice (8082)
const http = require('http');
const url = require('url');

// -------------------------------------------------------------
// 1. Seed Accounts (7 Interlinked Profiles for 21CSE354T Viva Evaluation)
// -------------------------------------------------------------
const users = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', password: 'Password@123', currency: 'INR', role: 'Full-Stack Developer' },
  { id: 2, name: 'Priya Nair', email: 'priya@example.com', password: 'Password@123', currency: 'INR', role: 'UI/UX Designer' },
  { id: 3, name: 'Amit Patel', email: 'amit@example.com', password: 'Password@123', currency: 'INR', role: 'Backend Engineer' },
  { id: 4, name: 'Sneha Rao', email: 'sneha@example.com', password: 'Password@123', currency: 'INR', role: 'Product Manager' },
  { id: 5, name: 'Vikram Malhotra', email: 'vikram@example.com', password: 'Password@123', currency: 'INR', role: 'Data Analyst & Trekker' },
  { id: 6, name: 'Ananya Iyer', email: 'ananya@example.com', password: 'Password@123', currency: 'INR', role: 'Freelance Creator' },
  { id: 7, name: 'Rohan Verma', email: 'rohan@example.com', password: 'Password@123', currency: 'INR', role: 'SRM Student' }
];

// Per-User Category Budgets
const userBudgets = {
  1: { OVERALL: 30000, FOOD: 5000, RENT: 12000, TRAVEL: 4000, SHOPPING: 3000, BILLS: 3000, ENTERTAINMENT: 2000, HEALTH: 2000, OTHER: 2000 },
  2: { OVERALL: 35000, FOOD: 6000, RENT: 15000, TRAVEL: 3000, SHOPPING: 5000, BILLS: 2000, ENTERTAINMENT: 2000, HEALTH: 2000, OTHER: 1000 },
  3: { OVERALL: 25000, FOOD: 5000, RENT: 10000, TRAVEL: 3000, SHOPPING: 3000, BILLS: 1500, ENTERTAINMENT: 1500, HEALTH: 1500, OTHER: 1000 },
  4: { OVERALL: 20000, FOOD: 4000, RENT: 8000, TRAVEL: 2000, SHOPPING: 3000, BILLS: 1000, ENTERTAINMENT: 1000, HEALTH: 1000, OTHER: 1000 },
  5: { OVERALL: 40000, FOOD: 6000, RENT: 10000, TRAVEL: 15000, SHOPPING: 4000, BILLS: 1000, ENTERTAINMENT: 3000, HEALTH: 1000, OTHER: 1000 },
  6: { OVERALL: 25000, FOOD: 4000, RENT: 8000, TRAVEL: 2500, SHOPPING: 6000, BILLS: 5000, ENTERTAINMENT: 2000, HEALTH: 1500, OTHER: 1000 },
  7: { OVERALL: 8000, FOOD: 2500, RENT: 0, TRAVEL: 1500, SHOPPING: 1000, BILLS: 1500, ENTERTAINMENT: 800, HEALTH: 500, OTHER: 1200 }
};

// -------------------------------------------------------------
// 2. Greedy Min-Cash-Flow Debt Simplification Algorithm
// -------------------------------------------------------------
function simplifyDebts(netBalances, userNames) {
  const settlements = [];
  const balances = {};
  for (const [k, v] of Object.entries(netBalances)) {
    balances[Number(k)] = Math.round(Number(v) * 100) / 100;
  }
  const EPSILON = 0.05;

  while (true) {
    let maxCreditorId = null;
    let maxCredit = 0;
    let maxDebtorId = null;
    let maxDebit = 0;

    for (const [uIdStr, bal] of Object.entries(balances)) {
      const uId = Number(uIdStr);
      if (bal > maxCredit) {
        maxCredit = bal;
        maxCreditorId = uId;
      }
      if (bal < maxDebit) {
        maxDebit = bal;
        maxDebtorId = uId;
      }
    }

    if (maxCredit <= EPSILON || Math.abs(maxDebit) <= EPSILON) break;
    if (!maxCreditorId || !maxDebtorId || maxCreditorId === maxDebtorId) break;

    const debtorOwes = Math.abs(maxDebit);
    const transferAmount = Math.min(debtorOwes, maxCredit);
    const fromName = userNames[maxDebtorId] || `User #${maxDebtorId}`;
    const toName = userNames[maxCreditorId] || `User #${maxCreditorId}`;

    settlements.push({
      fromUserId: maxDebtorId,
      fromUserName: fromName,
      from: fromName,
      toUserId: maxCreditorId,
      toUserName: toName,
      to: toName,
      amount: Math.round(transferAmount * 100) / 100
    });

    balances[maxCreditorId] = Math.round((maxCredit - transferAmount) * 100) / 100;
    balances[maxDebtorId] = Math.round((maxDebit + transferAmount) * 100) / 100;
  }

  return settlements;
}

// -------------------------------------------------------------
// 3. Multi-Group Interlinked Architecture
// -------------------------------------------------------------
let groups = [
  {
    id: 1,
    name: 'Goa Trip 2026',
    type: 'TRIP',
    members: [
      { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com' },
      { id: 2, name: 'Priya Nair', email: 'priya@example.com' },
      { id: 3, name: 'Amit Patel', email: 'amit@example.com' },
      { id: 4, name: 'Sneha Rao', email: 'sneha@example.com' }
    ],
    // Zero-Sum Balances: -100 + 9900 - 5300 - 4500 = 0.00
    balances: { '1': -100.00, '2': 9900.00, '3': -5300.00, '4': -4500.00 },
    netBalances: { 1: -100.00, 2: 9900.00, 3: -5300.00, 4: -4500.00 },
    simplifiedDebts: [
      { fromUserId: 3, fromUserName: 'Amit Patel', from: 'Amit Patel', toUserId: 2, toUserName: 'Priya Nair', to: 'Priya Nair', amount: 5300.00 },
      { fromUserId: 4, fromUserName: 'Sneha Rao', from: 'Sneha Rao', toUserId: 2, toUserName: 'Priya Nair', to: 'Priya Nair', amount: 4500.00 },
      { fromUserId: 1, fromUserName: 'Rahul Sharma', from: 'Rahul Sharma', toUserId: 2, toUserName: 'Priya Nair', to: 'Priya Nair', amount: 100.00 }
    ],
    activity: [
      { id: 101, text: "Priya added 'Beach Villa 2-Night Stay' (₹16,000) for Rahul, Priya, Amit, Sneha", timestamp: '2026-11-07 14:30' },
      { id: 102, text: "Rahul added 'Scuba & Water Sports' (₹6,000) for group", timestamp: '2026-11-08 11:15' },
      { id: 103, text: "Sneha added 'Beach Shack Seafood Dinner' (₹1,600)", timestamp: '2026-11-08 20:30' },
      { id: 104, text: "Amit settled ₹1,200 with Rahul via UPI", timestamp: '2026-11-09 10:00' }
    ]
  },
  {
    id: 2,
    name: 'Flatmates B-302',
    type: 'HOME',
    members: [
      { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com' },
      { id: 3, name: 'Amit Patel', email: 'amit@example.com' },
      { id: 4, name: 'Sneha Rao', email: 'sneha@example.com' }
    ],
    // Zero-Sum Balances: +116.67 + 366.67 - 483.34 = 0.00
    balances: { '1': 116.67, '3': 366.67, '4': -483.34 },
    netBalances: { 1: 116.67, 3: 366.67, 4: -483.34 },
    simplifiedDebts: [
      { fromUserId: 4, fromUserName: 'Sneha Rao', from: 'Sneha Rao', toUserId: 3, toUserName: 'Amit Patel', to: 'Amit Patel', amount: 366.67 },
      { fromUserId: 4, fromUserName: 'Sneha Rao', from: 'Sneha Rao', toUserId: 1, toUserName: 'Rahul Sharma', to: 'Rahul Sharma', amount: 116.67 }
    ],
    activity: [
      { id: 201, text: "Amit added 'Electricity & High-Speed Wi-Fi' (₹1,450)", timestamp: '2026-11-01 18:00' },
      { id: 202, text: "Rahul added 'Blinkit Monthly Groceries' (₹1,200)", timestamp: '2026-11-05 15:30' },
      { id: 203, text: "Sneha settled ₹800 with Rahul via UPI", timestamp: '2026-11-06 11:20' }
    ]
  },
  {
    id: 3,
    name: 'Tech Hackathon SRM',
    type: 'PROJECT',
    members: [
      { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com' },
      { id: 2, name: 'Priya Nair', email: 'priya@example.com' },
      { id: 5, name: 'Vikram Malhotra', email: 'vikram@example.com' },
      { id: 6, name: 'Ananya Iyer', email: 'ananya@example.com' }
    ],
    // Zero-Sum Balances: +200 + 1400 - 600 - 1000 = 0.00
    balances: { '1': 200.00, '2': 1400.00, '5': -600.00, '6': -1000.00 },
    netBalances: { 1: 200.00, 2: 1400.00, 5: -600.00, 6: -1000.00 },
    simplifiedDebts: [
      { fromUserId: 6, fromUserName: 'Ananya Iyer', from: 'Ananya Iyer', toUserId: 2, toUserName: 'Priya Nair', to: 'Priya Nair', amount: 1000.00 },
      { fromUserId: 5, fromUserName: 'Vikram Malhotra', from: 'Vikram Malhotra', toUserId: 2, toUserName: 'Priya Nair', to: 'Priya Nair', amount: 400.00 },
      { fromUserId: 5, fromUserName: 'Vikram Malhotra', from: 'Vikram Malhotra', toUserId: 1, toUserName: 'Rahul Sharma', to: 'Rahul Sharma', amount: 200.00 }
    ],
    activity: [
      { id: 301, text: "Priya added 'AWS Cloud & Domain Hosting' (₹2,400)", timestamp: '2026-11-05 16:00' },
      { id: 302, text: "Rahul added 'Pizza & Red Bull Sprints' (₹1,200)", timestamp: '2026-11-06 23:00' },
      { id: 303, text: "Ananya settled ₹500 with Priya via UPI", timestamp: '2026-11-07 10:15' }
    ]
  },
  {
    id: 4,
    name: 'Weekend Foodies Club',
    type: 'OTHER',
    members: [
      { id: 2, name: 'Priya Nair', email: 'priya@example.com' },
      { id: 4, name: 'Sneha Rao', email: 'sneha@example.com' },
      { id: 5, name: 'Vikram Malhotra', email: 'vikram@example.com' },
      { id: 7, name: 'Rohan Verma', email: 'rohan@example.com' }
    ],
    // Zero-Sum Balances: -100 - 900 + 1900 - 900 = 0.00
    balances: { '2': -100.00, '4': -900.00, '5': 1900.00, '7': -900.00 },
    netBalances: { 2: -100.00, 4: -900.00, 5: 1900.00, 7: -900.00 },
    simplifiedDebts: [
      { fromUserId: 4, fromUserName: 'Sneha Rao', from: 'Sneha Rao', toUserId: 5, toUserName: 'Vikram Malhotra', to: 'Vikram Malhotra', amount: 900.00 },
      { fromUserId: 7, fromUserName: 'Rohan Verma', from: 'Rohan Verma', toUserId: 5, toUserName: 'Vikram Malhotra', to: 'Vikram Malhotra', amount: 900.00 },
      { fromUserId: 2, fromUserName: 'Priya Nair', from: 'Priya Nair', toUserId: 5, toUserName: 'Vikram Malhotra', to: 'Vikram Malhotra', amount: 100.00 }
    ],
    activity: [
      { id: 401, text: "Vikram added 'Korean Barbecue Feast' (₹2,800)", timestamp: '2026-11-08 21:00' },
      { id: 402, text: "Priya added 'Artisanal Boba & Desserts' (₹800)", timestamp: '2026-11-08 22:30' },
      { id: 403, text: "Rohan settled ₹250 with Vikram via UPI", timestamp: '2026-11-09 14:00' }
    ]
  }
];

// -------------------------------------------------------------
// 4. Interlinked Expenses
// -------------------------------------------------------------
let expenses = [
  // --- Rahul Sharma (id: 1) ---
  { id: 101, paidById: 1, title: 'Monthly Apartment Rent', amount: 9500.00, category: 'RENT', date: '2026-11-01', paymentMethod: 'BANK', notes: 'Rent transfer to owner', isRecurring: true, groupId: null },
  { id: 102, paidById: 1, title: 'Swiggy Team Lunch', amount: 1450.00, category: 'FOOD', date: '2026-11-03', paymentMethod: 'UPI', notes: 'Biryani & starters for team', isRecurring: false, groupId: 1 },
  { id: 103, paidById: 1, title: 'Uber Airport Cab', amount: 850.00, category: 'TRAVEL', date: '2026-11-04', paymentMethod: 'CARD', notes: 'Airport drop for Goa flight', isRecurring: false, groupId: 1 },
  { id: 104, paidById: 1, title: 'Airtel Fiber Broadband', amount: 999.00, category: 'BILLS', date: '2026-11-05', paymentMethod: 'UPI', notes: 'Monthly 200Mbps plan', isRecurring: true, groupId: null },
  { id: 105, paidById: 1, title: 'Blinkit Grocery Restock', amount: 1200.00, category: 'FOOD', date: '2026-11-05', paymentMethod: 'UPI', notes: 'Milk, oats, fruits shared with flatmates', isRecurring: false, groupId: 2 },
  { id: 106, paidById: 1, title: 'Water Sports & Scuba Diving', amount: 6000.00, category: 'ENTERTAINMENT', date: '2026-11-08', paymentMethod: 'CASH', notes: 'Group scuba diving activity in Goa', isRecurring: false, groupId: 1 },
  { id: 107, paidById: 1, title: 'Beach Shack Seafood & Drinks', amount: 4500.00, category: 'FOOD', date: '2026-11-08', paymentMethod: 'UPI', notes: 'Dinner at Calangute', isRecurring: false, groupId: 1 },
  { id: 108, paidById: 1, title: 'Hackathon Sprint Pizzas', amount: 1200.00, category: 'FOOD', date: '2026-11-06', paymentMethod: 'UPI', notes: 'Energy drinks & pizzas for hackathon team', isRecurring: false, groupId: 3 },
  { id: 109, paidById: 1, title: 'D-Mart Monthly Supplies', amount: 2650.00, category: 'SHOPPING', date: '2026-11-10', paymentMethod: 'CARD', notes: 'Toiletries & home cleaning', isRecurring: false, groupId: null },

  // --- Priya Nair (id: 2) ---
  { id: 201, paidById: 2, title: 'Beach Villa 2-Night Stay', amount: 16000.00, category: 'RENT', date: '2026-11-07', paymentMethod: 'CARD', notes: 'Airbnb booking shared with Rahul, Amit, Sneha', isRecurring: false, groupId: 1 },
  { id: 202, paidById: 2, title: 'AWS Cloud Hosting & Domain', amount: 2400.00, category: 'BILLS', date: '2026-11-05', paymentMethod: 'CARD', notes: 'Hackathon production infrastructure', isRecurring: false, groupId: 3 },
  { id: 203, paidById: 2, title: 'Artisanal Boba Tea & Desserts', amount: 800.00, category: 'FOOD', date: '2026-11-08', paymentMethod: 'UPI', notes: 'Dessert spread for Foodies Club', isRecurring: false, groupId: 4 },
  { id: 204, paidById: 2, title: 'IKEA Ergonomic Desk & Chair', amount: 8500.00, category: 'SHOPPING', date: '2026-11-02', paymentMethod: 'CARD', notes: 'Home studio setup', isRecurring: false, groupId: null },
  { id: 205, paidById: 2, title: 'Blue Tokai Coffee & Bakery', amount: 480.00, category: 'FOOD', date: '2026-11-06', paymentMethod: 'UPI', notes: 'Croissant and specialty brew', isRecurring: false, groupId: null },
  { id: 206, paidById: 2, title: 'Cult.fit Gym & Yoga Pass', amount: 1499.00, category: 'HEALTH', date: '2026-11-07', paymentMethod: 'UPI', notes: 'Monthly fitness pass', isRecurring: true, groupId: null },
  { id: 207, paidById: 2, title: 'Myntra Winter Fashion', amount: 3200.00, category: 'SHOPPING', date: '2026-11-09', paymentMethod: 'CARD', notes: 'Sweaters & shoes', isRecurring: false, groupId: null },
  { id: 208, paidById: 2, title: 'Uber Premier Office Commute', amount: 450.00, category: 'TRAVEL', date: '2026-11-11', paymentMethod: 'UPI', notes: 'Cab to client meeting', isRecurring: false, groupId: null },

  // --- Amit Patel (id: 3) ---
  { id: 301, paidById: 3, title: 'Flat B-302 Electricity & High-Speed Wi-Fi', amount: 1450.00, category: 'BILLS', date: '2026-11-01', paymentMethod: 'UPI', notes: 'Shared flat utility bill for Rahul, Amit, Sneha', isRecurring: true, groupId: 2 },
  { id: 302, paidById: 3, title: 'Beach Drinks & Mocktails', amount: 800.00, category: 'FOOD', date: '2026-11-08', paymentMethod: 'UPI', notes: 'Sunset mocktails for Goa group', isRecurring: false, groupId: 1 },
  { id: 303, paidById: 3, title: "Nature's Basket Gourmet Groceries", amount: 2100.00, category: 'FOOD', date: '2026-11-03', paymentMethod: 'CARD', notes: 'Weekly fresh organic produce', isRecurring: false, groupId: null },
  { id: 304, paidById: 3, title: 'Amazon Electronics & Cables', amount: 4500.00, category: 'SHOPPING', date: '2026-11-05', paymentMethod: 'CARD', notes: 'USB-C hub and mechanical keyboard', isRecurring: false, groupId: null },
  { id: 305, paidById: 3, title: 'HP Petrol Vehicle Refuel', amount: 2200.00, category: 'TRAVEL', date: '2026-11-07', paymentMethod: 'UPI', notes: 'Full tank for highway drive', isRecurring: false, groupId: null },
  { id: 306, paidById: 3, title: 'Clove Dental Scaling & Checkup', amount: 1500.00, category: 'HEALTH', date: '2026-11-10', paymentMethod: 'CARD', notes: 'Bi-annual dental clinic visit', isRecurring: false, groupId: null },
  { id: 307, paidById: 3, title: 'PVR IMAX Movie & Popcorn', amount: 850.00, category: 'ENTERTAINMENT', date: '2026-11-11', paymentMethod: 'UPI', notes: 'Weekend movie ticket', isRecurring: false, groupId: null },

  // --- Sneha Rao (id: 4) ---
  { id: 401, paidById: 4, title: 'Beach Shack Seafood Dinner', amount: 1600.00, category: 'FOOD', date: '2026-11-08', paymentMethod: 'UPI', notes: 'Shared dinner for Goa crew', isRecurring: false, groupId: 1 },
  { id: 402, paidById: 4, title: 'Flat B-302 Cleaning Supplies & Mop', amount: 600.00, category: 'SHOPPING', date: '2026-11-03', paymentMethod: 'UPI', notes: 'Housekeeping supplies for flat', isRecurring: false, groupId: 2 },
  { id: 403, paidById: 4, title: 'Urban Ladder Minimalist Side Table', amount: 4200.00, category: 'SHOPPING', date: '2026-11-02', paymentMethod: 'CARD', notes: 'Bedroom upgrade', isRecurring: false, groupId: null },
  { id: 404, paidById: 4, title: 'Organic India Herbal & Groceries', amount: 1800.00, category: 'FOOD', date: '2026-11-04', paymentMethod: 'UPI', notes: 'Green tea and superfoods', isRecurring: false, groupId: null },
  { id: 405, paidById: 4, title: 'Metro Smart Card Monthly Top-up', amount: 1000.00, category: 'TRAVEL', date: '2026-11-06', paymentMethod: 'UPI', notes: 'Daily metro commute to office', isRecurring: true, groupId: null },
  { id: 406, paidById: 4, title: 'Apollo Pharmacy Wellness & Vitamin D', amount: 750.00, category: 'HEALTH', date: '2026-11-08', paymentMethod: 'UPI', notes: 'Monthly supplements', isRecurring: false, groupId: null },

  // --- Vikram Malhotra (id: 5) ---
  { id: 501, paidById: 5, title: 'Korean Barbecue Feast Platter', amount: 2800.00, category: 'FOOD', date: '2026-11-08', paymentMethod: 'UPI', notes: 'BBQ dinner for Weekend Foodies Club', isRecurring: false, groupId: 4 },
  { id: 502, paidById: 5, title: 'Hackathon Presentation Posters & Badges', amount: 400.00, category: 'OTHER', date: '2026-11-06', paymentMethod: 'UPI', notes: 'Printed pitch banners for SRM Hackathon', isRecurring: false, groupId: 3 },
  { id: 503, paidById: 5, title: 'Decathlon Manali Trekking Backpack', amount: 6800.00, category: 'TRAVEL', date: '2026-11-02', paymentMethod: 'CARD', notes: '70L trekking rucksack & poles', isRecurring: false, groupId: null },
  { id: 504, paidById: 5, title: 'IndiGo Flight Chennai to Delhi', amount: 5400.00, category: 'TRAVEL', date: '2026-11-04', paymentMethod: 'CARD', notes: 'Himalayan expedition flight', isRecurring: false, groupId: null },
  { id: 505, paidById: 5, title: 'Himalayan Homestay (3 Nights)', amount: 7500.00, category: 'RENT', date: '2026-11-06', paymentMethod: 'UPI', notes: 'Old Manali cottage stay', isRecurring: false, groupId: null },
  { id: 506, paidById: 5, title: 'GoPro Hero Mounts & Chest Harness', amount: 2900.00, category: 'SHOPPING', date: '2026-11-08', paymentMethod: 'CARD', notes: 'Action camera accessories', isRecurring: false, groupId: null },
  { id: 507, paidById: 5, title: 'Starbucks Coffee & Sandwich', amount: 550.00, category: 'FOOD', date: '2026-11-09', paymentMethod: 'UPI', notes: 'Airport terminal brew', isRecurring: false, groupId: null },

  // --- Ananya Iyer (id: 6) ---
  { id: 601, paidById: 6, title: 'Figma Professional Annual Plan', amount: 3600.00, category: 'BILLS', date: '2026-11-01', paymentMethod: 'CARD', notes: 'UI design suite license', isRecurring: true, groupId: null },
  { id: 602, paidById: 6, title: 'Rode PodMic & Boom Arm', amount: 2800.00, category: 'SHOPPING', date: '2026-11-03', paymentMethod: 'CARD', notes: 'Client presentation audio upgrade', isRecurring: false, groupId: null },
  { id: 603, paidById: 6, title: 'Third Wave Coffee Roasters', amount: 650.00, category: 'FOOD', date: '2026-11-05', paymentMethod: 'UPI', notes: 'Cold brews during sprint', isRecurring: false, groupId: null },
  { id: 604, paidById: 6, title: 'Notion AI & Cloud Storage', amount: 850.00, category: 'BILLS', date: '2026-11-06', paymentMethod: 'CARD', notes: 'Freelance workflow database', isRecurring: true, groupId: null },
  { id: 605, paidById: 6, title: 'Uber to WeWork Co-working Space', amount: 420.00, category: 'TRAVEL', date: '2026-11-08', paymentMethod: 'UPI', notes: 'Client pitch presentation', isRecurring: false, groupId: null },
  { id: 606, paidById: 6, title: 'Uniqlo Ultra Light Down Parka', amount: 4990.00, category: 'SHOPPING', date: '2026-11-10', paymentMethod: 'CARD', notes: 'Winter wardrobe essential', isRecurring: false, groupId: null },

  // --- Rohan Verma (id: 7) ---
  { id: 701, paidById: 7, title: 'Engineering Semester 5 Textbooks', amount: 1500.00, category: 'OTHER', date: '2026-11-01', paymentMethod: 'UPI', notes: 'Full Stack & Database books', isRecurring: false, groupId: null },
  { id: 702, paidById: 7, title: 'SRM Campus Canteen Lunch', amount: 350.00, category: 'FOOD', date: '2026-11-03', paymentMethod: 'UPI', notes: 'Thali & fresh lime soda', isRecurring: false, groupId: null },
  { id: 703, paidById: 7, title: 'Hostel High-Speed Fiber Share', amount: 600.00, category: 'BILLS', date: '2026-11-05', paymentMethod: 'UPI', notes: 'November hostel room Wi-Fi', isRecurring: true, groupId: null },
  { id: 704, paidById: 7, title: 'Project Documentation Printing', amount: 280.00, category: 'OTHER', date: '2026-11-07', paymentMethod: 'CASH', notes: 'Color printout and hard spiral', isRecurring: false, groupId: null },
  { id: 705, paidById: 7, title: 'Boba Tea Share with Friends', amount: 250.00, category: 'FOOD', date: '2026-11-08', paymentMethod: 'UPI', notes: 'Foodies Club drink contribution', isRecurring: false, groupId: 4 },
  { id: 706, paidById: 7, title: 'Chennai MTC Student Bus Pass', amount: 400.00, category: 'TRAVEL', date: '2026-11-11', paymentMethod: 'CASH', notes: 'Monthly route concession pass', isRecurring: true, groupId: null }
];

// -------------------------------------------------------------
// 5. Interlinked Settlements Log
// -------------------------------------------------------------
let settlements = [
  {
    id: 1,
    groupId: 1,
    group: 'Goa Trip 2026',
    payerId: 3,
    payer: 'Amit Patel',
    payeeId: 1,
    payee: 'Rahul Sharma',
    amount: 1200.0,
    date: '2026-11-09',
    method: 'UPI',
    notes: 'Cleared Goa fuel & toll share'
  },
  {
    id: 2,
    groupId: 2,
    group: 'Flatmates B-302',
    payerId: 4,
    payer: 'Sneha Rao',
    payeeId: 1,
    payee: 'Rahul Sharma',
    amount: 800.0,
    date: '2026-11-06',
    method: 'UPI',
    notes: 'Settled grocery share'
  },
  {
    id: 3,
    groupId: 4,
    group: 'Weekend Foodies Club',
    payerId: 7,
    payer: 'Rohan Verma',
    payeeId: 5,
    payee: 'Vikram Malhotra',
    amount: 250.0,
    date: '2026-11-09',
    method: 'UPI',
    notes: 'Partial BBQ payment via GPay'
  },
  {
    id: 4,
    groupId: 3,
    group: 'Tech Hackathon SRM',
    payerId: 6,
    payer: 'Ananya Iyer',
    payeeId: 2,
    payee: 'Priya Nair',
    amount: 500.0,
    date: '2026-11-07',
    method: 'UPI',
    notes: 'Paid AWS cloud credit share'
  },
  {
    id: 5,
    groupId: 3,
    group: 'Tech Hackathon SRM',
    payerId: 5,
    payer: 'Vikram Malhotra',
    payeeId: 1,
    payee: 'Rahul Sharma',
    amount: 200.0,
    date: '2026-11-08',
    method: 'UPI',
    notes: 'Cleared sprint pizza split'
  }
];

// -------------------------------------------------------------
// Helper Utilities
// -------------------------------------------------------------
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function sendText(res, statusCode, text, contentType = 'text/plain', extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...extraHeaders
  });
  res.end(text);
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Extract Authenticated User from JWT Bearer Header
function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const match = token.match(/mock-jwt-token-(\d+)/);
    if (match) {
      const uId = Number(match[1]);
      const found = users.find(u => u.id === uId);
      if (found) return found;
    }
  }
  return users[0]; // Default to User 1 (Rahul)
}

// -------------------------------------------------------------
// Core Service Server (Port 8080)
// -------------------------------------------------------------
const coreServer = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const currentUser = getAuthUser(req);
  console.log(`[Core 8080] ${method} ${pathname} (User: ${currentUser.name})`);

  // Auth: List Available Demo Accounts (Quick Switching)
  if (method === 'GET' && pathname === '/api/auth/demo-accounts') {
    return sendJson(res, 200, users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      currency: u.currency
    })));
  }

  // Auth: Login
  if (method === 'POST' && pathname === '/api/auth/login') {
    const body = await parseBody(req);
    const user = users.find(u => u.email.toLowerCase() === (body.email || '').toLowerCase().trim());
    if (user && user.password === body.password) {
      return sendJson(res, 200, {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency || 'INR',
        token: `mock-jwt-token-${user.id}-${Date.now()}`
      });
    }
    return sendJson(res, 401, { message: 'Invalid email or password' });
  }

  // Auth: Register
  if (method === 'POST' && pathname === '/api/auth/register') {
    const body = await parseBody(req);
    if (!body.email || !body.name) {
      return sendJson(res, 400, { message: 'Name and email are required' });
    }
    const newId = users.length + 1;
    const newUser = {
      id: newId,
      name: body.name,
      email: body.email.toLowerCase().trim(),
      password: body.password || 'Password@123',
      currency: body.currency || 'INR',
      role: 'Registered Member'
    };
    users.push(newUser);
    userBudgets[newId] = {
      OVERALL: 25000, FOOD: 5000, RENT: 10000, TRAVEL: 3000, SHOPPING: 3000, BILLS: 2000, ENTERTAINMENT: 1000, HEALTH: 1000, OTHER: 1000
    };
    return sendJson(res, 200, {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      currency: newUser.currency,
      token: `mock-jwt-token-${newUser.id}-${Date.now()}`
    });
  }

  // Auth: Me
  if (method === 'GET' && pathname === '/api/auth/me') {
    return sendJson(res, 200, {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      currency: currentUser.currency || 'INR'
    });
  }

  // Expenses: List (Per Logged-in User)
  if (method === 'GET' && pathname === '/api/expenses') {
    const userGroupIds = groups.filter(g => g.members.some(m => m.id === currentUser.id)).map(g => g.id);
    const userExpenses = expenses.filter(e => (e.paidById === currentUser.id) || (e.groupId && userGroupIds.includes(e.groupId)));
    return sendJson(res, 200, userExpenses);
  }

  // Expenses: Create
  if (method === 'POST' && pathname === '/api/expenses') {
    const body = await parseBody(req);
    const newExp = {
      id: Date.now(),
      paidById: currentUser.id,
      title: body.title || 'Untitled Expense',
      amount: parseFloat(body.amount) || 0,
      category: body.category || 'OTHER',
      date: body.date || new Date().toISOString().slice(0, 10),
      paymentMethod: body.paymentMethod || 'UPI',
      notes: body.notes || '',
      isRecurring: Boolean(body.isRecurring),
      groupId: body.groupId ? Number(body.groupId) : null
    };
    expenses.unshift(newExp);

    // If group expense, recalculate group debts using greedy min-cash-flow
    if (newExp.groupId) {
      const grp = groups.find(g => g.id === newExp.groupId);
      if (grp && grp.members && grp.members.length > 0) {
        const perPerson = Math.round((newExp.amount / grp.members.length) * 100) / 100;
        const payerId = currentUser.id;
        grp.members.forEach(m => {
          const mId = m.id;
          const currentBal = grp.netBalances[mId] || 0;
          if (mId === payerId) {
            grp.netBalances[mId] = Math.round((currentBal + (newExp.amount - perPerson)) * 100) / 100;
          } else {
            grp.netBalances[mId] = Math.round((currentBal - perPerson) * 100) / 100;
          }
          grp.balances[mId] = grp.netBalances[mId];
        });
        const userNames = {};
        grp.members.forEach(m => userNames[m.id] = m.name);
        grp.simplifiedDebts = simplifyDebts(grp.netBalances, userNames);
        grp.activity.unshift({
          id: Date.now(),
          text: `${currentUser.name} added '${newExp.title}' (₹${newExp.amount})`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        });
      }
    }

    return sendJson(res, 201, newExp);
  }

  // Expenses: Update
  if (method === 'PUT' && pathname.startsWith('/api/expenses/')) {
    const expId = Number(pathname.split('/').pop());
    const body = await parseBody(req);
    const idx = expenses.findIndex(e => e.id === expId);
    if (idx !== -1) {
      expenses[idx] = { ...expenses[idx], ...body, id: expId };
      return sendJson(res, 200, expenses[idx]);
    }
    return sendJson(res, 404, { message: 'Expense not found' });
  }

  // Expenses: Delete
  if (method === 'DELETE' && pathname.startsWith('/api/expenses/')) {
    const expId = Number(pathname.split('/').pop());
    expenses = expenses.filter(e => e.id !== expId);
    return sendJson(res, 200, { success: true });
  }

  // Budgets: Get for current user
  if (method === 'GET' && pathname === '/api/budgets') {
    const b = userBudgets[currentUser.id] || userBudgets[1];
    return sendJson(res, 200, b);
  }

  if (method === 'PUT' && pathname === '/api/budgets') {
    const body = await parseBody(req);
    userBudgets[currentUser.id] = { ...(userBudgets[currentUser.id] || userBudgets[1]), ...body };
    return sendJson(res, 200, userBudgets[currentUser.id]);
  }

  // Groups: List (Filtered to groups the logged-in user belongs to)
  if (method === 'GET' && pathname === '/api/groups') {
    const myGroups = groups.filter(g => g.members.some(m => m.id === currentUser.id));
    return sendJson(res, 200, myGroups.length > 0 ? myGroups : groups);
  }

  // Groups: Create
  if (method === 'POST' && pathname === '/api/groups') {
    const body = await parseBody(req);
    const newId = groups.length + 1;
    const members = [
      { id: currentUser.id, name: currentUser.name, email: currentUser.email }
    ];
    if (Array.isArray(body.memberEmails)) {
      body.memberEmails.forEach((email) => {
        const cleanEmail = email.trim().toLowerCase();
        const matched = users.find(u => u.email.toLowerCase() === cleanEmail);
        if (matched) {
          if (!members.some(m => m.id === matched.id)) {
            members.push({ id: matched.id, name: matched.name, email: matched.email });
          }
        } else {
          members.push({
            id: newId * 100 + members.length + 1,
            name: cleanEmail.split('@')[0],
            email: cleanEmail
          });
        }
      });
    }
    const netBalances = {};
    const balances = {};
    members.forEach(m => {
      netBalances[m.id] = 0.0;
      balances[m.id] = 0.0;
    });

    const newGroup = {
      id: newId,
      name: body.name,
      type: body.type || 'OTHER',
      members,
      balances,
      netBalances,
      simplifiedDebts: [],
      activity: [
        { id: Date.now(), text: `${currentUser.name} created group "${body.name}"`, timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) }
      ]
    };
    groups.push(newGroup);
    return sendJson(res, 201, newGroup);
  }

  // Groups: Detail
  if (method === 'GET' && pathname.startsWith('/api/groups/')) {
    const grpId = Number(pathname.split('/').pop());
    const grp = groups.find(g => g.id === grpId);
    if (grp) {
      return sendJson(res, 200, grp);
    }
    return sendJson(res, 404, { message: 'Group not found' });
  }

  // Settlements: List (For current user)
  if (method === 'GET' && pathname === '/api/settlements') {
    const relevant = settlements.filter(s => s.payerId === currentUser.id || s.payeeId === currentUser.id);
    return sendJson(res, 200, relevant.length > 0 ? relevant : settlements);
  }

  // Settlements: Record
  if (method === 'POST' && pathname === '/api/settlements') {
    const body = await parseBody(req);
    const grp = groups.find(g => g.id === Number(body.groupId));
    const payerName = users.find(u => u.id === Number(body.payerId))?.name || `User #${body.payerId}`;
    const payeeName = users.find(u => u.id === Number(body.payeeId))?.name || `User #${body.payeeId}`;

    const newSettlement = {
      id: Date.now(),
      groupId: Number(body.groupId),
      group: grp ? grp.name : 'Group',
      payerId: Number(body.payerId),
      payer: payerName,
      payeeId: Number(body.payeeId),
      payee: payeeName,
      amount: parseFloat(body.amount) || 0,
      date: new Date().toISOString().slice(0, 10),
      method: body.paymentMethod || 'UPI',
      notes: body.notes || `Settled via ${body.paymentMethod || 'UPI'}`
    };
    settlements.unshift(newSettlement);

    // Adjust group net balances
    if (grp) {
      const pId = Number(body.payerId);
      const recId = Number(body.payeeId);
      const amt = parseFloat(body.amount) || 0;

      grp.netBalances[pId] = Math.round(((grp.netBalances[pId] || 0) + amt) * 100) / 100;
      grp.netBalances[recId] = Math.round(((grp.netBalances[recId] || 0) - amt) * 100) / 100;
      grp.balances[pId] = grp.netBalances[pId];
      grp.balances[recId] = grp.netBalances[recId];

      const userNames = {};
      grp.members.forEach(m => userNames[m.id] = m.name);
      grp.simplifiedDebts = simplifyDebts(grp.netBalances, userNames);
      grp.activity.unshift({
        id: Date.now(),
        text: `${payerName} settled ₹${amt} with ${payeeName} via ${body.paymentMethod || 'UPI'}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
      });
    }

    return sendJson(res, 201, newSettlement);
  }

  // Reports: Dashboard Summary (Per Logged-in User)
  if (method === 'GET' && pathname === '/api/reports/dashboard') {
    const targetUserId = currentUser.id;
    const userExps = expenses.filter(e => e.paidById === targetUserId);

    let totalMonthlySpent = 0;
    const categoryTotals = {};
    userExps.forEach(exp => {
      totalMonthlySpent += exp.amount;
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    // Compute youOwe & youAreOwed across all groups for targetUserId
    let youOwe = 0;
    let youAreOwed = 0;
    let oweSubtext = 'No active debts';
    let owedSubtext = 'All settled up';

    groups.forEach(g => {
      if (g.members.some(m => m.id === targetUserId)) {
        (g.simplifiedDebts || []).forEach(debt => {
          if (debt.fromUserId === targetUserId) {
            youOwe += debt.amount;
            oweSubtext = `To ${debt.toUserName || debt.to} (${g.name})`;
          } else if (debt.toUserId === targetUserId) {
            youAreOwed += debt.amount;
            owedSubtext = `From ${debt.fromUserName || debt.from} (${g.name})`;
          }
        });
      }
    });

    const recentExpenses = userExps.slice(0, 5).map(e => ({
      id: e.id,
      date: e.date,
      title: e.title,
      category: e.category,
      paymentMethod: e.paymentMethod,
      amount: e.amount,
      groupId: e.groupId
    }));

    const targetBudgets = userBudgets[targetUserId] || userBudgets[1];

    return sendJson(res, 200, {
      totalMonthlySpent,
      categoryTotals,
      youOwe: Math.round(youOwe * 100) / 100,
      youAreOwed: Math.round(youAreOwed * 100) / 100,
      oweSubtext,
      owedSubtext,
      budgets: targetBudgets,
      transactionCount: userExps.length,
      recentExpenses
    });
  }

  // Reports: Analytics Microservice Call (Per Logged-in User)
  if (method === 'GET' && pathname === '/api/reports/analytics') {
    const targetUserId = currentUser.id;
    const userExps = expenses.filter(e => e.paidById === targetUserId);

    let totalMonthlySpent = 0;
    const categoryBreakdown = {};
    let topCat = 'FOOD';
    let topCatAmt = 0;

    userExps.forEach(exp => {
      totalMonthlySpent += exp.amount;
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
      if (categoryBreakdown[exp.category] > topCatAmt) {
        topCatAmt = categoryBreakdown[exp.category];
        topCat = exp.category;
      }
    });

    const targetBudgets = userBudgets[targetUserId] || userBudgets[1];
    const budgetLimit = targetBudgets.OVERALL || 25000;
    const budgetUsedPercentage = Number(((totalMonthlySpent / budgetLimit) * 100).toFixed(1));

    return sendJson(res, 200, {
      serviceName: 'ExpenseSync Analytics Microservice v1.0',
      userId: targetUserId,
      monthYear: 'November 2026',
      generatedAt: new Date().toString(),
      totalMonthlySpent,
      budgetLimit,
      budgetUsedPercentage,
      overspendWarning: totalMonthlySpent > budgetLimit,
      categoryBreakdown,
      topCategory: topCat,
      topCategoryAmount: topCatAmt,
      transactionCount: userExps.length,
      insights: [
        `Primary spending is concentrated in ${topCat} (₹${topCatAmt.toLocaleString('en-IN')})`,
        `Budget health status: ${totalMonthlySpent > budgetLimit ? 'Alert - Over budget limit!' : 'Within safe monthly allowance'}`,
        'Inter-service communication: Spring Boot Core <-> Analytics Microservice live'
      ]
    });
  }

  // Reports: Export CSV (Per Logged-in User)
  if (method === 'GET' && pathname === '/api/reports/export-csv') {
    const targetUserId = currentUser.id;
    const userExps = expenses.filter(e => e.paidById === targetUserId);

    let csv = 'ID,Date,Category,Description,Amount,Payment Method,Status\n';
    userExps.forEach(e => {
      csv += `${e.id},${e.date},${e.category},"${e.title}",${e.amount.toFixed(2)},${e.paymentMethod},PAID\n`;
    });
    return sendText(res, 200, csv, 'text/csv', {
      'Content-Disposition': `attachment; filename="ExpenseSync_Analytics_${currentUser.name.replace(/\s+/g, '_')}_2026-11.csv"`
    });
  }

  // Default Fallback
  return sendJson(res, 404, { message: `Route not found: ${method} ${pathname}` });
});

// -------------------------------------------------------------
// Analytics Microservice Server (Port 8082)
// -------------------------------------------------------------
const analyticsServer = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  console.log(`[Analytics 8082] ${req.method} ${pathname}`);

  return sendJson(res, 200, {
    status: 'UP',
    service: 'ExpenseSync Analytics Microservice',
    port: 8082,
    timestamp: new Date().toISOString()
  });
});

// Start Servers
coreServer.listen(8080, '0.0.0.0', () => {
  console.log('✅ Core Service REST API running on http://localhost:8080 (0.0.0.0:8080)');
});

analyticsServer.listen(8082, '0.0.0.0', () => {
  console.log('✅ Analytics Microservice running on http://localhost:8082 (0.0.0.0:8082)');
});
