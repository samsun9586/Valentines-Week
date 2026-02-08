// Milestone Detail Page Functionality
let currentMilestoneId = null;

// Get milestone ID from URL
const urlParams = new URLSearchParams(window.location.search);
currentMilestoneId = urlParams.get('id');

// Load milestone data on page load
document.addEventListener('DOMContentLoaded', () => {
  if (!currentMilestoneId) {
    alert('No milestone selected');
    window.location.href = '/journey.html';
    return;
  }

  loadMilestoneData();
  setupReplyForm();
});

// Load milestone data
async function loadMilestoneData() {
  try {
    const res = await fetch(`${API_URL}/api/milestones/${currentMilestoneId}`, {
      credentials: 'include'
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/';
        return;
      } else if (res.status === 403) {
        alert('This milestone is not unlocked yet');
        window.location.href = '/journey.html';
        return;
      }
      throw new Error('Failed to load milestone');
    }

    const data = await res.json();
    displayMilestoneHeader(data.milestone);
    displayAdminContent(data.content);
    displayUserReplies(data.replies);
  } catch (error) {
    console.error('Load milestone error:', error);
    alert('Failed to load milestone details');
  }
}

// Display milestone header
function displayMilestoneHeader(milestone) {
  const milestoneIcons = {
    1: '🌹',
    2: '💍',
    3: '🍫',
    4: '🧸',
    5: '🤝',
    6: '🤗',
    7: '💋',
    8: '❤️'
  };

  const header = document.getElementById('milestoneHeader');
  header.innerHTML = `
    <div class="milestone-icon">${milestoneIcons[milestone.day_number] || '💕'}</div>
    <h1>${milestone.title}</h1>
    <p>${milestone.description}</p>
    ${milestone.unlock_date ? `
      <p style="font-size: 0.95rem; margin-top: var(--spacing-sm); opacity: 0.9;">
        Unlocked on ${new Date(milestone.unlock_date).toLocaleDateString()}
      </p>
    ` : ''}
  `;
}

// Display admin content
function displayAdminContent(content) {
  const container = document.getElementById('adminContent');

  if (!content || content.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💝</div>
        <p style="font-size: 1.1rem; font-weight: 600;">No content yet</p>
        <p>The surprise is being prepared...</p>
      </div>
    `;
    return;
  }

  container.innerHTML = content.map(item => {
    let contentBody = '';

    if (item.type === 'text') {
      contentBody = `<p class="content-text">${item.text_content}</p>`;
    } else if (item.type === 'image') {
      contentBody = `
        <div class="media-container">
          <img src="${item.file_path}" alt="Image">
        </div>
      `;
    } else if (item.type === 'audio') {
      contentBody = `
        <div class="media-container">
          <audio controls src="${item.file_path}"></audio>
        </div>
      `;
    } else if (item.type === 'video') {
      contentBody = `
        <div class="media-container">
          <video controls src="${item.file_path}"></video>
        </div>
      `;
    }

    return `
      <div class="content-item content-from-admin">
        <div class="content-meta">
          <span class="content-author">From Suraj ❤️</span>
          <span class="content-time">${new Date(item.created_at).toLocaleString()}</span>
        </div>
        <div class="content-body">
          ${contentBody}
        </div>
      </div>
    `;
  }).join('');
}

// Display user replies
function displayUserReplies(replies) {
  const container = document.getElementById('userReplies');

  if (!replies || replies.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💬</div>
        <p>You haven't replied yet</p>
        <p style="font-size: 0.9rem; color: var(--dark-gray);">Share your thoughts below!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = replies.map(reply => {
    let replyBody = '';

    if (reply.type === 'text') {
      replyBody = `<p class="content-text">${reply.text_content}</p>`;
    } else if (reply.type === 'image') {
      replyBody = `
        <div class="media-container">
          <img src="${reply.file_path}" alt="Image">
        </div>
      `;
    } else if (reply.type === 'audio') {
      replyBody = `
        <div class="media-container">
          <audio controls src="${reply.file_path}"></audio>
        </div>
      `;
    } else if (reply.type === 'video') {
      replyBody = `
        <div class="media-container">
          <video controls src="${reply.file_path}"></video>
        </div>
      `;
    }

    return `
      <div class="content-item content-from-user">
        <div class="content-meta">
          <span class="content-author">Gauri's Response 💝</span>
          <span class="content-time">${new Date(reply.created_at).toLocaleString()}</span>
        </div>
        <div class="content-body">
          ${replyBody}
        </div>
      </div>
    `;
  }).join('');
}

// Select reply type
function selectReplyType(type) {
  // Update active button
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-type="${type}"]`).classList.add('active');

  // Update hidden input
  document.getElementById('replyType').value = type;

  // Show/hide appropriate input
  const textInput = document.getElementById('textReplyInput');
  const fileInput = document.getElementById('fileReplyInput');

  if (type === 'text') {
    textInput.classList.remove('hidden');
    fileInput.classList.add('hidden');
  } else {
    textInput.classList.add('hidden');
    fileInput.classList.remove('hidden');

    // Update file input accept attribute
    const fileInputElement = document.getElementById('replyFile');
    if (type === 'image') {
      fileInputElement.accept = 'image/*';
    } else if (type === 'audio') {
      fileInputElement.accept = 'audio/*';
    } else if (type === 'video') {
      fileInputElement.accept = 'video/*';
    }
  }
}

// Setup reply form
function setupReplyForm() {
  const replyFile = document.getElementById('replyFile');
  const preview = document.getElementById('replyPreview');

  // File preview
  replyFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      preview.classList.add('hidden');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const fileType = file.type.split('/')[0];
      preview.classList.remove('hidden');

      if (fileType === 'image') {
        preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; border-radius: var(--radius-md);">`;
      } else if (fileType === 'audio') {
        preview.innerHTML = `<audio controls src="${e.target.result}" style="width: 100%;"></audio>`;
      } else if (fileType === 'video') {
        preview.innerHTML = `<video controls src="${e.target.result}" style="max-width: 100%; border-radius: var(--radius-md);"></video>`;
      } else {
        preview.innerHTML = `<p>✓ File selected: ${file.name}</p>`;
      }
    };

    reader.readAsDataURL(file);
  });

  // Form submission
  document.getElementById('replyForm').addEventListener('submit', handleReplySubmit);
}

// Handle reply submission
async function handleReplySubmit(e) {
  e.preventDefault();

  const replyType = document.getElementById('replyType').value;
  const formData = new FormData();
  formData.append('type', replyType);

  if (replyType === 'text') {
    const text = document.getElementById('replyText').value.trim();
    if (!text) {
      alert('Please enter your message');
      return;
    }
    formData.append('text', text);
  } else {
    const file = document.getElementById('replyFile').files[0];
    if (!file) {
      alert('Please select a file');
      return;
    }
    formData.append('file', file);
  }

  try {
    const res = await fetch(`${API_URL}/api/milestones/${currentMilestoneId}/reply`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!res.ok) throw new Error('Failed to submit reply');

    const data = await res.json();
    alert(data.message || 'Reply sent successfully! 💕');

    // Reset form
    document.getElementById('replyForm').reset();
    document.getElementById('replyPreview').classList.add('hidden');

    // Reload replies
    loadMilestoneData();
  } catch (error) {
    console.error('Reply submission error:', error);
    alert('Failed to send reply');
  }
}
