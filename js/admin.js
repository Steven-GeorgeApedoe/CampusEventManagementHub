// Check for admin authentication
if (!localStorage.getItem('token') || localStorage.getItem('userRole') !== 'admin') {
    window.location.href = '/pages/adminLogin.html';
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAdmin');
    window.location.href = '/pages/adminLogin.html';
});

// Create event
document.getElementById('createEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const eventData = {
        name: document.getElementById('eventName').value,
        description: document.getElementById('eventDescription').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        type: document.getElementById('eventType').value,
        capacity: parseInt(document.getElementById('eventCapacity').value)
    };

    try {
        const response = await fetch('http://localhost:5000/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            alert('Event created successfully');
            document.getElementById('createEventForm').reset();
            fetchEvents();
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to create event');
        }
    } catch (err) {
        console.error('Error creating event:', err);
        alert('Error creating event');
    }
});

// Add event stats
function updateEventStats(events) {
    const stats = {
        total: events.length,
        upcoming: events.filter(e => new Date(e.date) > new Date()).length,
        workshops: events.filter(e => e.type === 'workshop').length,
        seminars: events.filter(e => e.type === 'seminar').length,
        clubs: events.filter(e => e.type === 'club').length
    };

    document.getElementById('statsContainer').innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <p class="text-sm text-gray-600">Total Events</p>
                <p class="text-2xl font-bold text-admin-primary">${stats.total}</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <p class="text-sm text-gray-600">Upcoming</p>
                <p class="text-2xl font-bold text-green-600">${stats.upcoming}</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <p class="text-sm text-gray-600">Workshops</p>
                <p class="text-2xl font-bold text-blue-600">${stats.workshops}</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <p class="text-sm text-gray-600">Seminars</p>
                <p class="text-2xl font-bold text-purple-600">${stats.seminars}</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <p class="text-sm text-gray-600">Club Events</p>
                <p class="text-2xl font-bold text-orange-600">${stats.clubs}</p>
            </div>
        </div>
    `;
}

// Add search functionality
let allEvents = [];
document.getElementById('searchEvents').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredEvents = allEvents.filter(event => 
        event.name.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm)
    );
    displayEvents(filteredEvents);
});

// Update fetchEvents to store all events and update stats
async function fetchEvents() {
    try {
        const response = await fetch('http://localhost:5000/api/events', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            allEvents = await response.json();
            displayEvents(allEvents);
            updateEventStats(allEvents);
        }
    } catch (err) {
        console.error('Error fetching events:', err);
    }
}

// Display events in the list
function displayEvents(events) {
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = '';

    events.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = 'p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200 group';
        eventEl.innerHTML = `
            <div class="flex justify-between items-start space-x-4">
                <div>
                    <h3 class="font-semibold text-gray-900 group-hover:text-admin-primary transition-colors duration-200">
                        ${event.name}
                    </h3>
                    <p class="text-sm text-gray-600">
                        <span class="inline-flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            ${new Date(event.date).toLocaleDateString()} at ${event.time}
                        </span>
                    </p>
                    <p class="text-sm text-gray-600">
                        <span class="inline-flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            ${event.location}
                        </span>
                    </p>
                </div>
                <div class="space-x-2">
                    <button onclick="deleteEvent('${event._id}')"
                        class="text-red-500 hover:text-red-700 font-medium transition-colors duration-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
        eventList.appendChild(eventEl);
    });
}

// Delete event
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
        const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            fetchEvents();
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to delete event');
        }
    } catch (err) {
        console.error('Error deleting event:', err);
        alert('Error deleting event');
    }
}

// Add filter functionality
function filterEvents(type) {
    let filteredEvents;
    if (type === 'upcoming') {
        filteredEvents = allEvents.filter(event => new Date(event.date) > new Date());
    } else {
        filteredEvents = allEvents;
    }
    displayEvents(filteredEvents);
}

// Initial fetch
fetchEvents(); 