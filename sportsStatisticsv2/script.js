document.getElementById('scoreForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Retrieve score information from form
    let team1 = document.getElementById('team1').value;
    let score1 = parseInt(document.getElementById('score1').value, 10);
    let team2 = document.getElementById('team2').value;
    let score2 = parseInt(document.getElementById('score2').value, 10);

    // Update standings in localStorage
    updateStandings(team1, score1, team2, score2);

    // Clear form inputs
    document.getElementById('team1').value = '';
    document.getElementById('score1').value = '';
    document.getElementById('team2').value = '';
    document.getElementById('score2').value = '';

    // Refresh the standings table
    displayStandings();
});

function updateStandings(team1, score1, team2, score2) {
    // Get standings from localStorage or initialize if not present
    let standings = JSON.parse(localStorage.getItem('standings')) || {};

    // Update or initialize team stats
    [team1, team2].forEach(team => {
        if (!standings[team]) {
            standings[team] = { played: 0, won: 0, drawn: 0, lost: 0, for: 0, against: 0, gd: 0 };
        }
    });

    // Update the stats based on the score
    standings[team1].played++;
    standings[team2].played++;
    standings[team1].for += score1;
    standings[team2].for += score2;
    standings[team1].against += score2;
    standings[team2].against += score1;
    standings[team1].gd += score1 - score2;
    standings[team2].gd += score2 - score1;

    if (score1 > score2) {
        standings[team1].won++;
        standings[team2].lost++;
    } else if (score1 < score2) {
        standings[team2].won++;
        standings[team1].lost++;
    } else {
        standings[team1].drawn++;
        standings[team2].drawn++;
    }

    // Save the updated standings back to localStorage
    localStorage.setItem('standings', JSON.stringify(standings));
}

document.getElementById('clearTable').addEventListener('click', function() {
    clearStandings();
    displayStandings();
});

function clearStandings() {
    localStorage.removeItem('standings');
}

document.getElementById('sortOrder').addEventListener('change', function() {
    displayStandings();
});

function getSortedTeams(standings, sortOrder) {
    return Object.keys(standings).sort((a, b) => {
        let pointsDiff = (standings[b].won * 3 + standings[b].drawn) - (standings[a].won * 3 + standings[a].drawn);
        if (pointsDiff) return sortOrder === 'ASC' ? -pointsDiff : pointsDiff;
        let gdDiff = standings[b].gd - standings[a].gd;
        if (gdDiff) return sortOrder === 'ASC' ? -gdDiff : gdDiff;
        return sortOrder === 'ASC' ? standings[a].for - standings[b].for : standings[b].for - standings[a].for;
    });
}

function displayStandings() {
    let standings = JSON.parse(localStorage.getItem('standings')) || {};
    let sortOrder = document.getElementById('sortOrder').value;
    let standingsTableBody = document.getElementById('standingsTable').getElementsByTagName('tbody')[0];

    // Clear existing table rows
    standingsTableBody.innerHTML = '';

    // Get sorted teams based on selected sort order
    let sortedTeams = getSortedTeams(standings, sortOrder);

    // Create a table row for each team in the standings
    sortedTeams.forEach(team => {
        let row = standingsTableBody.insertRow();
        let data = standings[team];
        row.insertCell(0).textContent = team;
        row.insertCell(1).textContent = data.played;
        row.insertCell(2).textContent = data.won;
        row.insertCell(3).textContent = data.drawn;
        row.insertCell(4).textContent = data.lost;
        row.insertCell(5).textContent = data.for;
        row.insertCell(6).textContent = data.against;
        row.insertCell(7).textContent = data.gd;
    });
}

// Display the standings when the page is loaded
window.onload = displayStandings;
