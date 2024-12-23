// Check for authentication
if (!localStorage.getItem('token')) {
    window.location.href = '/pages/login.html';
}

// Fetch user profile
async function fetchProfile() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const user = await response.json();
        
        // Populate form
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        
        // Set preferences
        const preferences = document.getElementsByName('preferences');
        preferences.forEach(pref => {
            pref.checked = user.preferences.includes(pref.value);
        });

        // Fetch and display registered events
        fetchRegisteredEvents(user.registeredEvents);
    } catch (err) {
        console.error('Error fetching profile:', err);
        alert('Failed to load profile');
    }
}

// Update profile
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const preferences = Array.from(document.getElementsByName('preferences'))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const profileData = {
        name: document.getElementById('name').value,
        preferences
    };

    try {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify(profileData)
        });

        if (response.ok) {
            alert('Profile updated successfully!');
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to update profile');
        }
    } catch (err) {
        console.error('Error updating profile:', err);
        alert('Failed to update profile');
    }
});

// Fetch and display registered events
async function fetchRegisteredEvents(eventIds) {
    try {
        const eventsDiv = document.getElementById('registeredEvents');
        eventsDiv.innerHTML = '';

        if (!eventIds.length) {
            eventsDiv.innerHTML = '<p class="text-gray-500">No registered events</p>';
            return;
        }

        const events = await Promise.all(eventIds.map(async (eventId) => {
            const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            });
            return response.json();
        }));

        events.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'p-4 border rounded-lg hover:bg-gray-50';
            eventEl.innerHTML = `
                <h3 class="font-semibold">${event.name}</h3>
                <p class="text-sm text-gray-600">${new Date(event.date).toLocaleDateString()}</p>
                <p class="text-sm text-gray-600">${event.location}</p>
                <button onclick="cancelRegistration('${event._id}')"
                    class="mt-2 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Cancel Registration
                </button>
            `;
            eventsDiv.appendChild(eventEl);
        });
    } catch (err) {
        console.error('Error fetching registered events:', err);
    }
}

// Cancel event registration
async function cancelRegistration(eventId) {
    if (!confirm('Are you sure you want to cancel your registration?')) return;

    try {
        const response = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
            method: 'DELETE',
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            await fetchProfile();
            alert('Registration cancelled successfully!');
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to cancel registration');
        }
    } catch (err) {
        console.error('Error cancelling registration:', err);
        alert('Failed to cancel registration');
    }
}

// Add password change functionality
async function changePassword(currentPassword, newPassword) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Password updated successfully');
            return true;
        } else {
            alert(data.msg || 'Failed to update password');
            return false;
        }
    } catch (err) {
        console.error('Error changing password:', err);
        alert('Failed to update password');
        return false;
    }
}

// Update event history display
async function updateEventHistory() {
    try {
        const response = await fetch('http://localhost:5000/api/events/history', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        const events = await response.json();
        
        const historyTableBody = document.getElementById('eventHistory');
        historyTableBody.innerHTML = '';

        events.forEach(event => {
            const row = document.createElement('tr');
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date();
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${event.name}</div>
                    <div class="text-sm text-gray-500">${event.type}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                        ${eventDate.toLocaleDateString()}
                    </div>
                    <div class="text-sm text-gray-500">${event.time}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${isPast ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}">
                        ${isPast ? 'Past' : 'Upcoming'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${!isPast ? `
                        <button onclick="cancelRegistration('${event._id}')"
                            class="text-red-600 hover:text-red-900">
                            Cancel
                        </button>
                    ` : `
                        <button onclick="showEventDetails('${event._id}')"
                            class="text-blue-600 hover:text-blue-900">
                            View Details
                        </button>
                    `}
                </td>
            `;
            historyTableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Error fetching event history:', err);
    }
}

// Show event details modal
function showEventDetails(eventId) {
    // Find event in the history
    const event = events.find(e => e._id === eventId);
    if (!event) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 class="text-lg font-bold mb-4">${event.name}</h3>
            <div class="space-y-3">
                <p class="text-gray-600">${event.description}</p>
                <p class="text-sm text-gray-500">
                    <span class="font-semibold">Date:</span> 
                    ${new Date(event.date).toLocaleDateString()}
                </p>
                <p class="text-sm text-gray-500">
                    <span class="font-semibold">Time:</span> 
                    ${event.time}
                </p>
                <p class="text-sm text-gray-500">
                    <span class="font-semibold">Location:</span> 
                    ${event.location}
                </p>
                <p class="text-sm text-gray-500">
                    <span class="font-semibold">Type:</span> 
                    ${event.type}
                </p>
            </div>
            <div class="mt-4">
                <button onclick="this.parentElement.parentElement.remove()"
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Initialize event history on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchProfile();
    updateEventHistory();
});

// Initialize
document.addEventListener('DOMContentLoaded', fetchProfile);

// Logout functionality
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    window.location.href = '/pages/login.html';
}

// Add click handlers for both logout buttons
document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
document.getElementById('mainLogoutBtn')?.addEventListener('click', handleLogout);

// Profile dropdown toggle
const profileDropdown = document.getElementById('profileDropdown');
const dropdownMenu = profileDropdown?.querySelector('.absolute');

if (profileDropdown && dropdownMenu) {
    profileDropdown.addEventListener('click', (e) => {
        if (!e.target.closest('.absolute')) {
            dropdownMenu.classList.toggle('hidden');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });
}

// Profile modal
const profileModal = document.getElementById('profileModal');
const viewProfileBtn = document.getElementById('viewProfileBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const closeProfileModal = document.getElementById('closeProfileModal');
const cancelProfileEdit = document.getElementById('cancelProfileEdit');
const profileForm = document.getElementById('profileForm');

// Only set up event listeners if elements exist
if (viewProfileBtn && editProfileBtn && profileModal && profileForm) {
    // Modal controls
    function showProfileModal(editable = false) {
        profileModal.classList.remove('hidden');
        dropdownMenu.classList.add('hidden');
        loadProfileData(editable);
    }

    function hideProfileModal() {
        profileModal.classList.add('hidden');
        profileForm.reset();
    }

    viewProfileBtn.addEventListener('click', () => showProfileModal(false));
    editProfileBtn.addEventListener('click', () => showProfileModal(true));
    closeProfileModal.addEventListener('click', hideProfileModal);
    cancelProfileEdit.addEventListener('click', hideProfileModal);

    // Profile form submission
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // ... rest of the form submission code
    });
}

// Load profile data
async function loadProfileData(editable) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const profile = await response.json();
            document.getElementById('profileName').value = profile.name;
            document.getElementById('profileEmail').value = profile.email;
            
            // Toggle edit mode
            document.getElementById('profileName').disabled = !editable;
            document.getElementById('newPassword').disabled = !editable;
            document.getElementById('cancelProfileEdit').style.display = editable ? 'block' : 'none';
            profileForm.querySelector('button[type="submit"]').style.display = editable ? 'block' : 'none';
        }
    } catch (err) {
        console.error('Error loading profile:', err);
        alert('Error loading profile data');
    }
}

// Update profile
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updates = {
        name: document.getElementById('profileName').value
    };

    const newPassword = document.getElementById('newPassword').value;
    if (newPassword) {
        updates.password = newPassword;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify(updates)
        });

        if (response.ok) {
            alert('Profile updated successfully');
            hideProfileModal();
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to update profile');
        }
    } catch (err) {
        console.error('Error updating profile:', err);
        alert('Error updating profile');
    }
}); 