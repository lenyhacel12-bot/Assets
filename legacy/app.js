/* ===========================================================
   ✨ Pastel Finance Tracker — app.js
   All data persists in localStorage. Currency = Philippine Peso.
   =========================================================== */

const STORAGE_KEY = "pastelFinance.v1";

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const peso = (n) =>
  "₱" + (Math.round((num(n) + Number.EPSILON) * 100) / 100).toLocaleString("en-PH", {
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  });
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const thisMonth = () => new Date().toISOString().slice(0, 7);

function monthsBetween(a, b) {
  // (b - a) in whole months for "YYYY-MM" strings
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}
function addMonths(ym, k) {
  let [y, m] = ym.split("-").map(Number);
  const total = y * 12 + (m - 1) + k;
  y = Math.floor(total / 12);
  m = (total % 12) + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}
function monthLabel(ym) {
  if (!ym) return "—";
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const PALETTE = ["#FFD6D6", "#CDEFFD", "#D3D3F7", "#D2FBE7", "#F9FACB",
  "#ffb3c0", "#a7d8f0", "#c0c0f0", "#9fe8c4", "#f3ecae"];

/* ---------- State ---------- */
let state = load();

function blankState() {
  return {
    assets: [], liabilities: [],
    income: {}, expenses: {},
    shortcuts: [],
    budgets: {},
    history: [],
    rentals: [], funds: [], loans: [], installments: [], goals: [],
  };
}

function seed() {
  const m = thisMonth();
  const prev = addMonths(m, -1);
  return {
    assets: [
      { id: uid(), name: "BPI Savings", category: "Cash", value: 85000 },
      { id: uid(), name: "Condo Unit", category: "Real Estate", value: 2400000 },
      { id: uid(), name: "BDO Stocks", category: "Stocks", value: 130000 },
      { id: uid(), name: "Honda Click", category: "Vehicle", value: 95000 },
    ],
    liabilities: [
      { id: uid(), name: "Credit Card Balance", value: 28000 },
      { id: uid(), name: "Car Loan", value: 180000 },
    ],
    income: {
      [m]: [
        { id: uid(), source: "Work", label: "Salary", amount: 45000 },
        { id: uid(), source: "Dividends", label: "BDO dividend", amount: 3200 },
      ],
      [prev]: [{ id: uid(), source: "Work", label: "Salary", amount: 45000 }],
    },
    expenses: {
      [m]: [
        { id: uid(), category: "Food", label: "Groceries", amount: 9000 },
        { id: uid(), category: "Rent-Utilities", label: "Electric + water", amount: 6500 },
        { id: uid(), category: "Transportation", label: "Gas", amount: 3000 },
      ],
      [prev]: [{ id: uid(), category: "Food", label: "Groceries", amount: 8500 }],
    },
    shortcuts: [
      { id: uid(), type: "expense", label: "Coffee ☕", category: "Food", amount: 180 },
      { id: uid(), type: "expense", label: "Grab 🚕", category: "Transportation", amount: 250 },
      { id: uid(), type: "income", label: "Freelance 💻", category: "Business", amount: 5000 },
    ],
    budgets: { Food: 12000, "Rent-Utilities": 8000, Transportation: 4000, Entertainment: 3000 },
    history: [
      { id: uid(), month: addMonths(m, -3), netWorth: 2300000 },
      { id: uid(), month: addMonths(m, -2), netWorth: 2380000 },
      { id: uid(), month: prev, netWorth: 2450000 },
    ],
    rentals: [
      { id: uid(), name: "Studio Apt A", monthlyIncome: 15000, monthlyExpenses: 4000 },
    ],
    funds: [
      { id: uid(), name: "ALFM Growth Fund", invested: 50000, current: 58500 },
      { id: uid(), name: "Sun Life Equity", invested: 40000, current: 37800 },
    ],
    loans: [
      { id: uid(), bank: "BPI", type: "Personal", creditLimit: 300000, remaining: 180000,
        loanAmount: 250000, interestRate: 1.2, interest: 18000, dateStarted: addMonths(m, -6) + "-01",
        terms: 24, monthlyPayment: 11500, proceedsTo: "Home reno", dueDate: addMonths(m, 18) + "-01" },
    ],
    installments: [
      { id: uid(), card: "Metrobank", merchant: "iPhone 15", category: "Personal",
        monthlyAmount: 4500, terms: 12, startMonth: addMonths(m, -2) },
      { id: uid(), card: "BPI", merchant: "VPS Hosting", category: "VPS",
        monthlyAmount: 1200, terms: 6, startMonth: m },
    ],
    goals: [
      { id: uid(), name: "Emergency Fund 🐷", target: 200000, current: 120000, deadline: addMonths(m, 8) },
      { id: uid(), name: "Japan Trip ✈️", target: 150000, current: 40000, deadline: addMonths(m, 11) },
    ],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return Object.assign(blankState(), JSON.parse(raw));
  } catch (e) { console.warn("Load failed", e); }
  const s = seed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  return s;
}

let saveTimer = null;
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const el = $("savedIndicator");
  el.classList.add("show");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => el.classList.remove("show"), 1100);
}

/* ---------- Computed totals ---------- */
const sum = (arr, f) => arr.reduce((a, x) => a + num(f(x)), 0);
const totalAssets = () => sum(state.assets, (a) => a.value) + sum(state.funds, (f) => f.current);
const totalLiabilities = () => sum(state.liabilities, (l) => l.value);
const netWorth = () => totalAssets() - totalLiabilities();
const rentalNet = () => sum(state.rentals, (r) => num(r.monthlyIncome) - num(r.monthlyExpenses));
const monthlyIncome = (m) => sum(state.income[m] || [], (i) => i.amount) + rentalNet();
const monthlyExpenses = (m) => sum(state.expenses[m] || [], (e) => e.amount);

/* ---------- Charts registry ---------- */
const charts = {};
function drawChart(id, config) {
  if (charts[id]) charts[id].destroy();
  const ctx = $(id);
  if (!ctx) return;
  charts[id] = new Chart(ctx, config);
}
Chart.defaults.font.family = '"Helvetica Neue", Helvetica, Arial, sans-serif';
Chart.defaults.font.weight = "700";
Chart.defaults.color = "#8a85a0";

/* ===========================================================
   TAB NAVIGATION
   =========================================================== */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    $("panel-" + tab.dataset.tab).classList.add("active");
    renderAll();
  });
});

/* ===========================================================
   ASSETS & LIABILITIES
   =========================================================== */
let editAsset = null, editLiab = null;

$("addAssetBtn").onclick = () => {
  const name = $("assetName").value.trim();
  if (!name) return;
  state.assets.push({ id: uid(), name, category: $("assetCategory").value, value: num($("assetValue").value) });
  $("assetName").value = ""; $("assetValue").value = "";
  save(); renderAssets(); renderDashboard();
};
$("addLiabBtn").onclick = () => {
  const name = $("liabName").value.trim();
  if (!name) return;
  state.liabilities.push({ id: uid(), name, value: num($("liabValue").value) });
  $("liabName").value = ""; $("liabValue").value = "";
  save(); renderAssets(); renderDashboard();
};

function renderAssets() {
  const cats = ["Cash", "Real Estate", "Stocks", "Mutual Fund", "Vehicle", "Other"];
  let h = `<tr><th>Name</th><th>Category</th><th class="num">Value</th><th>Actions</th></tr>`;
  if (!state.assets.length) h += `<tr><td colspan="4" class="empty">No assets yet 🌸</td></tr>`;
  state.assets.forEach((a) => {
    if (editAsset === a.id) {
      h += `<tr>
        <td><input id="ea-name" value="${esc(a.name)}"></td>
        <td><select id="ea-cat">${cats.map((c) => `<option ${c === a.category ? "selected" : ""}>${c}</option>`).join("")}</select></td>
        <td><input id="ea-val" type="number" value="${a.value}"></td>
        <td class="row-actions">
          <button class="btn btn-tiny btn-save" onclick="saveAsset('${a.id}')">Save</button>
          <button class="btn btn-tiny btn-cancel" onclick="cancelEdit('asset')">Cancel</button>
        </td></tr>`;
    } else {
      h += `<tr>
        <td>${esc(a.name)}</td><td>${esc(a.category)}</td><td class="num">${peso(a.value)}</td>
        <td class="row-actions">
          <button class="btn btn-tiny btn-ghost" onclick="startEdit('asset','${a.id}')">Edit</button>
          <button class="btn btn-tiny btn-del" onclick="del('assets','${a.id}', renderAssets)">Delete</button>
        </td></tr>`;
    }
  });
  $("assetsTable").innerHTML = h;

  let l = `<tr><th>Name</th><th class="num">Value</th><th>Actions</th></tr>`;
  if (!state.liabilities.length) l += `<tr><td colspan="3" class="empty">No liabilities — yay! 💕</td></tr>`;
  state.liabilities.forEach((x) => {
    if (editLiab === x.id) {
      l += `<tr>
        <td><input id="el-name" value="${esc(x.name)}"></td>
        <td><input id="el-val" type="number" value="${x.value}"></td>
        <td class="row-actions">
          <button class="btn btn-tiny btn-save" onclick="saveLiab('${x.id}')">Save</button>
          <button class="btn btn-tiny btn-cancel" onclick="cancelEdit('liab')">Cancel</button>
        </td></tr>`;
    } else {
      l += `<tr><td>${esc(x.name)}</td><td class="num">${peso(x.value)}</td>
        <td class="row-actions">
          <button class="btn btn-tiny btn-ghost" onclick="startEdit('liab','${x.id}')">Edit</button>
          <button class="btn btn-tiny btn-del" onclick="del('liabilities','${x.id}', renderAssets)">Delete</button>
        </td></tr>`;
    }
  });
  $("liabTable").innerHTML = l;
  $("assetsNetWorth").textContent = peso(netWorth());
}
window.saveAsset = (id) => {
  const a = state.assets.find((x) => x.id === id);
  a.name = $("ea-name").value.trim() || a.name;
  a.category = $("ea-cat").value;
  a.value = num($("ea-val").value);
  editAsset = null; save(); renderAssets(); renderDashboard();
};
window.saveLiab = (id) => {
  const x = state.liabilities.find((v) => v.id === id);
  x.name = $("el-name").value.trim() || x.name;
  x.value = num($("el-val").value);
  editLiab = null; save(); renderAssets(); renderDashboard();
};

/* ===========================================================
   INCOME & EXPENSES
   =========================================================== */
let editInc = null, editExp = null;
$("ieMonth").value = thisMonth();
$("ieMonth").onchange = () => { renderIncome(); };

function curIE() { return $("ieMonth").value || thisMonth(); }

$("addIncomeBtn").onclick = () => {
  const m = curIE();
  (state.income[m] ||= []).push({
    id: uid(), source: $("incSource").value, label: $("incLabel").value.trim(), amount: num($("incAmount").value),
  });
  $("incLabel").value = ""; $("incAmount").value = "";
  save(); renderIncome(); renderDashboard();
};
$("addExpenseBtn").onclick = () => {
  const m = curIE();
  (state.expenses[m] ||= []).push({
    id: uid(), category: $("expCategory").value, label: $("expLabel").value.trim(), amount: num($("expAmount").value),
  });
  $("expLabel").value = ""; $("expAmount").value = "";
  save(); renderIncome(); renderDashboard(); renderBudget();
};

/* Shortcuts */
$("addShortcutBtn").onclick = () => {
  const label = $("scLabel").value.trim();
  if (!label) return;
  state.shortcuts.push({
    id: uid(), type: $("scType").value, label,
    category: $("scCategory").value.trim() || "Other", amount: num($("scAmount").value),
  });
  $("scLabel").value = ""; $("scCategory").value = ""; $("scAmount").value = "";
  save(); renderShortcuts();
};
function renderShortcuts() {
  const btns = state.shortcuts.map((s) =>
    `<button class="shortcut-chip ${s.type === "income" ? "inc" : "exp"}" onclick="fireShortcut('${s.id}')">
      ${s.type === "income" ? "➕" : "➖"} ${esc(s.label)} · ${peso(s.amount)}</button>`).join("");
  $("shortcutButtons").innerHTML = btns || `<span class="hint">No shortcuts yet — add some below ⬇️</span>`;
  $("shortcutList").innerHTML = state.shortcuts.map((s) =>
    `<div class="sc-row"><span>${s.type === "income" ? "💵" : "🧾"} <b>${esc(s.label)}</b> · ${esc(s.category)} · ${peso(s.amount)}</span>
      <button class="btn btn-tiny btn-del" onclick="del('shortcuts','${s.id}', renderShortcuts)">Delete</button></div>`).join("");
}
window.fireShortcut = (id) => {
  const s = state.shortcuts.find((x) => x.id === id);
  if (!s) return;
  const m = curIE();
  if (s.type === "income") (state.income[m] ||= []).push({ id: uid(), source: s.category, label: s.label, amount: s.amount });
  else (state.expenses[m] ||= []).push({ id: uid(), category: s.category, label: s.label, amount: s.amount });
  save(); renderIncome(); renderDashboard(); renderBudget();
};

function renderIncome() {
  const m = curIE();
  const inc = state.income[m] || [], exp = state.expenses[m] || [];
  const srcs = ["Work", "Business", "Investments", "Dividends", "Stocks", "Other"];
  const cats = ["Food", "Rent-Utilities", "Transportation", "Health", "Education", "Entertainment", "Other"];

  let ih = `<tr><th>Source</th><th>Label</th><th class="num">Amount</th><th>Actions</th></tr>`;
  if (!inc.length) ih += `<tr><td colspan="4" class="empty">No income this month 🌸</td></tr>`;
  inc.forEach((i) => {
    if (editInc === i.id) {
      ih += `<tr>
        <td><select id="ei-src">${srcs.map((s) => `<option ${s === i.source ? "selected" : ""}>${s}</option>`).join("")}</select></td>
        <td><input id="ei-label" value="${esc(i.label)}"></td>
        <td><input id="ei-amt" type="number" value="${i.amount}"></td>
        <td class="row-actions"><button class="btn btn-tiny btn-save" onclick="saveInc('${i.id}')">Save</button>
          <button class="btn btn-tiny btn-cancel" onclick="cancelEdit('inc')">Cancel</button></td></tr>`;
    } else {
      ih += `<tr><td>${esc(i.source)}</td><td>${esc(i.label)}</td><td class="num">${peso(i.amount)}</td>
        <td class="row-actions"><button class="btn btn-tiny btn-ghost" onclick="startEdit('inc','${i.id}')">Edit</button>
          <button class="btn btn-tiny btn-del" onclick="delMonth('income','${m}','${i.id}')">Delete</button></td></tr>`;
    }
  });
  ih += `<tr><td colspan="2" style="text-align:right;font-weight:800">Total + rentals (${peso(rentalNet())})</td><td class="num" style="font-weight:800">${peso(monthlyIncome(m))}</td><td></td></tr>`;
  $("incomeTable").innerHTML = ih;

  let eh = `<tr><th>Category</th><th>Label</th><th class="num">Amount</th><th>Actions</th></tr>`;
  if (!exp.length) eh += `<tr><td colspan="4" class="empty">No expenses this month 💕</td></tr>`;
  exp.forEach((e) => {
    if (editExp === e.id) {
      eh += `<tr>
        <td><select id="ee-cat">${cats.map((c) => `<option ${c === e.category ? "selected" : ""}>${c}</option>`).join("")}</select></td>
        <td><input id="ee-label" value="${esc(e.label || "")}"></td>
        <td><input id="ee-amt" type="number" value="${e.amount}"></td>
        <td class="row-actions"><button class="btn btn-tiny btn-save" onclick="saveExp('${e.id}')">Save</button>
          <button class="btn btn-tiny btn-cancel" onclick="cancelEdit('exp')">Cancel</button></td></tr>`;
    } else {
      eh += `<tr><td>${esc(e.category)}</td><td>${esc(e.label || "")}</td><td class="num">${peso(e.amount)}</td>
        <td class="row-actions"><button class="btn btn-tiny btn-ghost" onclick="startEdit('exp','${e.id}')">Edit</button>
          <button class="btn btn-tiny btn-del" onclick="delMonth('expenses','${m}','${e.id}')">Delete</button></td></tr>`;
    }
  });
  eh += `<tr><td colspan="2" style="text-align:right;font-weight:800">Total</td><td class="num" style="font-weight:800">${peso(monthlyExpenses(m))}</td><td></td></tr>`;
  $("expenseTable").innerHTML = eh;

  // charts
  donutFromGroups("chartIncome", inc, "source", "amount", "No income data");
  donutFromGroups("chartExpense", exp, "category", "amount", "No expense data");
  renderShortcuts();
}
window.saveInc = (id) => {
  const i = (state.income[curIE()] || []).find((x) => x.id === id);
  i.source = $("ei-src").value; i.label = $("ei-label").value.trim(); i.amount = num($("ei-amt").value);
  editInc = null; save(); renderIncome(); renderDashboard();
};
window.saveExp = (id) => {
  const e = (state.expenses[curIE()] || []).find((x) => x.id === id);
  e.category = $("ee-cat").value; e.label = $("ee-label").value.trim(); e.amount = num($("ee-amt").value);
  editExp = null; save(); renderIncome(); renderDashboard(); renderBudget();
};
window.delMonth = (bucket, m, id) => {
  if (!confirm("Delete this entry?")) return;
  state[bucket][m] = (state[bucket][m] || []).filter((x) => x.id !== id);
  save(); renderIncome(); renderDashboard(); renderBudget();
};

function donutFromGroups(canvasId, rows, key, valKey, emptyMsg) {
  const groups = {};
  rows.forEach((r) => { groups[r[key] || "Other"] = (groups[r[key] || "Other"] || 0) + num(r[valKey]); });
  const labels = Object.keys(groups);
  if (!labels.length) { drawEmpty(canvasId, emptyMsg); return; }
  drawChart(canvasId, {
    type: "doughnut",
    data: { labels, datasets: [{ data: labels.map((l) => groups[l]), backgroundColor: PALETTE, borderWidth: 2, borderColor: "#fff" }] },
    options: { plugins: { legend: { position: "bottom" } }, cutout: "62%", maintainAspectRatio: false },
  });
}
function drawEmpty(canvasId, msg) {
  drawChart(canvasId, {
    type: "doughnut",
    data: { labels: [msg], datasets: [{ data: [1], backgroundColor: ["#f0ecf9"], borderWidth: 0 }] },
    options: { plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: "62%", maintainAspectRatio: false },
  });
}

/* ===========================================================
   BUDGET
   =========================================================== */
const EXP_CATS = ["Food", "Rent-Utilities", "Transportation", "Health", "Education", "Entertainment", "Other"];
$("budgetMonth").value = thisMonth();
$("budgetMonth").onchange = renderBudget;

function renderBudget() {
  const m = $("budgetMonth").value || thisMonth();
  $("budgetForm").innerHTML = EXP_CATS.map((c) =>
    `<div class="form-row" style="margin-bottom:6px">
      <label style="flex:1 1 140px;font-weight:800">${esc(c)}</label>
      <input type="number" style="flex:1 1 120px" value="${state.budgets[c] ?? ""}" placeholder="Budget ₱"
        onchange="setBudget('${c}', this.value)">
    </div>`).join("");

  const spent = {};
  (state.expenses[m] || []).forEach((e) => { spent[e.category] = (spent[e.category] || 0) + num(e.amount); });

  let h = "";
  EXP_CATS.forEach((c) => {
    const b = num(state.budgets[c]); const s = spent[c] || 0;
    if (!b && !s) return;
    const pct = b ? Math.min(100, (s / b) * 100) : 100;
    const over = b && s > b;
    h += `<div class="progress-item">
      <div class="progress-top"><span>${esc(c)}</span><span>${peso(s)} / ${b ? peso(b) : "—"}</span></div>
      <div class="progress-track"><div class="progress-fill ${over ? "over" : ""}" style="width:${pct}%"></div></div>
      ${over ? `<div class="progress-warn">⚠️ Over budget by ${peso(s - b)}!</div>` : ""}
    </div>`;
  });
  $("budgetProgress").innerHTML = h || `<div class="empty">Set a budget or add expenses for ${monthLabel(m)} 🌸</div>`;
}
window.setBudget = (c, v) => {
  const n = num(v);
  if (v === "" ) delete state.budgets[c]; else state.budgets[c] = n;
  save(); renderBudget();
};

/* ===========================================================
   HISTORY
   =========================================================== */
let editSnap = null;
$("snapMonth").value = thisMonth();
$("addSnapBtn").onclick = () => {
  const month = $("snapMonth").value;
  if (!month) return;
  state.history.push({ id: uid(), month, netWorth: num($("snapValue").value) });
  $("snapValue").value = "";
  save(); renderHistory();
};
function renderHistory() {
  const hist = [...state.history].sort((a, b) => a.month.localeCompare(b.month));
  let h = `<tr><th>Month</th><th class="num">Net Worth</th><th>Actions</th></tr>`;
  if (!hist.length) h += `<tr><td colspan="3" class="empty">No snapshots yet 📌</td></tr>`;
  hist.forEach((s) => {
    if (editSnap === s.id) {
      h += `<tr><td><input id="es-month" type="month" value="${s.month}"></td>
        <td><input id="es-val" type="number" value="${s.netWorth}"></td>
        <td class="row-actions"><button class="btn btn-tiny btn-save" onclick="saveSnap('${s.id}')">Save</button>
          <button class="btn btn-tiny btn-cancel" onclick="cancelEdit('snap')">Cancel</button></td></tr>`;
    } else {
      h += `<tr><td>${monthLabel(s.month)}</td><td class="num">${peso(s.netWorth)}</td>
        <td class="row-actions"><button class="btn btn-tiny btn-ghost" onclick="startEdit('snap','${s.id}')">Edit</button>
          <button class="btn btn-tiny btn-del" onclick="del('history','${s.id}', renderHistory)">Delete</button></td></tr>`;
    }
  });
  $("snapTable").innerHTML = h;

  // Net worth line
  if (hist.length) {
    drawChart("chartNetWorth", {
      type: "line",
      data: { labels: hist.map((s) => monthLabel(s.month)),
        datasets: [{ label: "Net Worth", data: hist.map((s) => s.netWorth),
          borderColor: "#b3a7e8", backgroundColor: "#D3D3F7aa", fill: true, tension: 0.35, pointRadius: 4 }] },
      options: { plugins: { legend: { display: false } }, maintainAspectRatio: false, scales: { y: { ticks: { callback: (v) => peso(v) } } } },
    });
  } else drawEmpty("chartNetWorth", "Add snapshots to see trend");

  // Income vs expenses trend
  const months = [...new Set([...Object.keys(state.income), ...Object.keys(state.expenses)])]
    .filter((m) => (state.income[m]?.length || state.expenses[m]?.length)).sort();
  if (months.length) {
    drawChart("chartTrend", {
      type: "line",
      data: { labels: months.map(monthLabel),
        datasets: [
          { label: "Income", data: months.map((m) => sum(state.income[m] || [], (i) => i.amount)),
            borderColor: "#5fcf9e", backgroundColor: "#D2FBE7aa", fill: true, tension: 0.35, pointRadius: 4 },
          { label: "Expenses", data: months.map((m) => monthlyExpenses(m)),
            borderColor: "#ff9db0", backgroundColor: "#FFD6D6aa", fill: true, tension: 0.35, pointRadius: 4 },
        ] },
      options: { plugins: { legend: { position: "bottom" } }, maintainAspectRatio: false, scales: { y: { ticks: { callback: (v) => peso(v) } } } },
    });
  } else drawEmpty("chartTrend", "Add income/expenses to see trend");
}
window.saveSnap = (id) => {
  const s = state.history.find((x) => x.id === id);
  s.month = $("es-month").value || s.month; s.netWorth = num($("es-val").value);
  editSnap = null; save(); renderHistory();
};

/* ===========================================================
   RENTALS
   =========================================================== */
let editRent = null;
$("addRentBtn").onclick = () => {
  const name = $("rentName").value.trim();
  if (!name) return;
  state.rentals.push({ id: uid(), name, monthlyIncome: num($("rentIncome").value), monthlyExpenses: num($("rentExpense").value) });
  $("rentName").value = ""; $("rentIncome").value = ""; $("rentExpense").value = "";
  save(); renderRentals(); renderDashboard(); renderIncome();
};
function renderRentals() {
  let h = `<tr><th>Property</th><th class="num">Income</th><th class="num">Expenses</th><th class="num">Net</th><th>Actions</th></tr>`;
  if (!state.rentals.length) h += `<tr><td colspan="5" class="empty">No properties yet 🏠</td></tr>`;
  state.rentals.forEach((r) => {
    const net = num(r.monthlyIncome) - num(r.monthlyExpenses);
    if (editRent === r.id) {
      h += `<tr><td><input id="er-name" value="${esc(r.name)}"></td>
        <td><input id="er-inc" type="number" value="${r.monthlyIncome}"></td>
        <td><input id="er-exp" type="number" value="${r.monthlyExpenses}"></td>
        <td class="num">—</td>
        <td class="row-actions"><button class="btn btn-tiny btn-save" onclick="saveRent('${r.id}')">Save</button>
          <button class="btn btn-tiny btn-cancel" onclick="cancelEdit('rent')">Cancel</button></td></tr>`;
    } else {
      h += `<tr><td>${esc(r.name)}</td><td class="num">${peso(r.monthlyIncome)}</td><td class="num">${peso(r.monthlyExpenses)}</td>
        <td class="num" style="font-weight:800;color:${net >= 0 ? "#2ba778" : "#e06a86"}">${peso(net)}</td>
        <td class="row-actions"><button class="btn btn-tiny btn-ghost" onclick="startEdit('rent','${r.id}')">Edit</button>
          <button class="btn btn-tiny btn-del" onclick="del('rentals','${r.id}', () => { renderRentals(); renderDashboard(); renderIncome(); })">Delete</button></td></tr>`;
    }
  });
  $("rentTable").innerHTML = h;
  $("rentTotal").textContent = peso(rentalNet());
}
window.saveRent = (id) => {
  const r = state.rentals.find((x) => x.id === id);
  r.name = $("er-name").value.trim() || r.name;
  r.monthlyIncome = num($("er-inc").value); r.monthlyExpenses = num($("er-exp").value);
  editRent = null; save(); renderRentals(); renderDashboard(); renderIncome();
};

/* ===========================================================
   MUTUAL FUNDS
   =========================================================== */
let editFund = null;
$("addFundBtn").onclick = () => {
  const name = $("fundName").value.trim();
  if (!name) return;
  state.funds.push({ id: uid(), name, invested: num($("fundInvested").value), current: num($("fundCurrent").value) });
  $("fundName").value = ""; $("fundInvested").value = ""; $("fundCurrent").value = "";
  save(); renderFunds(); renderDashboard();
};
function renderFunds() {
  let h = `<tr><th>Fund</th><th class="num">Invested</th><th class="num">Current</th><th class="num">Gain/Loss</th><th>Actions</th></tr>`;
  if (!state.funds.length) h += `<tr><td colspan="5" class="empty">No funds yet 🏦</td></tr>`;
  state.funds.forEach((f) => {
    const g = num(f.current) - num(f.invested);
    const pct = num(f.invested) ? (g / num(f.invested)) * 100 : 0;
    if (editFund === f.id) {
      h += `<tr><td><input id="ef-name" value="${esc(f.name)}"></td>
        <td><input id="ef-inv" type="number" value="${f.invested}"></td>
        <td><input id="ef-cur" type="number" value="${f.current}"></td>
        <td class="num">—</td>
        <td class="row-actions"><button class="btn btn-tiny btn-save" onclick="saveFund('${f.id}')">Save</button>
          <button class="btn btn-tiny btn-cancel" onclick="cancelEdit('fund')">Cancel</button></td></tr>`;
    } else {
      h += `<tr><td>${esc(f.name)}</td><td class="num">${peso(f.invested)}</td><td class="num">${peso(f.current)}</td>
        <td class="num" style="font-weight:800;color:${g >= 0 ? "#2ba778" : "#e06a86"}">${peso(g)} (${pct.toFixed(1)}%)</td>
        <td class="row-actions"><button class="btn btn-tiny btn-ghost" onclick="startEdit('fund','${f.id}')">Edit</button>
          <button class="btn btn-tiny btn-del" onclick="del('funds','${f.id}', () => { renderFunds(); renderDashboard(); })">Delete</button></td></tr>`;
    }
  });
  $("fundTable").innerHTML = h;
  const inv = sum(state.funds, (f) => f.invested), cur = sum(state.funds, (f) => f.current);
  $("fundInvestedTotal").textContent = peso(inv);
  $("fundCurrentTotal").textContent = peso(cur);
  const gEl = $("fundGainTotal");
  gEl.textContent = peso(cur - inv);
  gEl.className = "stat-value " + (cur - inv >= 0 ? "pos" : "neg");
}
window.saveFund = (id) => {
  const f = state.funds.find((x) => x.id === id);
  f.name = $("ef-name").value.trim() || f.name;
  f.invested = num($("ef-inv").value); f.current = num($("ef-cur").value);
  editFund = null; save(); renderFunds(); renderDashboard();
};

/* ===========================================================
   LOANS
   =========================================================== */
let editLoan = null;
$("addLoanBtn").onclick = () => {
  const bank = $("lnBank").value.trim();
  if (!bank) return;
  state.loans.push({
    id: uid(), bank, type: $("lnType").value.trim(),
    creditLimit: num($("lnLimit").value), remaining: num($("lnRemaining").value),
    loanAmount: num($("lnAmount").value), interestRate: num($("lnRate").value), interest: num($("lnInterest").value),
    dateStarted: $("lnStart").value, terms: num($("lnTerms").value), monthlyPayment: num($("lnMonthly").value),
    proceedsTo: $("lnProceeds").value.trim(), dueDate: $("lnDue").value,
  });
  ["lnBank","lnType","lnLimit","lnRemaining","lnAmount","lnRate","lnInterest","lnStart","lnTerms","lnMonthly","lnProceeds","lnDue"].forEach((i) => $(i).value = "");
  save(); renderLoans(); renderDashboard();
};
function renderLoans() {
  const cols = ["Bank","Type","Credit Limit","Remaining","Loan Amt","Rate %","Interest","Started","Terms","Monthly","Proceeds","Due","Actions"];
  let h = "<tr>" + cols.map((c) => `<th>${c}</th>`).join("") + "</tr>";
  if (!state.loans.length) h += `<tr><td colspan="${cols.length}" class="empty">No loans 💳</td></tr>`;
  state.loans.forEach((l) => {
    if (editLoan === l.id) {
      const f = (id, val, type = "text") => `<input id="${id}" type="${type}" value="${esc(val ?? "")}" style="min-width:90px">`;
      h += `<tr>
        <td>${f("eln-bank", l.bank)}</td><td>${f("eln-type", l.type)}</td>
        <td>${f("eln-limit", l.creditLimit, "number")}</td><td>${f("eln-rem", l.remaining, "number")}</td>
        <td>${f("eln-amt", l.loanAmount, "number")}</td><td>${f("eln-rate", l.interestRate, "number")}</td>
        <td>${f("eln-int", l.interest, "number")}</td><td>${f("eln-start", l.dateStarted, "date")}</td>
        <td>${f("eln-terms", l.terms, "number")}</td><td>${f("eln-monthly", l.monthlyPayment, "number")}</td>
        <td>${f("eln-proc", l.proceedsTo)}</td><td>${f("eln-due", l.dueDate, "date")}</td>
        <td class="row-actions"><button class="btn btn-tiny btn-save" onclick="saveLoan('${l.id}')">Save</button>
          <button class="btn btn-tiny btn-cancel" onclick="cancelEdit('loan')">Cancel</button></td></tr>`;
    } else {
      h += `<tr>
        <td>${esc(l.bank)}</td><td>${esc(l.type)}</td>
        <td class="num">${peso(l.creditLimit)}</td><td class="num">${peso(l.remaining)}</td>
        <td class="num">${peso(l.loanAmount)}</td><td class="num">${num(l.interestRate)}%</td>
        <td class="num">${peso(l.interest)}</td><td>${l.dateStarted || "—"}</td>
        <td class="num">${num(l.terms)}</td><td class="num">${peso(l.monthlyPayment)}</td>
        <td>${esc(l.proceedsTo)}</td><td>${l.dueDate || "—"}</td>
        <td class="row-actions"><button class="btn btn-tiny btn-ghost" onclick="startEdit('loan','${l.id}')">Edit</button>
          <button class="btn btn-tiny btn-del" onclick="del('loans','${l.id}', () => { renderLoans(); renderDashboard(); })">Delete</button></td></tr>`;
    }
  });
  $("loanTable").innerHTML = h;
  $("loanLimitTotal").textContent = peso(sum(state.loans, (l) => l.creditLimit));
  $("loanRemainTotal").textContent = peso(sum(state.loans, (l) => l.remaining));
  $("loanAmountTotal").textContent = peso(sum(state.loans, (l) => l.loanAmount));
  $("loanHulogTotal").textContent = peso(sum(state.loans, (l) => l.monthlyPayment));
}
window.saveLoan = (id) => {
  const l = state.loans.find((x) => x.id === id);
  l.bank = $("eln-bank").value.trim() || l.bank; l.type = $("eln-type").value.trim();
  l.creditLimit = num($("eln-limit").value); l.remaining = num($("eln-rem").value);
  l.loanAmount = num($("eln-amt").value); l.interestRate = num($("eln-rate").value);
  l.interest = num($("eln-int").value); l.dateStarted = $("eln-start").value;
  l.terms = num($("eln-terms").value); l.monthlyPayment = num($("eln-monthly").value);
  l.proceedsTo = $("eln-proc").value.trim(); l.dueDate = $("eln-due").value;
  editLoan = null; save(); renderLoans(); renderDashboard();
};

/* ===========================================================
   WHO'S PAYING (installments)
   =========================================================== */
let editInst = null;
$("instMonth").value = thisMonth();
$("instMonth").onchange = renderInstallments;
$("addInstBtn").onclick = () => {
  const card = $("inCard").value.trim();
  if (!card) return;
  state.installments.push({
    id: uid(), card, merchant: $("inMerchant").value.trim(), category: $("inCategory").value,
    monthlyAmount: num($("inAmount").value), terms: num($("inTerms").value), startMonth: $("inStart").value || thisMonth(),
  });
  $("inCard").value = ""; $("inMerchant").value = ""; $("inAmount").value = ""; $("inTerms").value = ""; $("inStart").value = "";
  save(); renderInstallments();
};

function instEndMonth(i) { return addMonths(i.startMonth, Math.max(0, num(i.terms) - 1)); }
function instStatus(i, m) {
  if (!i.startMonth) return { text: "Not started", badge: "gray" };
  const diff = monthsBetween(i.startMonth, m);
  if (diff < 0) return { text: "Not started", badge: "gray" };
  if (diff >= num(i.terms)) return { text: "Fully paid", badge: "green" };
  return { text: `Term ${diff + 1}/${num(i.terms)}`, badge: "blue" };
}
function instActiveInMonth(i, m) {
  if (!i.startMonth) return false;
  const diff = monthsBetween(i.startMonth, m);
  return diff >= 0 && diff < num(i.terms);
}

function renderInstallments() {
  const m = $("instMonth").value || thisMonth();
  const cats = ["Personal", "Investment", "VPS", "3F", "Other"];

  // Bill cards for this + next 2 months
  let bc = "";
  [0, 1, 2].forEach((k) => {
    const mm = addMonths(m, k);
    const total = sum(state.installments.filter((i) => instActiveInMonth(i, mm)), (i) => i.monthlyAmount);
    bc += `<div class="card stat" style="--accent:${k === 0 ? "var(--pink)" : "var(--blue)"}">
      <span class="stat-label">${k === 0 ? "📅 This month" : "🔜 " + monthLabel(mm)}</span>
      <span class="stat-value">${peso(total)}</span></div>`;
  });
  $("instBillCards").innerHTML = bc;

  // by card
  const byCard = {}, byCat = {};
  state.installments.filter((i) => instActiveInMonth(i, m)).forEach((i) => {
    byCard[i.card] = (byCard[i.card] || 0) + num(i.monthlyAmount);
    byCat[i.category] = (byCat[i.category] || 0) + num(i.monthlyAmount);
  });
  $("instByCard").innerHTML = miniList(byCard, "No active installments this month");
  $("instByCategory").innerHTML = miniList(byCat, "No active installments this month");

  // table
  const cols = ["Card","Merchant","Category","Monthly","Terms","Start","End","Status","Actions"];
  let h = "<tr>" + cols.map((c) => `<th>${c}</th>`).join("") + "</tr>";
  if (!state.installments.length) h += `<tr><td colspan="${cols.length}" class="empty">No installments 🔔</td></tr>`;
  state.installments.forEach((i) => {
    if (editInst === i.id) {
      h += `<tr>
        <td><input id="ein-card" value="${esc(i.card)}" style="min-width:80px"></td>
        <td><input id="ein-merch" value="${esc(i.merchant)}" style="min-width:90px"></td>
        <td><select id="ein-cat">${cats.map((c) => `<option ${c === i.category ? "selected" : ""}>${c}</option>`).join("")}</select></td>
        <td><input id="ein-amt" type="number" value="${i.monthlyAmount}" style="min-width:80px"></td>
        <td><input id="ein-terms" type="number" value="${i.terms}" style="min-width:60px"></td>
        <td><input id="ein-start" type="month" value="${i.startMonth}"></td>
        <td>—</td><td>—</td>
        <td class="row-actions"><button class="btn btn-tiny btn-save" onclick="saveInst('${i.id}')">Save</button>
          <button class="btn btn-tiny btn-cancel" onclick="cancelEdit('inst')">Cancel</button></td></tr>`;
    } else {
      const st = instStatus(i, m);
      h += `<tr>
        <td>${esc(i.card)}</td><td>${esc(i.merchant)}</td><td>${esc(i.category)}</td>
        <td class="num">${peso(i.monthlyAmount)}</td><td class="num">${num(i.terms)}</td>
        <td>${monthLabel(i.startMonth)}</td><td>${monthLabel(instEndMonth(i))}</td>
        <td><span class="badge ${st.badge}">${st.text}</span></td>
        <td class="row-actions"><button class="btn btn-tiny btn-ghost" onclick="startEdit('inst','${i.id}')">Edit</button>
          <button class="btn btn-tiny btn-del" onclick="del('installments','${i.id}', renderInstallments)">Delete</button></td></tr>`;
    }
  });
  $("instTable").innerHTML = h;
}
function miniList(obj, empty) {
  const keys = Object.keys(obj);
  if (!keys.length) return `<div class="empty">${empty}</div>`;
  let total = 0;
  let h = `<div class="mini-list">`;
  keys.forEach((k) => { total += obj[k]; h += `<div class="ml-row"><span>${esc(k)}</span><span>${peso(obj[k])}</span></div>`; });
  h += `<div class="ml-row"><span>Total</span><span>${peso(total)}</span></div></div>`;
  return h;
}
window.saveInst = (id) => {
  const i = state.installments.find((x) => x.id === id);
  i.card = $("ein-card").value.trim() || i.card; i.merchant = $("ein-merch").value.trim();
  i.category = $("ein-cat").value; i.monthlyAmount = num($("ein-amt").value);
  i.terms = num($("ein-terms").value); i.startMonth = $("ein-start").value || i.startMonth;
  editInst = null; save(); renderInstallments();
};

/* ===========================================================
   GOALS
   =========================================================== */
let editGoal = null;
$("addGoalBtn").onclick = () => {
  const name = $("goalName").value.trim();
  if (!name) return;
  state.goals.push({ id: uid(), name, target: num($("goalTarget").value), current: num($("goalCurrent").value), deadline: $("goalDeadline").value });
  $("goalName").value = ""; $("goalTarget").value = ""; $("goalCurrent").value = ""; $("goalDeadline").value = "";
  save(); renderGoals(); renderDashboard();
};
function goalHTML(g, editable) {
  const pct = num(g.target) ? Math.min(100, (num(g.current) / num(g.target)) * 100) : 0;
  if (editable && editGoal === g.id) {
    return `<div class="progress-item card" style="box-shadow:none;border:2px solid #efeaf7">
      <div class="form-grid">
        <input id="eg-name" value="${esc(g.name)}">
        <input id="eg-target" type="number" value="${g.target}" placeholder="Target">
        <input id="eg-current" type="number" value="${g.current}" placeholder="Current">
        <input id="eg-deadline" type="month" value="${g.deadline || ""}">
      </div>
      <div class="row-actions"><button class="btn btn-tiny btn-save" onclick="saveGoal('${g.id}')">Save</button>
        <button class="btn btn-tiny btn-cancel" onclick="cancelEdit('goal')">Cancel</button></div></div>`;
  }
  return `<div class="progress-item">
    <div class="progress-top"><span>🎯 ${esc(g.name)} ${g.deadline ? `<span class="hint">· by ${monthLabel(g.deadline)}</span>` : ""}</span>
      <span>${peso(g.current)} / ${peso(g.target)} (${pct.toFixed(0)}%)</span></div>
    <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    ${editable ? `<div class="row-actions" style="margin-top:6px">
      <button class="btn btn-tiny btn-ghost" onclick="startEdit('goal','${g.id}')">Edit</button>
      <button class="btn btn-tiny btn-del" onclick="del('goals','${g.id}', () => { renderGoals(); renderDashboard(); })">Delete</button></div>` : ""}
  </div>`;
}
function renderGoals() {
  $("goalList").innerHTML = state.goals.length
    ? state.goals.map((g) => goalHTML(g, true)).join("")
    : `<div class="empty">No goals yet — dream big! ✨</div>`;
}
window.saveGoal = (id) => {
  const g = state.goals.find((x) => x.id === id);
  g.name = $("eg-name").value.trim() || g.name; g.target = num($("eg-target").value);
  g.current = num($("eg-current").value); g.deadline = $("eg-deadline").value;
  editGoal = null; save(); renderGoals(); renderDashboard();
};

/* ===========================================================
   DASHBOARD
   =========================================================== */
function renderDashboard() {
  const m = thisMonth();
  $("statNetWorth").textContent = peso(netWorth());
  $("statAssets").textContent = peso(totalAssets());
  $("statIncome").textContent = peso(monthlyIncome(m));
  const savings = monthlyIncome(m) - monthlyExpenses(m);
  const sEl = $("statSavings");
  sEl.textContent = peso(savings);
  sEl.className = "stat-value " + (savings >= 0 ? "pos" : "neg");

  // Asset breakdown bar (by category, incl funds)
  const byCat = {};
  state.assets.forEach((a) => { byCat[a.category] = (byCat[a.category] || 0) + num(a.value); });
  const fundsTotal = sum(state.funds, (f) => f.current);
  if (fundsTotal) byCat["Mutual Fund"] = (byCat["Mutual Fund"] || 0) + fundsTotal;
  const labels = Object.keys(byCat);
  if (labels.length) {
    drawChart("chartAssetBar", {
      type: "bar",
      data: { labels, datasets: [{ label: "Value", data: labels.map((l) => byCat[l]), backgroundColor: PALETTE, borderRadius: 10, borderWidth: 0 }] },
      options: { plugins: { legend: { display: false } }, maintainAspectRatio: false, scales: { y: { ticks: { callback: (v) => peso(v) } } } },
    });
  } else drawEmpty("chartAssetBar", "No assets");

  // Assets vs Liabilities donut
  const ta = totalAssets(), tl = totalLiabilities();
  if (ta || tl) {
    drawChart("chartAvL", {
      type: "doughnut",
      data: { labels: ["Assets", "Liabilities"], datasets: [{ data: [ta, tl], backgroundColor: ["#D2FBE7", "#FFD6D6"], borderWidth: 2, borderColor: "#fff" }] },
      options: { plugins: { legend: { position: "bottom" } }, cutout: "62%", maintainAspectRatio: false },
    });
  } else drawEmpty("chartAvL", "No data");

  // Goals
  $("dashGoals").innerHTML = state.goals.length
    ? state.goals.map((g) => goalHTML(g, false)).join("")
    : `<div class="empty">No goals yet ✨</div>`;

  renderAlerts();
}

function renderAlerts() {
  const m = thisMonth();
  const warns = [];
  // Loans nearing due / overdue
  state.loans.forEach((l) => {
    if (!l.dueDate) return;
    const due = new Date(l.dueDate);
    const days = Math.round((due - new Date()) / 86400000);
    if (num(l.remaining) <= 0) return;
    if (days < 0) warns.push({ danger: true, msg: `💳 <b>${esc(l.bank)}</b> loan is overdue (due ${l.dueDate}), ${peso(l.remaining)} remaining.` });
    else if (days <= 60) warns.push({ danger: days <= 14, msg: `💳 <b>${esc(l.bank)}</b> loan due in ${days} day(s) — ${peso(l.remaining)} remaining.` });
  });
  // Installments ending soon (last term this month or next month)
  state.installments.forEach((i) => {
    const end = instEndMonth(i);
    const diff = monthsBetween(m, end);
    if (instActiveInMonth(i, m) && diff === 0)
      warns.push({ danger: false, msg: `🔔 <b>${esc(i.card)}</b> · ${esc(i.merchant)} installment finishes this month (last term).` });
    else if (diff === 1 && instActiveInMonth(i, m))
      warns.push({ danger: false, msg: `🔔 <b>${esc(i.card)}</b> · ${esc(i.merchant)} installment finishes next month.` });
  });

  if (!warns.length) { $("alertBanner").innerHTML = ""; return; }
  const danger = warns.some((w) => w.danger);
  $("alertBanner").innerHTML = `<div class="alert ${danger ? "danger" : ""}">
    <div>⚠️ ${warns.length} reminder(s):</div><ul>${warns.map((w) => `<li>${w.msg}</li>`).join("")}</ul></div>`;
}

/* ===========================================================
   GENERIC EDIT / DELETE
   =========================================================== */
const EDIT_VARS = {
  asset: () => editAsset = null, liab: () => editLiab = null, inc: () => editInc = null,
  exp: () => editExp = null, snap: () => editSnap = null, rent: () => editRent = null,
  fund: () => editFund = null, loan: () => editLoan = null, inst: () => editInst = null, goal: () => editGoal = null,
};
const EDIT_RENDER = {
  asset: renderAssets, liab: renderAssets, inc: renderIncome, exp: renderIncome, snap: renderHistory,
  rent: renderRentals, fund: renderFunds, loan: renderLoans, inst: renderInstallments, goal: renderGoals,
};
window.startEdit = (kind, id) => {
  // clear other edits first
  Object.values(EDIT_VARS).forEach((fn) => fn());
  ({ asset: () => editAsset = id, liab: () => editLiab = id, inc: () => editInc = id, exp: () => editExp = id,
     snap: () => editSnap = id, rent: () => editRent = id, fund: () => editFund = id, loan: () => editLoan = id,
     inst: () => editInst = id, goal: () => editGoal = id }[kind])();
  EDIT_RENDER[kind]();
};
window.cancelEdit = (kind) => { EDIT_VARS[kind](); EDIT_RENDER[kind](); };
window.del = (bucket, id, after) => {
  if (!confirm("Delete this entry? This can't be undone.")) return;
  state[bucket] = state[bucket].filter((x) => x.id !== id);
  save(); if (after) after();
};

/* ===========================================================
   EXPORT / IMPORT / RESET
   =========================================================== */
$("exportJsonBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  downloadBlob(blob, `pastel-finance-${thisMonth()}.json`);
};
$("exportXlsxBtn").onclick = () => {
  const wb = XLSX.utils.book_new();
  const add = (name, rows) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{}]), name);
  add("Assets", state.assets);
  add("Liabilities", state.liabilities);
  const incRows = []; Object.entries(state.income).forEach(([m, arr]) => arr.forEach((i) => incRows.push({ month: m, ...i })));
  add("Income", incRows);
  const expRows = []; Object.entries(state.expenses).forEach(([m, arr]) => arr.forEach((e) => expRows.push({ month: m, ...e })));
  add("Expenses", expRows);
  add("Budgets", Object.entries(state.budgets).map(([category, budget]) => ({ category, budget })));
  add("History", state.history);
  add("Rentals", state.rentals);
  add("MutualFunds", state.funds);
  add("Loans", state.loans);
  add("Installments", state.installments.map((i) => ({ ...i, endMonth: instEndMonth(i) })));
  add("Goals", state.goals);
  XLSX.writeFile(wb, `pastel-finance-${thisMonth()}.xlsx`);
};
$("importFile").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!confirm("Import will replace ALL current data. Continue?")) { e.target.value = ""; return; }
      state = Object.assign(blankState(), data);
      save(); resetEditState(); syncMonthPickers(); renderAll();
      alert("Imported successfully! 💕");
    } catch (err) { alert("Invalid JSON file 😢"); }
    e.target.value = "";
  };
  reader.readAsText(file);
};
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
$("resetBtn").onclick = () => {
  if (!confirm("Reset ALL data back to fresh sample data? This cannot be undone.")) return;
  state = seed(); save(); resetEditState(); syncMonthPickers(); renderAll();
};
function resetEditState() {
  editAsset = editLiab = editInc = editExp = editSnap = editRent = editFund = editLoan = editInst = editGoal = null;
}
function syncMonthPickers() {
  ["ieMonth", "budgetMonth", "snapMonth", "instMonth"].forEach((id) => { if (!$(id).value) $(id).value = thisMonth(); });
}

/* ===========================================================
   RENDER ALL
   =========================================================== */
function renderAll() {
  renderDashboard(); renderAssets(); renderIncome(); renderBudget();
  renderHistory(); renderRentals(); renderFunds(); renderLoans();
  renderInstallments(); renderGoals();
}

renderAll();
