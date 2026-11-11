let bookingsList = [
    { id: 1, date: "15 June 2026", time: "14:00", type: "Driving Lesson", instructor: "Leon Schuster", status: "Confirmed" },
    { id: 2, date: "20 June 2026", time: "10:00", type: "Test Preparation", instructor: "John Doe", status: "Pending" }
];

function navigateTo(screenId) {
  // Hide all screens
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.add('hidden'));

  // Show selected screen
  const activeScreen = document.getElementById(screenId);
  if (activeScreen) {
    activeScreen.classList.remove('hidden');
  }

  // Toggle bottom navigation visibility
  const topNav = document.getElementById('top-nav');
  const authScreens = ['screen-login', 'screen-register'];
  
  if (screenId === 'screen-bookings') {
      renderBookings();
  }
}
function handleNewBooking(event) {
    event.preventDefault();

    const instructor = document.getElementById('book-instructor').value;
    const type = document.getElementById('book-type').value;
    const date = document.getElementById('book-date').value;
    const time = document.getElementById('book-time').value;

    if (date && time) {
        bookingsList.unshift({
            id: Date.now(),
            date: date,
            time: time,
            type: type,
            instructor: instructor,
            status: "Confirmed"
        });
    }

    navigateTo('screen-bookings');
}

function handleUpdateProfile(event) {
    event.preventDefault();
    const newName = document.getElementById('settings-name-input').value;

    if (newName) {
      
        const profileNameEl = document.getElementById('profile-name');
        if (profileNameEl) {
            profileNameEl.innerText = newName;
        }
     
        const dashboardWelcomeEl = document.getElementById('dashboard-welcome');
        if (dashboardWelcomeEl) {
            dashboardWelcomeEl.innerText = `Welcome, ${newName}!`;
        }

        navigateTo('screen-profile');
    }
}

function renderBookings() {
    const container = document.getElementById('bookings-container');
    if (!container) return;

    if (bookingsList.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-500 text-center py-8">No active bookings found.</p>`;
        return;
    }

    container.innerHTML = bookingsList.map(b => `
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-black text-sm">${b.date}</span>
                <span class="${b.status === 'Confirmed' ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'} px-2.5 py-1 rounded-full text-[10px]">${b.status}</span>
            </div>
            <p class="text-base font-bold text-black">${b.type}</p>
            <p class="text-xs text-gray-600">Time: ${b.time}</p>
            <p class="text-xs text-gray-600">Instructor: ${b.instructor}</p>
            <button onclick="cancelBooking(${b.id})" class="mt-2 px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-black bg-gray-50 hover:bg-gray-100 transition">Cancel Booking</button>
        </div>
    `).join('');
}

function cancelBooking(id) {
    bookingsList = bookingsList.filter(b => b.id !== id);
    renderBookings();
}

// Initial state: Start on Login Screen
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('screen-login');
});
