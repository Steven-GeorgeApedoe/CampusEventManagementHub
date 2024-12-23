// Check for authentication
if (!localStorage.getItem('token')) {
    window.location.href = '/pages/login.html';
}

let calendar;
let events = [];

// Initialize calendar
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        },
        views: {
            dayGridMonth: { buttonText: 'Month' },
            timeGridWeek: { buttonText: 'Week' },
            timeGridDay: { buttonText: 'Day' },
            listMonth: { buttonText: 'List' }
        },
        events: function(info, successCallback, failureCallback) {
            fetch('http://localhost:5000/api/events/calendar', {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            })
            .then(response => response.json())
            .then(data => successCallback(data))
            .catch(err => failureCallback(err));
        },
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        eventDidMount: function(info) {
            // Add tooltips
            info.el.title = `${info.event.title}\nLocation: ${info.event.extendedProps.location}\n${info.event.extendedProps.description}`;
        },
        // Enable event dragging and resizing for admin users
        editable: localStorage.getItem('isAdmin') === 'true',
        // Allow external events to be dropped onto the calendar
        droppable: localStorage.getItem('isAdmin') === 'true',
        // Callback for when events are modified
        eventChange: function(info) {
            if (localStorage.getItem('isAdmin') === 'true') {
                updateEventDates(info.event);
            }
        }
    });
    calendar.render();
    
    fetchEvents();
});

// Add these functions to handle filtering

let currentFilter = {
    type: '',
    search: '',
    fromDate: '',
    toDate: ''
};

// Add event listeners for filters
document.getElementById('typeFilter').addEventListener('change', updateFilters);
document.getElementById('searchInput').addEventListener('input', debounce(updateFilters, 300));
document.getElementById('fromDate').addEventListener('change', updateFilters);
document.getElementById('toDate').addEventListener('change', updateFilters);
document.getElementById('clearFilters').addEventListener('click', clearFilters);
document.getElementById('showRecommended').addEventListener('click', showRecommendedEvents);

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update filters and fetch events
async function updateFilters() {
    currentFilter = {
        type: document.getElementById('typeFilter').value,
        search: document.getElementById('searchInput').value,
        fromDate: document.getElementById('fromDate').value,
        toDate: document.getElementById('toDate').value
    };
    await fetchEvents();
}

// Clear all filters
function clearFilters() {
    document.getElementById('typeFilter').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('fromDate').value = '';
    document.getElementById('toDate').value = '';
    currentFilter = {
        type: '',
        search: '',
        fromDate: '',
        toDate: ''
    };
    fetchEvents();
}

// Show recommended events
async function showRecommendedEvents() {
    try {
        const response = await fetch('http://localhost:5000/api/events/recommended', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        events = await response.json();
        
        // Update calendar and events list
        updateCalendar();
        updateUpcomingEvents();
    } catch (err) {
        console.error('Error fetching recommended events:', err);
    }
}

// Update the fetchEvents function to include filters
async function fetchEvents() {
    try {
        const queryParams = new URLSearchParams(currentFilter).toString();
        const response = await fetch(`http://localhost:5000/api/events?${queryParams}`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        events = await response.json();
        
        // Update calendar and events list
        updateCalendar();
        updateUpcomingEvents();
    } catch (err) {
        console.error('Error fetching events:', err);
    }
}

// Update calendar with filtered events
function updateCalendar() {
    calendar.removeAllEvents();
    calendar.addEventSource(events.map(event => ({
        id: event._id,
        title: event.name,
        start: event.date,
        allDay: true,
        extendedProps: {
            description: event.description,
            location: event.location,
            capacity: event.capacity,
            registeredUsers: event.registeredUsers
        }
    })));
}

// Update upcoming events sidebar
function updateUpcomingEvents() {
    const upcomingEventsDiv = document.getElementById('upcomingEvents');
    upcomingEventsDiv.innerHTML = '';

    const now = new Date();
    const upcomingEvents = events
        .filter(event => new Date(event.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    upcomingEvents.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = 'p-4 border rounded-lg hover:bg-gray-50';
        eventEl.innerHTML = `
            <h3 class="font-semibold">${event.name}</h3>
            <p class="text-sm text-gray-600">${new Date(event.date).toLocaleDateString()}</p>
            <p class="text-sm text-gray-600">${event.location}</p>
            <button 
                onclick="registerForEvent('${event._id}')"
                class="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                ${event.registeredUsers.length >= event.capacity ? 'disabled' : ''}
            >
                ${event.registeredUsers.length >= event.capacity ? 'Full' : 'Register'}
            </button>
        `;
        upcomingEventsDiv.appendChild(eventEl);
    });
}

// Register for an event
async function registerForEvent(eventId) {
    try {
        const response = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
            method: 'POST',
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            await fetchEvents(); // Refresh events
            alert('Successfully registered for the event!');
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to register for the event');
        }
    } catch (err) {
        console.error('Error registering for event:', err);
        alert('Failed to register for the event');
    }
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    window.location.href = '/pages/login.html';
});

// Add these functions to handle calendar integration and social features

// Add event to calendar
async function addToCalendar(eventId) {
    try {
        const response = await fetch(`http://localhost:5000/api/events/${eventId}/calendar`, {
            method: 'POST',
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            alert('Event added to calendar successfully!');
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to add event to calendar');
        }
    } catch (err) {
        console.error('Error adding to calendar:', err);
        alert('Failed to add event to calendar');
    }
}

// Add comment to event
async function addComment(eventId, comment) {
    try {
        const response = await fetch(`http://localhost:5000/api/events/${eventId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ text: comment })
        });

        if (response.ok) {
            await fetchEvents();
            return true;
        }
        return false;
    } catch (err) {
        console.error('Error adding comment:', err);
        return false;
    }
}

// Rate event
async function rateEvent(eventId, score) {
    try {
        const response = await fetch(`http://localhost:5000/api/events/${eventId}/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ score })
        });

        if (response.ok) {
            await fetchEvents();
            return true;
        }
        return false;
    } catch (err) {
        console.error('Error rating event:', err);
        return false;
    }
}

// Update the event details display to include social features
function showEventDetails(event) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">${event.title}</h3>
            <p class="text-gray-600 mb-2">${event.extendedProps.description}</p>
            <p class="text-gray-600 mb-4">Location: ${event.extendedProps.location}</p>
            
            <div class="mb-4">
                <h4 class="font-semibold mb-2">Rating</h4>
                <div class="flex space-x-2">
                    ${[1, 2, 3, 4, 5].map(score => `
                        <button onclick="rateEvent('${event.id}', ${score})"
                            class="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded">
                            ${score}⭐
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="mb-4">
                <h4 class="font-semibold mb-2">Comments</h4>
                <div id="comments-${event.id}" class="space-y-2 max-h-40 overflow-y-auto">
                    <!-- Comments will be loaded here -->
                </div>
                <div class="mt-2">
                    <textarea id="comment-input-${event.id}" 
                        class="w-full p-2 border rounded"
                        placeholder="Add a comment..."></textarea>
                    <button onclick="addComment('${event.id}', document.getElementById('comment-input-${event.id}').value)"
                        class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Add Comment
                    </button>
                </div>
            </div>

            <div class="flex justify-between">
                <button onclick="addToCalendar('${event.id}')"
                    class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Add to Calendar
                </button>
                <button onclick="this.parentElement.parentElement.remove()"
                    class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Function to update event dates when dragged
async function updateEventDates(event) {
    try {
        const response = await fetch(`http://localhost:5000/api/events/${event.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                date: event.start,
                time: event.start.toTimeString().split(' ')[0]
            })
        });

        if (!response.ok) {
            // Revert the change if update fails
            calendar.getEventById(event.id).setProp('start', event._def.extendedProps.originalStart);
            alert('Failed to update event date');
        }
    } catch (err) {
        console.error('Error updating event dates:', err);
        calendar.getEventById(event.id).setProp('start', event._def.extendedProps.originalStart);
        alert('Failed to update event date');
    }
}

// Add export calendar functionality
function exportCalendar() {
    const events = calendar.getEvents();
    const icsEvents = events.map(event => {
        const start = event.start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const end = (event.end || event.start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        return `BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.extendedProps.description || ''}
LOCATION:${event.extendedProps.location || ''}
END:VEVENT`;
    }).join('\n');

    const calendar = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Campus Events//EN
${icsEvents}
END:VCALENDAR`;

    const blob = new Blob([calendar], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campus-events.ics';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Add these functions to handle notifications

let notifications = [];

// Fetch notifications
async function fetchNotifications() {
    try {
        const response = await fetch('http://localhost:5000/api/notifications', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        notifications = await response.json();
        updateNotificationUI();
    } catch (err) {
        console.error('Error fetching notifications:', err);
    }
}

// Update notification UI
function updateNotificationUI() {
    const notificationCount = document.getElementById('notificationCount');
    const notificationList = document.getElementById('notificationList');
    const unreadCount = notifications.filter(n => !n.read).length;

    // Update count badge
    if (unreadCount > 0) {
        notificationCount.textContent = unreadCount;
        notificationCount.classList.remove('hidden');
    } else {
        notificationCount.classList.add('hidden');
    }

    // Update notification list
    notificationList.innerHTML = notifications.length ? '' : 
        '<div class="px-4 py-2 text-sm text-gray-500">No notifications</div>';

    notifications.forEach(notification => {
        const notificationEl = document.createElement('div');
        notificationEl.className = `px-4 py-2 hover:bg-gray-50 ${notification.read ? 'bg-gray-50' : 'bg-white'}`;
        notificationEl.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${notification.message}</p>
                    <p class="text-xs text-gray-500">${new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                <button onclick="deleteNotification('${notification._id}')"
                    class="ml-2 text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;
        
        if (!notification.read) {
            notificationEl.addEventListener('click', () => markAsRead(notification._id));
        }
        
        notificationList.appendChild(notificationEl);
    });
}

// Toggle notification dropdown
document.getElementById('notificationBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown.contains(e.target) && !e.target.matches('#notificationBtn')) {
        dropdown.classList.add('hidden');
    }
});

// Mark notification as read
async function markAsRead(notificationId) {
    try {
        const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
            method: 'PUT',
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            await fetchNotifications();
        }
    } catch (err) {
        console.error('Error marking notification as read:', err);
    }
}

// Delete notification
async function deleteNotification(notificationId) {
    try {
        const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            await fetchNotifications();
        }
    } catch (err) {
        console.error('Error deleting notification:', err);
    }
}

// Clear all notifications
document.getElementById('clearAllNotifications').addEventListener('click', async () => {
    try {
        await Promise.all(notifications.map(n => deleteNotification(n._id)));
        await fetchNotifications();
    } catch (err) {
        console.error('Error clearing notifications:', err);
    }
});

// Fetch notifications periodically
setInterval(fetchNotifications, 30000); // Check every 30 seconds

// Initial fetch
fetchNotifications(); 