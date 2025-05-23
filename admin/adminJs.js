function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  toastMsg.textContent = message;
  toast.style.display = 'block';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 500);
  }, duration);
}



function authHeader() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

function showSpinner() {
  document.getElementById('global-spinner').style.display = 'flex';
}

function hideSpinner() {
  document.getElementById('global-spinner').style.display = 'none';
}

function showToast(message, type = "info") {
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    backgroundColor: type === "error" ? "linear-gradient(to right, #ff5f6d, #ffc371)" :
                     type === "success" ? "linear-gradient(to right, #00b09b, #96c93d)" :
                     "linear-gradient(to right, #2196F3, #21CBF3)",
    stopOnFocus: true,
  }).showToast();
}

function showSection(sectionId) {
  document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');

  switch (sectionId) {
    case 'dashboard': loadDashboardStats(); break;
    case 'users': loadUsers(); break;
    case 'media': loadMedia(); break;
    case 'plans': loadPlans(); break;
    case 'feedbacks': loadFeedbacks(); break; 
  }
}

function loadDashboardStats() {
  const token = localStorage.getItem('token');
  if (!token) {
    showToast('You must be logged in as admin');
    return;
  }

  const statsContainer = document.getElementById('dashboard-stats');
  statsContainer.innerHTML = `
    <div class="card">Users: Loading...</div>
    <div class="card">Media: Loading...</div>
  `;

  showSpinner();
  Promise.all([
    fetch('/api/admin/users', { headers: authHeader() }),
    fetch('/api/admin/media', { headers: authHeader() })
  ])
    .then(async ([usersRes, mediaRes]) => {
      const usersData = await usersRes.json();
      const mediaData = await mediaRes.json();

      statsContainer.innerHTML = `
        <div class="card">Users: ${usersData?.users?.length || 0}</div>
        <div class="card">Media: ${mediaData?.media?.length || 0}</div>
      `;
    })
    .catch(err => {
      console.error('Dashboard stats error:', err);
      statsContainer.innerHTML = `<div class="card">Error loading stats</div>`;
    })
    .finally(() => hideSpinner());
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function loadUsers() {
  showSpinner();
  fetch('/api/admin/users', { headers: authHeader() })
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#user-table tbody');
      tbody.innerHTML = '';

      data.users.forEach(user => {
        const currentPlanId = user.plan?._id || '';
        const currentPlanName = user.plan?.name || 'Free';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${formatDate(user.createdAt)}</td>
          <td>
            ${user.role === 'admin' ? '—' : `
              <select onchange="changeUserPlan('${user._id}', this.value)">
                ${availablePlans.map(plan => `
                  <option value="${plan._id}" ${plan._id === currentPlanId ? 'selected' : ''}>
                    ${plan.name}
                  </option>
                `).join('')}
              </select>
            `}
          </td>
          <td><button onclick="deleteUser('${user._id}')">Delete</button></td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => console.error('Failed to load users:', err))
    .finally(() => hideSpinner());
}

function loadPlans() {
  showSpinner();
  fetch('/api/admin/plans/stats', { headers: authHeader() })
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('plan-list');
      container.innerHTML = `
        <h3>Total Users: ${data.totalUsers}</h3>
        <h4>Users Without a Plan: ${data.usersWithoutPlan}</h4>
      `;

      Object.entries(data.plans).forEach(([planName, users]) => {
        const planBlock = document.createElement('div');
        planBlock.classList.add('plan-block');
        planBlock.innerHTML = `
          <h4>${planName.toUpperCase()} (${users.length})</h4>
          <ul>
            ${users.map(user => `
              <li>
                <strong>${user.name}</strong> - ${user.email}
                <br><small>Updated: ${formatDate(user.updated)}</small>
              </li>
            `).join('')}
          </ul>
        `;
        container.appendChild(planBlock);
      });
    })
    .catch(err => {
      console.error('Failed to load plan stats:', err);
      document.getElementById('plan-list').innerHTML = 'Error loading plans.';
    })
    .finally(() => hideSpinner());
}

function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  showSpinner();
  fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: authHeader()
  })
    .then(res => res.json())
    .then(data => {
      showToast(data.message || 'User deleted', 'success');
      loadUsers();
    })
    .catch(err => console.error('Delete error:', err))
    .finally(() => hideSpinner());
}

function loadMedia() {
  showSpinner();
  fetch('/api/admin/media', { headers: authHeader() })
    .then(res => res.json())
    .then(data => {
      const mediaList = document.getElementById('media-list');
      mediaList.innerHTML = '';

      data.media.forEach(m => {
        const div = document.createElement('div');
        div.classList.add('media-item');
        div.innerHTML = `
          <strong>${m.type.toUpperCase()}</strong> — ${m.title || 'Untitled'} <br>
          <small>${new Date(m.createdAt).toLocaleString()}</small>
          <hr>
        `;
        mediaList.appendChild(div);
      });
    })
    .catch(err => console.error('Failed to load media:', err))
    .finally(() => hideSpinner());
}

let availablePlans = [];

function fetchPlans() {
  fetch('/api/admin/plans', { headers: authHeader() })
    .then(res => res.json())
    .then(data => {
      availablePlans = data;
    });
}

function changeUserPlan(userId, planId) {
  if (!planId) return;
  showSpinner();
  fetch(`/api/admin/users/${userId}/plan`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify({ planId })
  })
    .then(res => res.json())
    .then(data => {
      showToast(data.message, 'success');
      loadUsers();
    })
    .finally(() => hideSpinner());
}


async function loadFeedbacks() {
  try {
    console.log("Fetching feedbacks...");
    const response = await fetch("http://localhost:5000/api/feedbacks/admin", {
      headers: authHeader(),
    });

    const data = await response.json();
    console.log("Fetched Feedbacks:", data);

    const container = document.getElementById("feedback-list");
    container.innerHTML = "";

    if (!Array.isArray(data)) {
      container.innerHTML = "<p>No feedbacks available.</p>";
      return;
    }

    data.forEach((fb) => {
      const div = document.createElement("div");
      div.classList.add("feedback-entry");

     div.setAttribute('id', `feedback-${fb._id}`);
      div.innerHTML = `
       <h4>${fb.subject || "No Subject"}</h4>
        <p><strong>From:</strong> ${fb.user?.name || "Unknown"} (${fb.user?.email || "N/A"})</p>
        <p><strong>Rating:</strong> ${fb.rating}</p>
        <p>${fb.message}</p>
        <textarea id="reply-${fb._id}" placeholder="Write reply here..." rows="3" style="width:100%;"></textarea>
        <button onclick="sendReply('${fb._id}')">Send Reply</button>
        <hr/>
`;


      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load feedbacks:", err);
  }
}

function sendReply(feedbackId) {
  const replyText = document.getElementById(`reply-${feedbackId}`).value;

  if (!replyText.trim()) {
    showToast('Reply cannot be empty.');
    return;
  }

  fetch(`http://localhost:5000/api/feedbacks/${feedbackId}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}` // Or your authHeader()
    },
    body: JSON.stringify({ reply: replyText })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message) {
      showToast('Reply sent!');
      // Auto-remove feedback from UI
      const entry = document.getElementById(`feedback-${feedbackId}`);
      if (entry) entry.remove();
    } else {
      showToast('Reply failed');
    }
  })
  .catch(err => {
    console.error('Reply failed:', err);
    showToast('Reply failed');
  });
}



function deleteFeedback(feedbackId) {
  if (!confirm('Are you sure you want to delete this feedback?')) return;

  fetch(`/api/feedbacks/admin/${feedbackId}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
    .then(res => res.json())
    .then(data => {
      showToast(data.message || 'Feedback deleted', 'success');
      loadFeedbacks();
    })
    .catch(err => {
      console.error('Delete error:', err);
      showToast('Failed to delete feedback', 'error');
    });
}



document.addEventListener('DOMContentLoaded', () => {
  fetchPlans();
  showSection('dashboard');
});

