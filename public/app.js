const state = {
  token: localStorage.getItem('fadeToken') || '',
  user: JSON.parse(localStorage.getItem('fadeUser') || 'null')
};

const authStatus = document.getElementById('authStatus');
const salonList = document.getElementById('salonList');
const bookingStatus = document.getElementById('bookingStatus');
const dashboardOutput = document.getElementById('dashboardOutput');

const apiRequest = async (path, options = {}) => {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: state.token } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || data.errors?.[0]?.msg || 'Request failed';
    throw new Error(message);
  }

  return data;
};

const setAuthSession = (payload) => {
  state.token = payload.token;
  state.user = payload.user;
  localStorage.setItem('fadeToken', payload.token);
  localStorage.setItem('fadeUser', JSON.stringify(payload.user));
  authStatus.textContent = `Signed in as ${payload.user.name} (${payload.user.role})`;
};

document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const body = Object.fromEntries(formData.entries());

  try {
    const payload = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    setAuthSession(payload);
  } catch (error) {
    authStatus.textContent = error.message;
  }
});

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const body = Object.fromEntries(formData.entries());

  try {
    const payload = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    setAuthSession(payload);
  } catch (error) {
    authStatus.textContent = error.message;
  }
});

const renderSalon = (entry) => {
  const div = document.createElement('article');
  div.className = 'salon';
  div.innerHTML = `
    <h3>${entry.salon.name}</h3>
    <small>${entry.salon.address.city} • Rating ${entry.salon.rating || 0}</small>
    <p>${entry.salon.description || 'No description yet.'}</p>
    <p><strong>Salon ID:</strong> ${entry.salon._id}</p>
    <p><strong>Services:</strong> ${entry.services.map((service) => `${service.name} (₹${service.price})`).join(', ') || 'None yet'}</p>
    <p><strong>Workers:</strong> ${entry.workers.map((worker) => `${worker.name} • ${worker.specialization}`).join(', ') || 'None yet'}</p>
    <p><strong>Open Slots:</strong> ${entry.workers
      .flatMap((worker) => worker.availableSlots || [])
      .map((slot) => new Date(slot).toLocaleString())
      .join(', ') || 'No slots available'}</p>
  `;
  return div;
};

const loadSalons = async (params = new URLSearchParams()) => {
  salonList.innerHTML = 'Loading salons...';
  const salons = await apiRequest(`/api/salons?${params.toString()}`);

  if (!salons.length) {
    salonList.innerHTML = '<p>No salons found for this filter.</p>';
    return;
  }

  const details = await Promise.all(salons.map((salon) => apiRequest(`/api/salons/${salon._id}`)));
  salonList.innerHTML = '';
  details.forEach((entry) => salonList.appendChild(renderSalon(entry)));
};

document.getElementById('searchForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const params = new URLSearchParams();
  for (const [key, value] of formData.entries()) {
    if (value.trim()) {
      params.set(key, value.trim());
    }
  }

  try {
    await loadSalons(params);
  } catch (error) {
    salonList.innerHTML = `<p>${error.message}</p>`;
  }
});

document.getElementById('bookingForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const body = Object.fromEntries(formData.entries());

  if (!state.token) {
    bookingStatus.textContent = 'Please sign in first.';
    return;
  }

  body.appointmentTime = new Date(body.appointmentTime).toISOString();

  try {
    const booking = await apiRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    bookingStatus.textContent = `Booked successfully. Booking ID: ${booking._id}`;
  } catch (error) {
    bookingStatus.textContent = error.message;
  }
});

document.getElementById('myBookingsBtn').addEventListener('click', async () => {
  try {
    const bookings = await apiRequest('/api/bookings/me');
    dashboardOutput.textContent = JSON.stringify(bookings, null, 2);
  } catch (error) {
    dashboardOutput.textContent = error.message;
  }
});

document.getElementById('ownerBookingsBtn').addEventListener('click', async () => {
  try {
    const bookings = await apiRequest('/api/bookings/owner');
    dashboardOutput.textContent = JSON.stringify(bookings, null, 2);
  } catch (error) {
    dashboardOutput.textContent = error.message;
  }
});

if (state.user) {
  authStatus.textContent = `Signed in as ${state.user.name} (${state.user.role})`;
}

loadSalons().catch(() => {
  salonList.innerHTML = '<p>Unable to load salons. Start backend server and ensure MongoDB is available.</p>';
});
