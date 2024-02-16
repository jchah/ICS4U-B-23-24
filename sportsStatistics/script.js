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
        localStorage.clear();
        clearStandings();
        clearCards();
        displayStandings(); // Update the standings view
        if (document.getElementById('cardsView').style.display !== 'none') {
            // If the cards view is currently displayed, update it as well
            populateCardsView();
        }
    });

    let currentSort = { column: null, order: 'ASC' };

    // Add event listeners to table headers for sorting
    document.querySelectorAll('#standingsTable th').forEach((header, index) => {
        header.addEventListener('click', function() {
            let column = getColumnKeyByIndex(index);
            sortTableByColumn(column, this);
        });
    });

    document.getElementById('showStandings').addEventListener('click', function() {
        setActiveButton(this);
        toggleView('standings');
    });

    document.getElementById('showCards').addEventListener('click', function() {
        setActiveButton(this);
        toggleView('cards');
    });

    document.addEventListener('DOMContentLoaded', function() {
        let dateFilterControl = document.getElementById('dateFilterControl');
        if (dateFilterControl) dateFilterControl.style.display = 'none';
        populateCardsView(); // or displayStandings(); depending on what you want to show initially
    });

    function setActiveButton(activeButton) {
        document.getElementById('showStandings').classList.remove('is-active');
        document.getElementById('showCards').classList.remove('is-active');
        activeButton.classList.add('is-active');
    }

    function clearCards() {
        // Clear the cards view HTML content
        let cardsView = document.getElementById('cardsView');
        if (cardsView) {
            cardsView.innerHTML = '<p class="title is-4">No games to display</p>';
        }
    }

    function toggleView(view) {
        let standingsTable = document.getElementById('standingsTable');
        let cardsView = document.getElementById('cardsView');
        let dateRangeFilterControl = document.getElementById('dateRangeFilterControl');

        if (view === 'standings') {
            standingsTable.style.display = '';
            cardsView.style.display = 'none';
            if (dateRangeFilterControl) dateRangeFilterControl.style.display = 'none';
        } else {
            standingsTable.style.display = 'none';
            cardsView.style.display = '';
            populateCardsView();
            if (dateRangeFilterControl) dateRangeFilterControl.style.display = 'flex';
        }
    }

    function populateCardsView() {
        let cardsView = document.getElementById('cardsView');
        let startDate = document.getElementById('filterStartDate').value;
        let endDate = document.getElementById('filterEndDate').value;
        let teamFilter = document.getElementById('filterTeam').value.toLowerCase();
        cardsView.innerHTML = ''; // Clear previous content

        // Retrieve and parse the games array from localStorage
        let games = JSON.parse(localStorage.getItem('games')) || [];

        let startDateObj = startDate ? new Date(startDate) : new Date(0); // Unix epoch start if no start date
        let endDateObj = endDate ? new Date(endDate) : new Date(); // Current date if no end date

        games = games.filter(function(game) {
            let gameDate = new Date(game.gameDate);
            return (gameDate >= startDateObj && gameDate <= endDateObj) &&
                (!teamFilter || game.team1.toLowerCase().includes(teamFilter) || game.team2.toLowerCase().includes(teamFilter));
        });

        // Loop through the games array to create card elements
        games.forEach(function(game) {
            let date = new Date(game.gameDate);
            let formattedDate = date.getTime() ? date.toLocaleDateString() : 'Unknown date';

            let card = document.createElement('div');
            card.className = 'card';

            let cardContent = document.createElement('div');
            cardContent.className = 'card-content';

            let media = document.createElement('div');
            media.className = 'media';

            let mediaContent = document.createElement('div');
            mediaContent.className = 'media-content';

            let title = document.createElement('p');
            title.className = 'title is-4';

            let team1Link = document.createElement('a');
            team1Link.href = "#";
            team1Link.textContent = game.team1;
            team1Link.onclick = function() { goToTeamPage(game.team1); };

            let team2Link = document.createElement('a');
            team2Link.href = "#";
            team2Link.textContent = game.team2;
            team2Link.onclick = function() { goToTeamPage(game.team2); };

            let vsText = document.createTextNode(' vs ');

            let score = document.createElement('p');
            score.className = 'subtitle is-6';
            score.textContent = `Score: ${game.score1} - ${game.score2}`;

            let dateElement = document.createElement('p');
            dateElement.className = 'subtitle is-6';
            dateElement.textContent = `Date: ${formattedDate}`;

            // Append the team links and 'vs' text to the title paragraph
            title.appendChild(team1Link);
            title.appendChild(vsText);
            title.appendChild(team2Link);

            // Append title, score, and date to mediaContent
            mediaContent.appendChild(title);
            mediaContent.appendChild(score);
            mediaContent.appendChild(dateElement);

            // Append mediaContent to media
            media.appendChild(mediaContent);

            // Append media to cardContent
            cardContent.appendChild(media);

            // Append cardContent to card
            card.appendChild(cardContent);

            // Append card to cardsView
            cardsView.appendChild(card);
        });

        // If there are no games, display a message
        if (games.length === 0) {
            cardsView.innerHTML = '<p class="title is-4">No games to display</p>';
        }
    }

    // Call populateCardsView on page load
    document.addEventListener('DOMContentLoaded', function() {
        let dateRangeFilterControl = document.getElementById('dateRangeFilterControl');
        if (dateRangeFilterControl) {
            dateRangeFilterControl.style.display = 'none';
        }

        // Make the Standings button appear selected
        let standingsButton = document.getElementById('showStandings');
        if (standingsButton) {
            standingsButton.classList.add('is-active');
        }

        // Load the initial view
        toggleView('standings'); // or 'cards' depending on your default view
        populateCardsView();
    });

    function getColumnKeyByIndex(index) {
        const columnKeys = ['team', 'played', 'won', 'drawn', 'lost', 'for', 'against', 'gd'];
        return columnKeys[index] || null;
    }

    function sortTableByColumn(column, headerElement) {
        // Toggle sort order or set to 'ASC' if new column
        currentSort.order = (currentSort.column === column && currentSort.order === 'ASC') ? 'DESC' : 'ASC';
        currentSort.column = column;

        // Update header class based on sort order
        document.querySelectorAll('#standingsTable th').forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
        });
        headerElement.classList.add(currentSort.order === 'ASC' ? 'sort-asc' : 'sort-desc');

        // Refresh the table with new sorting
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

    document.getElementById('applyFilters').addEventListener('click', function() {
        displayStandings();
        populateCardsView();
    });

    function displayStandings() {
        let standings = JSON.parse(localStorage.getItem('standings')) || {};
        let standingsTableBody = document.getElementById('standingsTable').getElementsByTagName('tbody')[0];

        standingsTableBody.innerHTML = ''; // Clear existing rows

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

    function getSortedTeams(standings) {
        // Extract team names and sort them based on the currentSort settings
        return Object.keys(standings).sort((a, b) => {
            let valueA, valueB;

            // Determine the values to compare based on the current sorted column
            if (currentSort.column === 'team') {
                // Sorting by team name (string comparison)
                valueA = a.toLowerCase();
                valueB = b.toLowerCase();
            } else {
                // Sorting by numeric values of the column
                valueA = standings[a][currentSort.column];
                valueB = standings[b][currentSort.column];
            }


            // Compare for ascending or descending order
            if (valueA < valueB) {
                return currentSort.order === 'ASC' ? -1 : 1;
            }
            if (valueA > valueB) {
                return currentSort.order === 'ASC' ? 1 : -1;
            }
            return 0;
        });
    }


    // Display the standings when the page is loaded
    window.onload = displayStandings;
