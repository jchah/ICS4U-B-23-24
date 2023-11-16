// Save to localStorage
localStorage.setItem('leagueData', JSON.stringify(leagueData));

// Retrieve from localStorage
const storedLeagueData = JSON.parse(localStorage.getItem('leagueData'));

document.getElementById('scoreForm').onsubmit = function(event) {
    event.preventDefault();
    // Gather data and update model and localStorage
};
