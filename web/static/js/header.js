async function getWeatherData() {  
    //Fetch weather API key from dbinfo.json
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

//Function to load current data from open weather api and display it on the header
async function initHeader() {
    //Connect to API
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=53.344&lon=-6.2672&appid=${await getWeatherData()}`)
        //Handle errors
        if (!res.ok) {
          throw new Error("Couldn't load weather info")
        }

        //Extract json from response
        const data = await res.json()

        //Select weather info div in header
        const weatherInfo = document.querySelector('.weather-info')

        //Create temp element
        const temp = document.createElement('p')
        temp.classList.add('weather-temp')
        temp.textContent = `${data.main.temp.toFixed(0)}°C`

        //Create icon element
        const icon = document.createElement('img')
        icon.src =`http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        icon.alt = 'Weather Icon';
        icon.classList.add('weather-icon')

        //Create description element
        const desc = document.createElement('p')
        desc.classList.add('weather-desc')
        desc.textContent = data.weather[0].description

        //Append elements to div
        weatherInfo.appendChild(temp)
        weatherInfo.appendChild(icon)
        weatherInfo.appendChild(desc)
            
      } catch (e) {
        console.error('Error connecting to weather API:', e)
      }
    
}

initHeader()