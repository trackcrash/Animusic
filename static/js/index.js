window.onload = () => {
    $.get('/api/get_ranking_data')
        .done(displayRanking)
        .fail(error => {
            console.error('Error fetching mission table data:', error);
        });
}

function displayRanking(data) {
    const play_ranking_div = document.getElementById("play_ranking");
    let rank = 1;
    for (const element of data) {
        const newDiv = document.createElement("div");
        newDiv.className = "bg-white rounded overflow-hidden shadow-lg p-4 space-y-3";

        const rankLabel = document.createElement("span");
        rankLabel.className = "text-white text-xs font-bold py-1 px-2 rounded-full " + getRankingClass(rank);
        rankLabel.textContent = "#" + rank;

        const mapNameLabel = document.createElement("h3");
        mapNameLabel.className = "text-xl font-bold";
        mapNameLabel.textContent = element["MapName"];

        const thumbnail = document.createElement("img");
        thumbnail.src = element["Thumbnail"];
        thumbnail.alt = element["MapName"];
        thumbnail.className = "w-full h-48 object-cover";

        const mapProducerLabel = document.createElement("p");
        mapProducerLabel.className = "text-lg";
        mapProducerLabel.textContent = "제작자: " + element["MapProducer"];

        newDiv.appendChild(rankLabel);
        newDiv.appendChild(mapNameLabel);
        newDiv.appendChild(thumbnail);
        newDiv.appendChild(mapProducerLabel);
        play_ranking_div.appendChild(newDiv);

        rank++;
    }
}

function getRankingClass(rank) {
    switch (rank) {
        case 1:
            return 'ranking-first';
        case 2:
            return 'ranking-second';
        case 3:
            return 'ranking-third';
        default:
            return 'ranking-other';
    }
}