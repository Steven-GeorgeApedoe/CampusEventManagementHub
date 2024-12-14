document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: fetchEvents
    });

    calendar.render();

    // Subscribe to event updates
    subscribeToEventUpdates(calendar);
});

async function fetchEvents() {
    try {
        const response = await fetch('http://localhost:5000/api/events', {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
        
        const events = await response.json();
        return events.map(event => ({
            title: event.name,
            start: `${event.date}T${event.time}`,
            extendedProps: {
                location: event.location,
                capacity: event.capacity,
                eventId: event._id
            }
        }));
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

function subscribeToEventUpdates(calendar) {
    // Listen for event creation
    window.addEventListener('eventCreated', async () => {
        const events = await fetchEvents();
        calendar.removeAllEvents();
        calendar.addEventSource(events);
    });

    // Listen for event deletion
    window.addEventListener('eventDeleted', async () => {
        const events = await fetchEvents();
        calendar.removeAllEvents();
        calendar.addEventSource(events);
    });
} 