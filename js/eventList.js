document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:5000/api/events', {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
        
        const events = await response.json();
        const eventList = document.getElementById('eventList');
        
        events.forEach(event => {
            eventList.innerHTML += `
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold mb-2">${event.name}</h3>
                    <p class="text-gray-600 mb-2">Date: ${event.date}</p>
                    <p class="text-gray-600 mb-2">Time: ${event.time}</p>
                    <p class="text-gray-600 mb-2">Location: ${event.location}</p>
                    <p class="text-gray-600">Capacity: ${event.capacity} people</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        alert('Error loading events');
    }
}); 