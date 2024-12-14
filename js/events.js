import api from './services/api';

async function loadEvents() {
  try {
    const events = await api.getEvents();
    const eventList = document.querySelector('#event-list');
    events.forEach(event => {
      eventList.innerHTML += `
        <div class="event-card">
          <h3>${event.name}</h3>
          <p>Date: ${event.date}</p>
          <p>Time: ${event.time}</p>
          <p>Location: ${event.location}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error('Error loading events:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadEvents); 