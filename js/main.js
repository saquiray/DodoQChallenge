
let dataTable;
let dataTableIsInitialized = false;
var indice=1;
const apiKey ='RGAPI-09edd6d3-c8ae-4ab8-850e-abaca7b52d60';
const summonerNames = ['GSK1ngs', 'No doy la Q','Alash','Señor Oso1','DancingBlades','FVC','STEPZ','Meflayer','Diego6u9r','Birtime'];
const rol=['adc','suport','top','undefined','Mid','Comodin','comodin','nose','top','suport'];
const summonerIdList = [];

const summonersRank=[];
const rankValues = {
    "IRON": 1,
    "BRONZE": 2,
    "SILVER": 3,
    "GOLD": 4,
    "PLATINUM": 5,
    "EMERALD":6,
    "DIAMOND": 7,
    "MASTER": 8,
    "GRANDMASTER": 9,
    "CHALLENGER": 10,
};
const rankElo={
    "I":4,
    "II":3,
    "III":2,
    "IV":1,
};
const dataTableOptions = {
    //scrollX: "2000px",
    responsive: true,
    order: [[0, 'desc']],
    lengthMenu: [5, 10, 15, 20, 100, 200, 500],
    columnDefs: [
        {targets: [0],visible: false},
        { className: "centered", targets: [0, 1, 2, 3, 4, 5, 6, 7 , 8] },
        {orderable: false ,targets: [ 1 ,2, 3, 4, 5, 6, 7 , 8]},
        { searchable: false, targets: [1] }
    ],
    
      
    pageLength: 20,
    destroy: true,
    language: {
        lengthMenu: "",
        zeroRecords: "Ningún usuario encontrado",
        info: "",
        infoEmpty: "Ningún usuario encontrado",
        infoFiltered: "(filtrados desde _MAX_ registros totale  s)",
        search: "Buscar:",
        loadingRecords: "Cargando...",
        paginate: {
            first: "",
            last: "",
            next: "",
            previous: ""
        }
    }
};

async function getSummonerData(summonerName) {
    try {
      const apiUrl = `https://la1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${apiKey}`;
      const response = await axios.get(apiUrl);
      const summonerData = response.data;
      const summonerId=summonerData.id;
      summonerIdList.push(summonerId);
    } catch (error) {
      console.error(`Error al obtener los datos de ${summonerName}: ${error.message}`);
    }
  }


  async function fetchSummonersData() {
    for (const summonerName of summonerNames) {
      await getSummonerData(summonerName);
    }
    console.log('Datos de todos los invocadores:', summonerIdList);
}


async function getSummonerElo(summonerIdEncripted) {
    try {
      const apiUrl = `https://la1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerIdEncripted}?api_key=${apiKey}`;
      const response = await axios.get(apiUrl);
      const summonerData = response.data;
      for(const linea of summonerData){
        if(linea.queueType==`RANKED_SOLO_5x5`){
            const summonerInfo = summonerIdList.find(info => info.id === summonerIdEncripted);
            if (summonerInfo) {
                linea.summonerName = summonerInfo.name; // Agrega el nombre del invocador a la línea
                
                
            }
            linea.summonerRol = rol[summonerNames.indexOf(linea.summonerName)];
            linea.summonerstats=`https://lan.op.gg/summoner/userName=${linea.summonerName}`
            summonersRank.push([linea]);
        }
      
      }
      
    } catch (error) {
      console.error(`Error al obtener los datos de ${summonerIdEncripted}: ${error.message}`);
    }
  }


  async function fetchSummonersElo() {
    try {
        await Promise.all(summonerIdList.map(getSummonerElo));
        console.log('Elo de los invocadores:', summonersRank);
    } catch (error) {
        console.error(`Error al obtener los datos de elo para los invocadores: ${error.message}`);
    }
}
function calculateRankValue(rank, division, points) {
    const rankValue = rankValues[rank] || 0;
    const divisionValue = rankElo[division] || 0; // Extraer el número de la división
    console.log(rank);
    console.log(division);
    console.log(rankValue * 10000 + divisionValue*100+points);
    return rankValue * 10000 + divisionValue*100+points; // Multiplicamos por 100 para dar prioridad al rango sobre la división
  }







const initDataTable = async () => {
    if (dataTableIsInitialized) {
        dataTable.destroy();
        indice=1;
    }

    await listUsers();

    dataTable = $("#datatable_users").DataTable(dataTableOptions);

    dataTableIsInitialized = true;
};

const listUsers = async () => {
    try {
        let content = ``;
        summonerNames.forEach((user, index) => {
            const eloData = summonersRank[index];
                const elo = eloData[0];
            content += `
                <tr>
                    <td>${rankValues[elo.tier]}${rankElo[elo.rank]}${elo.leaguePoints}</td>
                    <td>${elo.summonerName}</td>
                    <td>${elo.summonerRol}</td>
                    <td><img class="elo" src="images/lol/${elo.tier}.png" alt="" height="50px" width="50px"><br>${elo.tier} ${elo.rank}<br>(${elo.leaguePoints} LP)</td>
                    <td>${elo.wins+elo.losses}</td>
                    <td>${elo.wins}</td>
                    <td>${elo.losses}</td>
                    <td>${Math.round(100*elo.wins/(elo.wins+elo.losses))}%</td>
                    <td><a href="${elo.summonerstats}" target="_blank" class="gg" style="color:#5383e8;">OP.GG</a></td>
                    

                </tr>`
                ;
                
        });
        tableBody_users.innerHTML = content;
    } catch (ex) {
        alert(ex);
    }
};

window.addEventListener("load", async () => {
    await fetchSummonersData();
    await fetchSummonersElo();
    await initDataTable();
    
    console.log('La página se ha cargado completamente');
    const preloader = document.querySelector('.preloader');
    const content = document.querySelector('.content');
    
    preloader.style.display = 'none';
    content.style.display = 'block';
});

