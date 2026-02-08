// Admin Dashboard Functionality
let currentMilestoneId = null;

// Load milestones on page load
document.addEventListener('DOMContentLoaded', () => {
    loadMilestones();
    setupContentTypeToggle();
    setupFilePreview();
});

// Load all milestones
async function loadMilestones() {
    try {
        const res = await fetch(`${API_URL}/api/milestones`, {
            credentials: 'include'
        });

        if (!res.ok) {
            if (res.status === 401) {
                window.location.href = '/';
                return;
            }
            throw new Error('Failed to load milestones');
        }

        const data = await res.json();
        displayMilestones(data.milestones);
    } catch (error) {
        console.error('Load milestones error:', error);
        document.getElementById('milestonesGrid').innerHTML =
            '<p style="color: var(--warm-red); text-align: center;">Failed to load milestones</p>';
    }
}

// Display milestones in grid
function displayMilestones(milestones) {
    const grid = document.getElementById('milestonesGrid');

    if (!milestones || milestones.length === 0) {
        grid.innerHTML = '<p>No milestones found</p>';
        return;
    }

    const milestoneIcons = ['🌹', '💍', '🍫', '🧸', '🤝', '🤗', '💋', '❤️'];

    grid.innerHTML = milestones.map((m, index) => `
    <div class="milestone-card ${m.is_unlocked ? 'unlocked' : 'locked'}" data-id="${m.id}">
      <div class="milestone-header">
        <div class="milestone-day">${milestoneIcons[index] || '💕'}</div>
        <div class="milestone-info">
          <h3>${m.title}</h3>
          <p class="milestone-description">${m.description}</p>
        </div>
      </div>

      <span class="status-badge ${m.is_unlocked ? 'status-unlocked' : 'status-locked'}">
        ${m.is_unlocked ? '✓ Unlocked' : '🔒 Locked'}
      </span>

      <div class="card-actions">
        ${!m.is_unlocked ? `
          <button class="btn btn-gold" onclick="unlockMilestone(${m.id})">
            <span>🔓 Unlock Day ${m.day_number}</span>
          </button>
        ` : `
          <button class="btn btn-primary" onclick="openUploadModal(${m.id}, '${m.title}')">
            <span>📤 Upload Content</span>
          </button>
          <button class="btn btn-secondary" onclick="viewReplies(${m.id})">
            <span>💬 View Her Response</span>
          </button>
          <button class="btn btn-danger" onclick="restartDay(${m.id}, '${m.title}')" style="background: linear-gradient(135deg, #ff6b6b, #ee5a6f);">
            <span>🔄 Restart Day</span>
          </button>
        `}
      </div>
    </div>
  `).join('');
}

// Unlock milestone
async function unlockMilestone(milestoneId) {
    if (!confirm('Unlock this milestone? This will make it visible to the user.')) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/milestones/${milestoneId}/unlock`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed to unlock milestone');

        const data = await res.json();
        alert(data.message || 'Milestone unlocked! 💕');
        loadMilestones(); // Reload to show updated state
    } catch (error) {
        console.error('Unlock error:', error);
        alert('Failed to unlock milestone');
    }
}

// Open upload modal
function openUploadModal(milestoneId, title) {
    currentMilestoneId = milestoneId;
    document.getElementById('milestoneId').value = milestoneId;
    document.getElementById('modalTitle').textContent = `Upload Content for ${title}`;
    document.getElementById('uploadModal').classList.add('active');

    // Reset form
    document.getElementById('uploadForm').reset();
    document.getElementById('filePreview').innerHTML = '';
}

// Close upload modal
function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
    currentMilestoneId = null;
}

// Setup content type toggle
function setupContentTypeToggle() {
    const typeSelect = document.getElementById('contentType');
    const textInput = document.getElementById('textInput');
    const fileInput = document.getElementById('fileInput');

    typeSelect.addEventListener('change', () => {
        if (typeSelect.value === 'text') {
            textInput.classList.remove('hidden');
            fileInput.classList.add('hidden');
        } else {
            textInput.classList.add('hidden');
            fileInput.classList.remove('hidden');
        }
    });
}

// Setup file preview
function setupFilePreview() {
    const fileUpload = document.getElementById('fileUpload');
    const preview = document.getElementById('filePreview');

    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const fileType = file.type.split('/')[0];

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
}

// Handle upload form submission
document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const milestoneId = document.getElementById('milestoneId').value;
    const contentType = document.getElementById('contentType').value;
    const formData = new FormData();

    formData.append('type', contentType);

    if (contentType === 'text') {
        const text = document.getElementById('textContent').value;
        if (!text.trim()) {
            alert('Please enter a message');
            return;
        }
        formData.append('text', text);
    } else {
        const file = document.getElementById('fileUpload').files[0];
        if (!file) {
            alert('Please select a file');
            return;
        }
        formData.append('file', file);
    }

    try {
        const res = await fetch(`${API_URL}/api/milestones/${milestoneId}/content`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (!res.ok) throw new Error('Failed to upload content');

        const data = await res.json();
        alert(data.message || 'Content uploaded successfully! 💕');
        closeUploadModal();
        loadMilestones();
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload content');
    }
});

// View replies
async function viewReplies(milestoneId) {
    try {
        const res = await fetch(`${API_URL}/api/milestones/${milestoneId}`, {
            credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed to load replies');

        const data = await res.json();
        displayReplies(data.replies, data.milestone.title);
        document.getElementById('repliesModal').classList.add('active');
    } catch (error) {
        console.error('Load replies error:', error);
        alert('Failed to load replies');
    }
}

// Display replies in modal
function displayReplies(replies, milestoneTitle) {
    const container = document.getElementById('repliesContent');

    if (!replies || replies.length === 0) {
        container.innerHTML = `
      <div style="text-align: center; padding: var(--spacing-xl); color: var(--dark-gray);">
        <p style="font-size: 1.2rem;">💌</p>
        <p>No responses yet for ${milestoneTitle}</p>
      </div>
    `;
        return;
    }

    container.innerHTML = replies.map(reply => {
        let content = '';

        if (reply.type === 'text') {
            content = `<p style="white-space: pre-wrap;">${reply.text_content}</p>`;
        } else if (reply.type === 'image') {
            content = `<img src="${reply.file_path}" style="max-width: 100%; border-radius: var(--radius-md);">`;
        } else if (reply.type === 'audio') {
            content = `<audio controls src="${reply.file_path}" style="width: 100%;"></audio>`;
        } else if (reply.type === 'video') {
            content = `<video controls src="${reply.file_path}" style="max-width: 100%; border-radius: var(--radius-md);"></video>`;
        }

        return `
      <div class="reply-item" style="margin-bottom: var(--spacing-md);">
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
          <span style="font-weight: 600; color: var(--gold);">Her Response 💝</span>
          <span style="font-size: 0.85rem; color: var(--dark-gray);">
            ${new Date(reply.created_at).toLocaleString()}
          </span>
        </div>
        ${content}
      </div>
    `;
    }).join('');
}

// Restart day (delete all content)
async function restartDay(milestoneId, title) {
    if (!confirm(`⚠️ Restart ${title}?\n\nThis will DELETE ALL CONTENT (photos, videos, audio, text) from this day.\nThis action CANNOT be undone!\n\nAre you sure?`)) {
        return;
    }

    // Double confirmation for safety
    if (!confirm('Last chance! Are you absolutely sure you want to restart this day?')) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/milestones/${milestoneId}/content`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed to restart day');

        const data = await res.json();
        alert(`✅ ${data.message}\n${data.deletedCount} item(s) removed.`);
        loadMilestones(); // Reload to show updated state
    } catch (error) {
        console.error('Restart day error:', error);
        alert('Failed to restart day');
    }
}

// Close replies modal
function closeRepliesModal() {
    document.getElementById('repliesModal').classList.remove('active');
}

// Close modals on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeUploadModal();
        closeRepliesModal();
    }
});
