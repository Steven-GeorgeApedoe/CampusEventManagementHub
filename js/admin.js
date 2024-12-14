let currentEventId = null;

document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const eventData = {
        name: document.getElementById('eventName').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        capacity: parseInt(document.getElementById('eventCapacity').value)
    };

    try {
        const response = await fetch('http://localhost:5000/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            document.getElementById('successModal').classList.remove('hidden');
            document.getElementById('eventForm').reset();
            loadEvents(); // Refresh the events list
            // Dispatch event created notification
            window.dispatchEvent(new Event('eventCreated'));
        } else {
            alert('Failed to create event');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create event');
    }
});

async function loadEvents() {
    try {
        const response = await fetch('http://localhost:5000/api/events', {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
        
        const events = await response.json();
        const eventsList = document.getElementById('eventsList');
        eventsList.innerHTML = '';
        
        events.forEach(event => {
            eventsList.innerHTML += `
                <div class="bg-white p-6 rounded-lg shadow-md relative">
                    <h3 class="text-xl font-bold mb-2">${event.name}</h3>
                    <p class="text-gray-600 mb-2">Date: ${event.date}</p>
                    <p class="text-gray-600 mb-2">Time: ${event.time}</p>
                    <p class="text-gray-600 mb-2">Location: ${event.location}</p>
                    <p class="text-gray-600">Capacity: ${event.capacity} people</p>
                    <button onclick="showDeleteModal('${event._id}')"
                            class="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Remove Event
                    </button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

function showDeleteModal(eventId) {
    currentEventId = eventId;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    currentEventId = null;
}

function closeModal() {
    document.getElementById('successModal').classList.add('hidden');
}

document.getElementById('confirmDelete').addEventListener('click', async () => {
    if (!currentEventId) return;
    
    try {
        const response = await fetch(`http://localhost:5000/api/events/${currentEventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            closeDeleteModal();
            loadEvents(); // Refresh the events list
            // Dispatch event deleted notification
            window.dispatchEvent(new Event('eventDeleted'));
        } else {
            alert('Failed to delete event');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete event');
    }
});

// Load events when page loads
document.addEventListener('DOMContentLoaded', loadEvents); 

function logout() {
    // Clear the authentication token
    localStorage.removeItem('token');
    // Redirect to index page
    window.location.href = 'index.html';
}