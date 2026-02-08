// Journey Map Functionality for User
const milestoneIcons = ['🌹', '💍', '🍫', '🧸', '🤝', '🤗', '💋', '❤️'];

// Load milestones on page load
document.addEventListener('DOMContentLoaded', () => {
    loadJourney();
    // Poll for updates every 30 seconds
    setInterval(loadJourney, 30000);
});

// Load user's journey (only unlocked milestones)
async function loadJourney() {
    try {
        const res = await fetch(`${API_URL}/api/milestones`, {
            credentials: 'include'
        });

        if (!res.ok) {
            if (res.status === 401) {
                window.location.href = '/';
                return;
            }
            throw new Error('Failed to load journey');
        }

        const data = await res.json();
        displayJourney(data.milestones);
        updateProgress(data.milestones);
    } catch (error) {
        console.error('Load journey error:', error);
        document.getElementById('milestonesContainer').innerHTML =
            '<p style="color: var(--warm-red); text-align: center;">Failed to load journey</p>';
    }
}

// Display journey milestones
function displayJourney(milestones) {
    const container = document.getElementById('milestonesContainer');

    if (!milestones || milestones.length === 0) {
        container.innerHTML = `
      <div style="text-align: center; padding: var(--spacing-xl);">
        <h2>No milestones unlocked yet 💝</h2>
        <p>Your journey awaits...</p>
      </div>
    `;
        return;
    }

    // Create all 8 milestones (but user only sees unlocked ones in full detail)
    const allMilestones = [
        { title: 'Rose Day', description: 'Feb 7, 2025 - The Journey Begins 🌹', day_number: 1 },
        { title: 'Propose Day', description: 'Feb 8, 2025 - Choosing You Again 💍', day_number: 2 },
        { title: 'Chocolate Day', description: 'Feb 9, 2025 - Sweet Us 🍫', day_number: 3 },
        { title: 'Teddy Day', description: 'Feb 10, 2025 - Comfort Zone 🧸', day_number: 4 },
        { title: 'Promise Day', description: 'Feb 11, 2025 - Words That Stay 🤝', day_number: 5 },
        { title: 'Hug Day', description: 'Feb 12, 2025 - No Distance 🤗', day_number: 6 },
        { title: 'Kiss Day', description: 'Feb 13, 2025 - Sealed with a Kiss 💋', day_number: 7 },
        { title: 'Valentine\'s Day', description: 'Feb 14, 2025 - We Made It ❤️', day_number: 8 }
    ];

    const unlockedIds = new Set(milestones.map(m => m.day_number));

    container.innerHTML = allMilestones.map((milestone, index) => {
        const isUnlocked = unlockedIds.has(milestone.day_number);
        const milestoneData = milestones.find(m => m.day_number === milestone.day_number);
        const icon = milestoneIcons[index];

        return `
      <div class="milestone-node" data-day="${milestone.day_number}">
        <div class="node-marker ${isUnlocked ? 'unlocked' : 'locked'}" 
             ${isUnlocked ? `onclick="viewMilestone(${milestoneData.id})"` : ''}>
          ${icon}
        </div>
        <div class="node-content ${isUnlocked ? 'unlocked' : 'locked'}"
             ${isUnlocked ? `onclick="viewMilestone(${milestoneData.id})"` : ''}>
          <h3 class="node-title">${milestone.title}</h3>
          <p class="node-description">${milestone.description}</p>
          ${isUnlocked ? '<p style="color: var(--warm-red); font-weight: 600; margin-top: var(--spacing-xs);">💌 Tap to open</p>' :
                '<p style="color: var(--gray); font-weight: 600; margin-top: var(--spacing-xs);">🔒 Locked</p>'}
        </div>
      </div>
    `;
    }).join('');
}

// Update progress tracker
function updateProgress(milestones) {
    const unlockedCount = milestones.length;
    const total = 8;
    const progressText = document.getElementById('progressText');
    progressText.textContent = `${unlockedCount} / ${total} Days Unlocked`;
}

// View milestone details
function viewMilestone(milestoneId) {
    window.location.href = `/milestone.html?id=${milestoneId}`;
}

// Add sparkle animation when new milestone unlocks
let lastUnlockedCount = 0;

function checkForNewUnlocks(milestones) {
    const currentCount = milestones.length;

    if (currentCount > lastUnlockedCount && lastUnlockedCount > 0) {
        // New milestone unlocked! Show celebration
        showUnlockCelebration();
    }

    lastUnlockedCount = currentCount;
}

function showUnlockCelebration() {
    // Create sparkles effect
    const celebration = document.createElement('div');
    celebration.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                text-align: center; z-index: 1000; font-size: 3rem; animation: unlock 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);">
      🎉 New Day Unlocked! 💕
    </div>
  `;
    document.body.appendChild(celebration);

    setTimeout(() => {
        celebration.remove();
    }, 2000);
}
