const request = require('request')
const fs = require('fs')

var plotly = require('plotly')('username', 'api_key')

const url = 'https://pomber.github.io/covid19/timeseries.json'

const options = { json: true }

request(url, options, (error, res, body) => {
  if (error) {
    return console.log(error)
  };

  if (!error && res.statusCode === 200) {
    var dailyCounts = [] // iniciando array final da contagem dos casos
    body.Brazil.forEach(({ date, confirmed, recovered, deaths }) =>
      transformData(dailyCounts, date, confirmed, recovered, deaths)
    )
    generateChart(dailyCounts)
  };
})

function transformData (dailyCounts, date, confirmed, recovered, deaths) {
  const active = confirmed - recovered - deaths

  dailyCounts.push({ // armazena cada caso como um novo objeto no casoCount
    confirmed: confirmed, // total de casos
    recovered: recovered, // recuperados
    deaths: deaths, // mortes
    active: active, // casos ativos
    date: date // data extraída
  })
}

function generateChart (dailyCounts) { // gera o gráfico
  var data = []
  var jsonData = []
  var arrDates = []
  var arrDeaths = []
  var arrRecovered = []
  var arrActive = []
  var arrConfirmed = []
  const todayConfirmed = (dailyCounts[dailyCounts.length - 1].confirmed) - (dailyCounts[dailyCounts.length - 2].confirmed)
  const fatalityRate = (dailyCounts[dailyCounts.length - 1].deaths / (dailyCounts[dailyCounts.length - 1].confirmed / 100)).toFixed(2)

  for (var key in dailyCounts) { // percorre o array de casos
    arrDates.push(dailyCounts[key].date) // montagem do array de data
    arrDeaths.push(dailyCounts[key].deaths) // montagem do array de mortes
    arrRecovered.push(dailyCounts[key].recovered) // montagem do array de casos recuperados
    arrActive.push(dailyCounts[key].active) // montagem do array de casos ativos
    arrConfirmed.push(dailyCounts[key].confirmed) // montagem do array de casos confirmados
  }

  jsonData.push({
    todayConfirmed: todayConfirmed,
    activeCases: dailyCounts[dailyCounts.length - 1].active,
    deathCases: dailyCounts[dailyCounts.length - 1].deaths,
    confirmedCases: dailyCounts[dailyCounts.length - 1].confirmed,
    recoveredCases: dailyCounts[dailyCounts.length - 1].recovered,
    fatalityRate: fatalityRate
  })

  // stringify JSON Object
  var jsonContent = JSON.stringify(jsonData)

  writeJson(jsonContent)

  const deaths = { // implementa o array de num de mortes ( X: Datas, Y: Núm de Casos )
    x: arrDates,
    y: arrDeaths,
    type: 'scatter',
    name: 'Mortes'
  }

  const recovered = { // implementa o array de num de casos recuperados ( X: Datas, Y: Núm de Casos )
    x: arrDates,
    y: arrRecovered,
    type: 'scatter',
    name: 'Recuperados'
  }

  const active = { // implementa o array de num de casos ativos ( X: Datas, Y: Núm de Casos )
    x: arrDates,
    y: arrActive,
    type: 'scatter',
    name: 'Ativos'
  }

  const confirmed = { // implementa o array de num de casos confirmados ( X: Datas, Y: Núm de Casos )
    x: arrDates,
    y: arrConfirmed,
    type: 'scatter',
    name: 'Confirmados'
  }

  data.push(deaths, recovered, active, confirmed)

  // função do plotly para gerar o gráfico
  var graphOptions = { filename: 'date-axes', fileopt: 'overwrite' }
  plotly.plot(data, graphOptions, function (_err, msg) {
    console.log(msg)
  })
}

function writeJson (jsonContent) {
  fs.writeFile('cases.js', ('var data = ' + jsonContent), 'utf8', function (err) {
    if (err) {
      console.log('deu ruim no cases.js')
      return console.log(err)
    }
    console.log('cases.js foi salvo')
  })
}
