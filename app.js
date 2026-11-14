// INITIAL STATE & LOCAL STORAGE SYNC
let currentUser = { firstname: "Phomolo", lastname: "", phone: "+27 82 555 1234", email: "phomolo@gmail.com", balancePaid: false };

let defaultBookings = [
  { id: 1, type: "Driving Lesson", date: "2026-06-15", time: "14:00", instructor: "Leon Schuster", status: "Confirmed", studentName: "Phomolo", studentPhone: "+27 82 555 1234" },
  { id: 2, type: "Test Preparation", date: "2026-06-20", time: "10:00", instructor: "John Doe", status: "Pending", studentName: "Phomolo", studentPhone: "+27 82 555 1234" }
];

if (!localStorage.getItem("gds_bookings")) {
  localStorage.setItem("gds_bookings", JSON.stringify(defaultBookings));
}

// TOAST NOTIFICATION SYSTEM
function showToast(message, isSuccess = true) {
  const banner = document.getElementById('toast-banner');
  const msg = document.getElementById('toast-msg');
  const icon = document.getElementById('toast-icon');
  
  if (!banner) return;
  
  msg.innerText = message;
  icon.innerText = isSuccess ? "✅" : "⚠️";
  
  banner.classList.remove('-translate-y-20', 'opacity-0');
  banner.classList.add('translate-y-0', 'opacity-100');
  
  setTimeout(() => {
    banner.classList.remove('translate-y-0', 'opacity-100');
    banner.classList.add('-translate-y-20', 'opacity-0');
  }, 3500);
}

// NAVIGATION FUNCTION
function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) targetScreen.classList.remove('hidden');

  const bottomNav = document.getElementById('bottom-nav');
  const sidebar = document.getElementById('desktop-sidebar');
  
  if (screenId === 'screen-login' || screenId === 'screen-register') {
    if (bottomNav) bottomNav.classList.add('hidden');
    if (sidebar) sidebar.classList.add('hidden');
  } else {
    if (bottomNav) bottomNav.classList.remove('hidden');
    if (sidebar) sidebar.classList.remove('hidden');
  }

  if (screenId === 'screen-bookings') renderBookings();
  if (screenId === 'screen-admin') renderAdminBookings();
}

// LOGOUT CONFIRMATION PROMPT
function confirmLogout() {
  const confirmed = confirm("Are you sure you want to log out of your Gold Driving School account?");
  if (confirmed) {
    showToast("You have been logged out safely.", false);
    navigateTo('screen-login');
  }
}

// LOGIN & REGISTRATION
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const rawName = email.split('@')[0];
  currentUser.firstname = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  currentUser.email = email;

  const welcomeEl = document.getElementById('dashboard-welcome');
  const profileNameEl = document.getElementById('profile-name');
  
  if (welcomeEl) welcomeEl.innerText = `Welcome, ${currentUser.firstname}!`;
  if (profileNameEl) profileNameEl.innerText = currentUser.firstname;
  
  showToast(`Welcome back, ${currentUser.firstname}!`);
  navigateTo('screen-dashboard');
}

function handleRegister(event) {
  event.preventDefault();
  currentUser.firstname = document.getElementById('reg-firstname').value.trim();
  currentUser.lastname = document.getElementById('reg-lastname').value.trim();
  currentUser.email = document.getElementById('reg-email').value.trim();
  currentUser.phone = document.getElementById('reg-phone').value.trim();
  
  showToast("Account created successfully! Please log in.");
  navigateTo('screen-login');
}

// SLOT CONFLICT VALIDATION & BOOKING CREATION
function handleNewBooking(event) {
  event.preventDefault();
  const instructor = document.getElementById('book-instructor').value;
  const type = document.getElementById('book-type').value;
  const date = document.getElementById('book-date').value;
  const time = document.getElementById('book-time').value;

  let bookings = JSON.parse(localStorage.getItem("gds_bookings")) || [];

  // Check double-booking conflict
  const conflict = bookings.find(b => b.instructor === instructor && b.date === date && b.time === time && b.status !== "Cancelled");
  
  if (conflict) {
    showToast(`Slot taken! Instructor ${instructor} is already booked at this time.`, false);
    return;
  }

  const fullName = `${currentUser.firstname} ${currentUser.lastname}`.trim();
  const newBooking = {
    id: Date.now(),
    type,
    date,
    time,
    instructor,
    status: "Pending",
    studentName: fullName,
    studentPhone: currentUser.phone
  };

  bookings.push(newBooking);
  localStorage.setItem("gds_bookings", JSON.stringify(bookings));

  showToast("Booking submitted successfully!");
  navigateTo('screen-bookings');
}

// RENDER STUDENT BOOKINGS WITH CANCELLATION CONFIRMATION
function renderBookings() {
  const container = document.getElementById('bookings-container');
  if (!container) return;
  
  let bookings = JSON.parse(localStorage.getItem("gds_bookings")) || [];

  if (bookings.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-500 text-center py-8">No bookings found.</p>`;
    return;
  }

  container.innerHTML = bookings.map(b => `
    <div class="bg-softCard p-4 rounded-2xl flex justify-between items-start border border-slate-200">
      <div class="space-y-1">
        <span class="text-[10px] font-bold px-2.5 py-0.5 rounded ${b.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">${b.status}</span>
        <p class="text-sm font-bold text-black mt-1">${b.type}</p>
        <p class="text-xs text-gray-600">📅 ${b.date} at ${b.time}</p>
        <p class="text-xs text-gray-500">Instructor: ${b.instructor}</p>
        <p class="text-[11px] font-semibold text-brandPurple">Booked for: ${b.studentName || currentUser.firstname}</p>
      </div>
      <button onclick="confirmCancelBooking(${b.id})" class="text-xs text-red-600 font-semibold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-100 hover:bg-red-50">Cancel</button>
    </div>
  `).join('');
}

// CANCELLATION CONFIRMATION PROMPT
function confirmCancelBooking(id) {
  const confirmed = confirm("Are you sure you want to cancel this booking?");
  if (confirmed) {
    let bookings = JSON.parse(localStorage.getItem("gds_bookings")) || [];
    bookings = bookings.filter(b => b.id !== id);
    localStorage.setItem("gds_bookings", JSON.stringify(bookings));
    renderBookings();
    showToast("Booking cancelled successfully.");
  }
}

// INSTRUCTOR / ADMIN DASHBOARD
function renderAdminBookings() {
  const container = document.getElementById('admin-bookings-container');
  if (!container) return;
  
  let bookings = JSON.parse(localStorage.getItem("gds_bookings")) || [];

  if (bookings.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-500 text-center py-8">No instructor bookings registered.</p>`;
    return;
  }

  container.innerHTML = bookings.map(b => `
    <div class="bg-lightPurpleBg p-4 rounded-2xl border border-purple-100 space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded ${b.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">${b.status}</span>
        <span class="text-xs font-mono text-gray-500">📅 ${b.date} (${b.time})</span>
      </div>
      <div>
        <p class="text-sm font-bold text-black">👤 Student: ${b.studentName || currentUser.firstname}</p>
        <p class="text-xs font-semibold text-brandPurple">📞 Phone: ${b.studentPhone || '+27 82 555 0192'}</p>
      </div>
      <div class="text-xs text-gray-600 pt-1 border-t border-purple-50 flex justify-between items-center">
        <span>Lesson: <strong>${b.type}</strong> (${b.instructor})</span>
        ${b.status === 'Pending' ? `<button onclick="approveBooking(${b.id})" class="bg-brandPurple text-white px-3 py-1 rounded text-xs font-bold hover:opacity-90">Approve Booking</button>` : '<span class="text-green-700 font-bold text-xs">Approved</span>'}
      </div>
    </div>
  `).join('');
}

function approveBooking(id) {
  let bookings = JSON.parse(localStorage.getItem("gds_bookings")) || [];
  bookings = bookings.map(b => {
    if (b.id === id) b.status = "Confirmed";
    return b;
  });
  localStorage.setItem("gds_bookings", JSON.stringify(bookings));
  renderAdminBookings();
  showToast("Booking confirmed and approved by instructor!");
}

// SIMULATE PAYMENT FUNCTION
function simulatePayment() {
  currentUser.balancePaid = true;
  
  const dashBalance = document.getElementById('dash-balance-display');
  const profileBalance = document.getElementById('profile-balance-text');
  const paymentBadge = document.getElementById('payment-status-badge');
  const payBtn = document.getElementById('pay-button');
  const invoiceStatus = document.getElementById('invoice-status-text');

  if (dashBalance) dashBalance.innerText = "R0 (Paid)";
  if (profileBalance) profileBalance.innerText = "R0.00 Settled";
  if (paymentBadge) {
    paymentBadge.innerText = "PAID";
    paymentBadge.className = "text-[10px] bg-green-500/20 text-green-300 px-2.5 py-1 rounded font-mono font-bold border border-green-500/30";
  }
  if (payBtn) {
    payBtn.innerText = "Balance Fully Paid ✓";
    payBtn.disabled = true;
    payBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
  if (invoiceStatus) {
    invoiceStatus.innerText = "Paid in Full (EFT Settled)";
    invoiceStatus.className = "text-green-700 font-bold";
  }
  
  showToast("Payment of R850 processed successfully! Invoice generated.");
}

// K53 MINI QUIZ INTERACTIVE LOGIC
function answerQuiz(optionIndex) {
  const feedback = document.getElementById('quiz-result-feedback');
  if (!feedback) return;
  
  feedback.classList.remove('hidden');
  
  const ruleScore = document.getElementById('traffic-rule-score');
  const ruleBar = document.getElementById('traffic-rule-bar');
  const overallText = document.getElementById('overall-progress-text');
  const overallBar = document.getElementById('overall-progress-bar');

  if (optionIndex === 0) {
    feedback.innerText = "Correct! A flashing red robot requires coming to a complete stop.";
    feedback.className = "text-xs font-bold text-green-700 bg-green-100 p-3 rounded-xl";
    
    if (ruleScore) ruleScore.innerText = "90%";
    if (ruleBar) ruleBar.style.width = "90%";
    if (overallText) overallText.innerText = "55%";
    if (overallBar) overallBar.style.width = "55%";
    
    showToast("Quiz passed! Traffic rules score increased.");
  } else {
    feedback.innerText = "Incorrect. Remember K53 rules: flashing red is always a mandatory stop!";
    feedback.className = "text-xs font-bold text-red-700 bg-red-100 p-3 rounded-xl";
    showToast("Incorrect answer. Try again!", false);
  }
}
