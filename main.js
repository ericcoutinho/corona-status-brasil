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
    var dailyCounts = []
    body.Brazil.forEach(({ date, confirmed, recovered, deaths }) =>
      transformData(dailyCounts, date, confirmed, recovered, deaths)
    )
    generateChart(dailyCounts)
  };
})

function transformData (dailyCounts, date, confirmed, recovered, deaths) {
  const active = confirmed - recovered - deaths

  dailyCounts.push({
    confirmed: confirmed,
    recovered: recovered,
    deaths: deaths,
    active: active,
    date: date
  })
}

function generateChart (dailyCounts) {
  var data = []
  var jsonData = []
  var arrDates = []
  var arrDeaths = []
  var arrRecovered = []
  var arrActive = []
  var arrConfirmed = []
  const todayConfirmed = (dailyCounts[dailyCounts.length - 1].confirmed) - (dailyCounts[dailyCounts.length - 2].confirmed)
  const fatalityRate = (dailyCounts[dailyCounts.length - 1].deaths / (dailyCounts[dailyCounts.length - 1].confirmed / 100)).toFixed(2)

  for (var key in dailyCounts) {
    arrDates.push(dailyCounts[key].date)
    arrDeaths.push(dailyCounts[key].deaths)
    arrRecovered.push(dailyCounts[key].recovered)
    arrActive.push(dailyCounts[key].active)
    arrConfirmed.push(dailyCounts[key].confirmed)
  }

  jsonData.push({
    todayConfirmed: todayConfirmed,
    activeCases: dailyCounts[dailyCounts.length - 1].active,
    deathCases: dailyCounts[dailyCounts.length - 1].deaths,
    confirmedCases: dailyCounts[dailyCounts.length - 1].confirmed,
    recoveredCases: dailyCounts[dailyCounts.length - 1].recovered,
    fatalityRate: fatalityRate
  })

  var jsonContent = JSON.stringify(jsonData)

  writeJson(jsonContent)

  const deaths = {
    x: arrDates,
    y: arrDeaths,
    type: 'scatter',
    name: 'Mortes'
  }

  const recovered = {
    x: arrDates,
    y: arrRecovered,
    type: 'scatter',
    name: 'Recuperados'
  }

  const active = {
    x: arrDates,
    y: arrActive,
    type: 'scatter',
    name: 'Ativos'
  }

  const confirmed = {
    x: arrDates,
    y: arrConfirmed,
    type: 'scatter',
    name: 'Confirmados'
  }

  data.push(deaths, recovered, active, confirmed)

  var graphOptions = { filename: 'date-axes', fileopt: 'overwrite' }
  plotly.plot(data, graphOptions, function (_err, msg) {
    console.log('\nurl: ' + msg.url)
  })
}

function writeJson (jsonContent) {
  fs.writeFile('cases.js', ('var data = ' + jsonContent), 'utf8', function (err) {
    if (err) {
      console.log('\ndeu ruim no cases.js')
      return console.log(err)
    }
    console.log('\ncases.js foi salvo')
  })
}
