let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Add Income
function addIncome() {
  const desc = document.getElementById("incomeDesc").value;
  const amt = parseFloat(document.getElementById("incomeAmount").value);
  if (!desc || isNaN(amt)) return alert("Enter valid income details");

  incomes.push({ desc, amt });
  localStorage.setItem("incomes", JSON.stringify(incomes));
  alert("Income Added!");
  document.getElementById("incomeDesc").value = "";
  document.getElementById("incomeAmount").value = "";
}

// Add Expense
function addExpense() {
  const desc = document.getElementById("expenseDesc").value;
  const amt = parseFloat(document.getElementById("expenseAmount").value);
  const cat = document.getElementById("expenseCategory").value;

  if (!desc || isNaN(amt) || !cat) return alert("Enter valid expense details");

  expenses.push({ desc, amt, cat });
  localStorage.setItem("expenses", JSON.stringify(expenses));
  alert("Expense Added!");
  document.getElementById("expenseDesc").value = "";
  document.getElementById("expenseAmount").value = "";
  document.getElementById("expenseCategory").value = "";
}

// Voice Input Everywhere
function startVoiceInput(fieldId, fieldType = "text") {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    let field = document.getElementById(fieldId);

    if (fieldType === "number") {
      let num = transcript.replace(/[^0-9.]/g, "");
      field.value = num;
    } else if (fieldType === "category") {
      let normalized = transcript.toLowerCase();
      let options = Array.from(field.options);
      let found = options.find(opt => opt.text.toLowerCase().includes(normalized));
      if (found) field.value = found.value;
    } else {
      field.value = transcript;
    }
  };
}

// Render Category Page
if (document.getElementById("categoryList")) {
  const listDiv = document.getElementById("categoryList");
  if (expenses.length === 0) {
    listDiv.innerHTML = "<p>No expenses added yet.</p>";
  } else {
    let grouped = {};
    expenses.forEach(exp => {
      if (!grouped[exp.cat]) grouped[exp.cat] = [];
      grouped[exp.cat].push(exp);
    });

    for (let cat in grouped) {
      let section = document.createElement("div");
      section.innerHTML = `<h3>${cat}</h3>`;
      grouped[cat].forEach((exp, i) => {
        let item = document.createElement("div");
        item.className = "expense-item";
        item.innerHTML = `${exp.desc} - ₹${exp.amt} <button class="delete-btn" onclick="deleteExpense(${expenses.indexOf(exp)})">Delete</button>`;
        section.appendChild(item);
      });
      listDiv.appendChild(section);
    }
  }
}

// Delete Expense
function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  location.reload();
}

// Render Summary Page
if (document.getElementById("summary")) {
  const summaryDiv = document.getElementById("summary");
  let totalIncome = incomes.reduce((a, b) => a + b.amt, 0);
  let totalExpense = expenses.reduce((a, b) => a + b.amt, 0);
  let savings = totalIncome - totalExpense;

  summaryDiv.innerHTML = `
    <p><b>Total Income:</b> ₹${totalIncome}</p>
    <p><b>Total Expenses:</b> ₹${totalExpense}</p>
    <p><b>Savings:</b> ₹${savings}</p>
  `;

  const ctx = document.getElementById("summaryChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Income", "Expenses", "Savings"],
      datasets: [{
        data: [totalIncome, totalExpense, savings],
        backgroundColor: ["#4CAF50", "#F44336", "#2196F3"]
      }]
    }
  });
}

// Download as PDF
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Expense Summary", 20, 20);
  let y = 40;

  incomes.forEach((inc, i) => {
    doc.text(`Income ${i+1}: ${inc.desc} - ₹${inc.amt}`, 20, y);
    y += 10;
  });

  expenses.forEach((exp, i) => {
    doc.text(`Expense ${i+1}: ${exp.desc} (${exp.cat}) - ₹${exp.amt}`, 20, y);
    y += 10;
  });

  doc.save("summary.pdf");
}

// Download as Excel
function downloadExcel() {
  let wb = XLSX.utils.book_new();
  let wsData = [["Type", "Description", "Amount", "Category"]];
  incomes.forEach(inc => wsData.push(["Income", inc.desc, inc.amt, ""]));
  expenses.forEach(exp => wsData.push(["Expense", exp.desc, exp.amt, exp.cat]));
  let ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, "Summary");
  XLSX.writeFile(wb, "summary.xlsx");
}

