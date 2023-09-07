window.onload=()=>
{
    //플레이 많은 순 아니면 최신 순
    $.get('/api/get_ranking_data')
    .done(displayRanking)
    .fail(error => {
        console.error('Error fetching mission table data:', error);
    });
}
function displayRanking(data)
{
    const play_ranking_div = document.getElementById("play_ranking")
    for(const element of data)
    {
        const newDiv = document.createElement("div");
        newDiv.textContent = element["MapName"];
        play_ranking_div.appendChild(newDiv);
    }
}