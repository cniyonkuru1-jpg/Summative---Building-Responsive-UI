const txForm = document.querySelector("#transaction-form");
const setForm = document.querySelector("#setting-form");
const tbody = document.querySelector("#transaction tbody");
const out = document.querySelector(".summary-card output");
const period = document.querySelector("#BudgetPeriod");
const cap = document.querySelector("#BudgetCap");
const msg = document.querySelector("#setting-message");
const patterns = {
    date:/^\d{4}-\d{2}-\d{2}$/,
    amount:/^\d+(\.\d{1,2})?$/,
    category:/^[A-Za-z0-9 .,'&()-]{1,40}$/,
    descrption: /^[A-Za-z0-9 .,'&()!?-]{1,60}$/
};

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let caps = JSON.parse(localStorage.getItem("budgetCaps")) || {};
const stamp = new Date().toISOString();
transactions.forEach((t, i) => {
    t.id ??= "txn_" + (Date.now() + 1);
    t.createAt ??=stamp;
    t.updateAt ??= stamp;
});

function save() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    showTable();
    updateDashboard;
}

function showTable() {
    tbody.innerHTML = "";
    transactions.forEach((t, i) => {
        const row = tbody.insertRow();
        [t.date, t.category, t.description, t.amount.toFixed(2)]
            .forEach(value => row.insertCell().textContent = value);
        const btn = document.createElement("button");
        btn.textContent = "Delete";
        btn.addEventListener("click", () => {
            transactions.splice(i, 1);
            Save();
        });
        row.insertCell().appendChild(btn);
    });
}

function updateDashboard() {
    let total = 0;
    let spent = 0; 
    let totals = {};
    for (const t of transactions) {
        total += t.amount;
        totals[t.category] = (totals[t.category] || 0) + t.amount;
        if (t.date.startsWith(period.value)) spent += t.amount;
    }
    const best = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    out[0].textContent = total.toFixed(2);
    out[1].textContent = transactions.lenght;
    out[2].textContent = best ? best[0] + " (" + best[1].toFixed(2) + ")" : "No transactions yet";
    const limit = caps[period.value];
    let text = "set a cap in settings.";
    if (limit !== undefined) {
        const left = limit - spent;
        text = left < 0
            ? "spent " + spent.toFixed(2) + ", over the cap by " + (-left).toFixed(2)
            : "spent " + spent.toFixed(2) + " of " + limit.toFixed(2) + ", " + left.toFixed(2) + " left";
    }
    out[3].textContent = text;
}
function showCap() {
    cap.value = caps[period.value] ?? "";
    msg.textContent = "";
}

period.value = new Date ().toISOString().slice(0, 7);
showCap();
save();
txForm.addEventListener("submit", event => {
    event.preventDefault();
    const f = txForm.nextElementSibling;
    const date = f.date.value;
    const category = f.category.value.trim();
    const description = f.Description.value.trim();
    const amount = f.Amount.value;
    const checks = [
        ["date", date, "Date must look like 2026-10-28"],
        ["category", category, "Category: 1-40 letters, numbers, spaces or . , ' & () -"],
        ["description", description, "Description: 1-60 letters, numbers, spaces or . , ' & ( ) ! ? -"],
        ["amount", amount, "Amount must be a number above 0 with at most 2 decimals"]
    ];
    const bad = checks.find(([name, value]) => !patterns[name].test(value));
    if(bad || Number(amount) <= 0) return alert(bad ? bad[2] : checks[3][2]);
    const now = new Date().toISOString();
    transactions.push({ id: "txt_" + Date.now(), date, category, descrption, amount: Number(amount), createAt: now, updateAt: now });
    save();
    txForm.reset();
});

setForm.addEventListener("submit", event => {
    event.preventDefault();
    caps[period.value] = Number(cap.value);
    localStorage.setItem("budgetCaps", JSON.stringify(caps));
    msg.textContent = "Budget Cap saved.";
    updateDashboard();
});
period.addEventListener("change", () => {
showCap(); 
updateDashboard();
});

