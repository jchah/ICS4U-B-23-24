    document.getElementById('scoreForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Retrieve score information from form
        let team1 = document.getElementById('team1').value;
        let score1 = parseInt(document.getElementById('score1').value, 10);
        let team2 = document.getElementById('team2').value;
        let score2 = parseInt(document.getElementById('score2').value, 10);
        let gameDate = document.getElementById('gameDate').value;

        // Update standings in localStorage
        updateStandings(team1, score1, team2, score2, gameDate);

        // Clear form inputs
        document.getElementById('team1').value = '';
        document.getElementById('score1').value = '';
        document.getElementById('team2').value = '';
        document.getElementById('score2').value = '';
        document.getElementById('gameDate').value = '';

        // Refresh the standings table
        displayStandings();
    });

    document.getElementById('clearTable').addEventListener('click', function() {
        clearStandings();
        displayStandings();
        localStorage.clear();
    });

    let currentSort = { column: null, order: 'ASC' };

    // Add event listeners to table headers for sorting
    document.querySelectorAll('#standingsTable th').forEach((header, index) => {
        header.addEventListener('click', function() {
            let column = getColumnKeyByIndex(index);
            sortTableByColumn(column, this);
        });
    });

    function getColumnKeyByIndex(index) {
        const columnKeys = ['team', 'played', 'won', 'drawn', 'lost', 'for', 'against', 'gd'];
        return columnKeys[index] || null;
    }

    function sortTableByColumn(column, headerElement) {
        // Toggle sort order or set to 'ASC' if new column
        currentSort.order = (currentSort.column === column && currentSort.order === 'ASC') ? 'DESC' : 'ASC';
        currentSort.column = column;

        // Update the class on the header based on the sort order
        document.querySelectorAll('#standingsTable th').forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
        });
        headerElement.classList.add(currentSort.order === 'ASC' ? 'sort-asc' : 'sort-desc');

        displayStandings();
    }

    function storeGameDetails(team1, score1, team2, score2, gameDate) {
        let games = JSON.parse(localStorage.getItem('games')) || [];
        games.push({team1, score1, team2, score2, gameDate});
        console.log(games)
        localStorage.setItem('games', JSON.stringify(games));
    }

    function updateStandings(team1, score1, team2, score2, gameDate) {
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
        storeGameDetails(team1, score1, team2, score2, gameDate);
    }

    function clearStandings() {
        localStorage.removeItem('standings');
    }



    function displayStandings() {
        let standings = JSON.parse(localStorage.getItem('standings')) || {};
        let standingsTableBody = document.getElementById('standingsTable').getElementsByTagName('tbody')[0];

        // Clear existing table rows
        standingsTableBody.innerHTML = '';

        // Get sorted teams based on currentSort
        let sortedTeams = getSortedTeams(standings);

        // Create a table row for each team in the standings
        sortedTeams.forEach(team => {
            let row = standingsTableBody.insertRow();
            let data = standings[team];

            // Create a clickable link for the team name
            let teamNameCell = row.insertCell(0);
            let teamNameLink = document.createElement('a');
            teamNameLink.href = `#`; // You can put the actual link to your subpage here
            teamNameLink.textContent = team;
            teamNameLink.onclick = function() { goToTeamPage(team); }; // Add an onclick event to handle navigation
            teamNameCell.appendChild(teamNameLink);

            row.insertCell(1).textContent = data.played;
            row.insertCell(2).textContent = data.won;
            row.insertCell(3).textContent = data.drawn;
            row.insertCell(4).textContent = data.lost;
            row.insertCell(5).textContent = data.for;
            row.insertCell(6).textContent = data.against;
            row.insertCell(7).textContent = data.gd;
        });
    }

    function goToTeamPage(teamName) {
        // Retrieve the games data from localStorage
        let games = JSON.parse(localStorage.getItem('games')) || [];

        // Filter games that involve the specified team
        let gamesForTeam = games.filter(game => game.team1 === teamName || game.team2 === teamName);

        // Construct the query parameter for game data
        let queryParams = `?team=${encodeURIComponent(teamName)}&games=${encodeURIComponent(JSON.stringify(gamesForTeam))}`;

        // Navigate to the team's subpage with query parameters
        window.location.href = `team_page.html${queryParams}`;
    }

    // Rest of your code...


    function getSortedTeams(standings) {
        // Sorting logic based on currentSort.column and currentSort.order
        return Object.keys(standings).sort((a, b) => {
            let compareA, compareB;

            switch(currentSort.column) {
                case 'team':
                    compareA = a.toLowerCase();
                    compareB = b.toLowerCase();
                    break;
                case 'played':
                case 'won':
                case 'drawn':
                case 'lost':
                case 'for':
                case 'against':
                case 'gd':
                    compareA = standings[a][currentSort.column];
                    compareB = standings[b][currentSort.column];
                    break;
                default:
                    return 0;
            }

            if (compareA < compareB) {
                return currentSort.order === 'ASC' ? -1 : 1;
            }
            if (compareA > compareB) {
                return currentSort.order === 'ASC' ? 1 : -1;
            }
            return 0;
        });
    }

    // Display the standings when the page is loaded
    window.onload = displayStandings;
