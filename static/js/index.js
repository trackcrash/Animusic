window.onload=()=>
{
    //플레이 많은 순 아니면 최신 순
    get_Ranking();
    setInterval(()=>
    {
        $.get('/api/get_ranking_data')
        .done(displayRanking)
        .fail(error => {
            console.error('Error fetching mission table data:', error);
        });
    },10000)
}
function get_Ranking()
{
    $.get('/api/get_ranking_data')
    .done(displayRanking)
    .fail(error => {
        console.error('Error fetching mission table data:', error);
    });
}
function displayRanking(data)
{
    const play_ranking_div = document.getElementById("play_ranking")
    play_ranking_div.innerHTML = "";
    for(const element of data)
    {
        console.log(element);
        const newDiv = document.createElement("div");
        newDiv.textContent = element["MapName"];
        play_ranking_div.appendChild(newDiv);
    }
}