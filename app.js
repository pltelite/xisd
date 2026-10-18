// INITIAL BOOKINGS DATA
const defaultBookings = [
  { id: 1, type: "Driving Lesson", date: "2026-06-15", time: "14:00", instructor: "Leon Schuster", status: "Confirmed" },
  { id: 2, type: "Test Preparation", date: "2026-06-20", time: "10:00", instructor: "John Doe", status: "Pending" }
];

if (!localStorage.getItem("gds_bookings")) {
  localStorage.setItem("gds_bookings", JSON.stringify(defaultBookings));
}

let currentUser = { firstName: "Peter", lastName: "Park" };

function navigateTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById(screenId);
  if (target) target.classList.remove('hidden');

  const bottomNav = document.getElementById('bottom-nav');
  if (['screen-login', 'screen-register'].includes(screenId)) {
    bottomNav.classList.add('hidden');
  } else {
    bottomNav.classList.remove('hidden');
    if (screenId === 'screen-bookings') renderBookings();
  }
}

function handleLogin(e) {
  e.preventDefault();
  navigateTo('screen-dashboard');
}

function handleRegister(e) {
  e.preventDefault();
  const fName = document.getElementById('reg-firstname').value;
  const lName = document.getElementById('reg-lastname').value;
  currentUser = { firstName: fName, lastName: lName };
  
  document.getElementById('dashboard-welcome').innerText = `Welcome, ${fName}!`;
  document.getElementById('profile-name').innerText = `${fName} ${lName}`;
  navigateTo('screen-dashboard');
}

function renderBookings() {
  const container = document.getElementById('bookings-container');
  const bookings = JSON.parse(localStorage.getItem('gds_bookings')) || [];
  container.innerHTML = '';

  if (bookings.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-400 text-center py-6">No active bookings found.</p>`;
    return;
  }

  bookings.forEach(b => {
    const card = document.createElement('div');
    card.className = "bg-softCard p-4 rounded-2xl space-y-2";
    card.innerHTML = `
      <div class="flex justify-between items-center text-xs font-bold">
        <span class="text-black">${b.date}</span>
        <span class="${b.status === 'Confirmed' ? 'text-emerald-600' : 'text-red-500'}">${b.status}</span>
      </div>
      <p class="text-sm font-bold text-black">${b.type}</p>
      <p class="text-xs text-gray-700">Time: ${b.time}</p>
      <p class="text-xs text-gray-700">Instructor: ${b.instructor}</p>
      <button onclick="cancelBooking(${b.id})" class="mt-2 px-4 py-1.5 border border-gray-400 rounded-full text-xs font-medium text-black bg-white/40 hover:bg-white">Cancel Booking</button>
    `;
    container.appendChild(card);
  });
}

function handleNewBooking(e) {
  e.preventDefault();
  const instructor = document.getElementById('book-instructor').value;
  const type = document.getElementById('book-type').value;
  const date = document.getElementById('book-date').value;
  const time = document.getElementById('book-time').value;

  const bookings = JSON.parse(localStorage.getItem('gds_bookings')) || [];
  const newBooking = { id: Date.now(), type, date, time, instructor, status: "Pending" };
  
  bookings.push(newBooking);
  localStorage.setItem('gds_bookings', JSON.stringify(bookings));

  navigateTo('screen-bookings');
}

function cancelBooking(id) {
  let bookings = JSON.parse(localStorage.getItem('gds_bookings')) || [];
  bookings = bookings.filter(b => b.id !== id);
  localStorage.setItem('gds_bookings', JSON.stringify(bookings));
  renderBookings();
}

document.addEventListener('DOMContentLoaded', () => {
  navigateTo('screen-login');
});

