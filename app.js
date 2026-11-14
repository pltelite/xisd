// INITIAL STATE & LOCAL STORAGE SYNC
let currentUser = { firstname: "Peter", lastname: "Park", phone: "+27 82 555 1234", email: "peter@example.com" };

let defaultBookings = [
  { id: 1, type: "Driving Lesson", date: "2026-06-15", time: "14:00", instructor: "Leon Schuster", status: "Confirmed", studentName: "Peter Park", studentPhone: "+27 82 555 1234" },
  { id: 2, type: "Test Preparation", date: "2026-06-20", time: "10:00", instructor: "John Doe", status: "Pending", studentName: "Peter Park", studentPhone: "+27 82 555 1234" }
];

if (!localStorage.getItem("gds_bookings")) {
  localStorage.setItem("gds_bookings", JSON.stringify(defaultBookings));
}

// NAVIGATION FUNCTION
function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');

  const bottomNav = document.getElementById('bottom-nav');
  if (screenId === 'screen-login' || screenId === 'screen-register') {
    bottomNav.classList.add('hidden');
  } else {
    bottomNav.classList.remove('hidden');
  }

  if (screenId === 'screen-bookings') {
    renderBookings();
  }
  if (screenId === 'screen-admin') {
    renderAdminBookings();
  }
}

// LOGIN & REGISTRATION HANDLERS
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  currentUser.email = email;
  document.getElementById('dashboard-welcome').innerText = `Welcome, ${currentUser.firstname}!`;
  document.getElementById('profile-name').innerText = `${currentUser.firstname} ${currentUser.lastname}`;
  navigateTo('screen-dashboard');
}

function handleRegister(event) {
  event.preventDefault();
  currentUser.firstname = document.getElementById('reg-firstname').value;
  currentUser.lastname = document.getElementById('reg-lastname').value;
  currentUser.email = document.getElementById('reg-email').value;
  currentUser.phone = document.getElementById('reg-phone').value;
  
  alert("Account created successfully! Please log in.");
  navigateTo('screen-login');
}

// NEW BOOKING WITH SLOT CONFLICT VALIDATION
function handleNewBooking(event) {
  event.preventDefault();
  const instructor = document.getElementById('book-instructor').value;
  const type = document.getElementById('book-type').value;
  const date = document.getElementById('book-date').value;
  const time = document.getElementById('book-time').value;

  let bookings = JSON.parse(localStorage.getItem("gds_bookings")) || [];

  // CONFLICT VALIDATION: Check if instructor is already booked at this date and time
  const conflict = bookings.find(b => b.instructor === instructor && b.date === date && b.time === time && b.status !== "Cancelled");
  
  if (conflict) {
    alert(`❌ Slot already taken! Instructor ${instructor} already has a ${conflict.type} booked on ${date} at ${time}. Please choose another time slot.`);
    return;
  }

  const newBooking = {
    id: Date.now(),
    type,
    date,
    time,
    instructor,
    status: "Pending",
    studentName: `${currentUser.firstname} ${currentUser.lastname}`,
    studentPhone: currentUser.phone
  };

  bookings.push(newBooking);
  localStorage.setItem("gds_bookings", JSON.stringify(bookings));

  alert("Booking submitted successfully!");
  navigateTo('screen-bookings');
}

// RENDER STUDENT BOOKINGS WITH CANCELLATION CONFIRMATION PROMPT
function renderBookings() {
  const container = document.getElementById('bookings-container');
  let bookings = JSON.parse(localStorage.getItem("gds_bookings")) || [];

  if (bookings.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-500 text-center py-8">No bookings found.</p>`;
    return;
  }

  container.innerHTML = bookings.map(b => `
    <div class="bg-softCard p-4 rounded-2xl flex justify-between items-start">
      <div class="space-y-1">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded ${b.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">${b.status}</span>
        <p class="text-sm font-bold text-black mt-1">${b.type}</p>
        <p class="text-xs text-gray-600">📅 ${b.date} at ${b.time}</p>
        <p class="text-xs text-gray-500">Instructor: ${b.instructor}</p>
      </div>
      <button onclick="confirmCancelBooking(${b.id})" class="text-xs text-red-600 font-semibold hover:underline bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-100">Cancel</button>
    </div>
  `).join('');
}

// CANCELLATION CONFIRMATION PROMPT FUNCTION
function confirmCancelBooking(id) {
  const confirmed = confirm("Are you sure you want to cancel this booking?");
  if (confirmed) {
    let bookings = JSON.parse(localStorage.getItem("gds_bookings")) || [];
    bookings = bookings.filter(b => b.id !== id);
    localStorage.setItem("gds_bookings", JSON.stringify(bookings));
    renderBookings();
    alert("Booking cancelled successfully.");
  }
}

// RENDER INSTRUCTOR / ADMIN DASHBOARD (Student Names & Phone Numbers)
function renderAdminBookings() {
  const container = document.getElementById('admin-bookings-container');
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
        <p class="text-sm font-bold text-black">👤 Student: ${b.studentName || 'Student'}</p>
        <p class="text-xs font-semibold text-brandPurple">📞 Phone: ${b.studentPhone || '+27 82 555 0192'}</p>
      </div>
      <div class="text-xs text-gray-600 pt-1 border-t border-purple-50 flex justify-between items-center">
        <span>Lesson: <strong>${b.type}</strong> (${b.instructor})</span>
        ${b.status === 'Pending' ? `<button onclick="approveBooking(${b.id})" class="bg-brandPurple text-white px-2.5 py-1 rounded text-[10px] font-bold">Approve</button>` : ''}
      </div>
    </div>
  `).join('');
}

// APPROVE PENDING BOOKING FROM ADMIN VIEW
function approveBooking(id) {
  let bookings = JSON.parse(localStorage.getItem("gds_bookings")) || [];
  bookings = bookings.map(b => {
    if (b.id === id) {
      b.status = "Confirmed";
    }
    return b;
  });
  localStorage.setItem("gds_bookings", JSON.stringify(bookings));
  renderAdminBookings();
  alert("Booking confirmed by instructor!");
}
