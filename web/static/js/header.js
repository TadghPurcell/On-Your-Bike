async function getWeatherData() {  
    try {
        const res = await fetch('/dbinfo.json')
        if (!res.ok) {
          throw new Error("Couldn't find weather API key")
        }
        const data = await res.json()
        
        return data.weatherKey
    
      } catch (e) {
        console.error('Error loading dbinfo.json:', e)
      }
}

async function initHeader() {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=53.344&lon=-6.2672&appid=${await getWeatherData()}`)
        if (!res.ok) {
          throw new Error("Couldn't load weather info")
        }
        const data = await res.json()
        console.log(data)
        const weatherInfo = document.querySelector('.weather-info')

        const temp = document.createElement('p')
        temp.classList.add('weather-temp')
        temp.textContent = `${data.main.temp.toFixed(0)}°C`

        const icon = document.createElement('img')
        icon.src =`http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        icon.alt = 'Weather Icon';
        icon.classList.add('weather-icon')

        const desc = document.createElement('p')
        desc.classList.add('weather-desc')
        desc.textContent = data.weather[0].description

        weatherInfo.appendChild(temp)
        weatherInfo.appendChild(icon)
        weatherInfo.appendChild(desc)
            
      } catch (e) {
        console.error('Error connecting to weather API:', e)
      }
    
}

initHeader()