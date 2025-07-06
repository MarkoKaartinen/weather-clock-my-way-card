class WeatherClockMyWayCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.innerHTML = `<ha-card id="weather-clock-my-way-card">
      <style>
        #wcmw-card {
          
        }
        .wcmw-card-container {
        }
        
        .wcmw-card-info {
        }
        
        .wcmw-card-day {
        }
        
        .wcmw-card-time {
        }
        
        .wcmw-card-row {
        }
        
        .wcmw-card-condition {
        }
        
        .wcmw-card-temp {
        }
        
        .wcmw-card-winds {
        }
        
        .wcmw-card-icon-container {
        }
        
        .wcmw-card-icon img {
        }
      </style>
      <div class="wcmw-card-container">
      <div>
        <div class="wcmw-card-info">
          <div class="wcmw-card-day" id="wcmw-card-day"></div>
          <div class="wcmw-card-time" id="wcmw-card-time"></div>
        </div>
        <div class="wcmw-card-row">
          <div>
            <div>
              <div class="wcmw-card-condition" id="wcmw-card-condition"></div>
              <div class="wcmw-card-temp" id="wcmw-card-temp"></div>
              <div class="wcmw-card-winds" id="wcmw-card-winds"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="wcmw-card-icon-container">
        <div class="wcmw-card-icon" id="wcmw-card-icon"></div>
      </div>
    </div>
    </ha-card>`;
    this.updateCard();
    if (!this._interval) {
      this._interval = setInterval(() => this.updateTime(), 1000);
    }
  }

  set hass(hass) {
    this._hass = hass;
    this.updateCard();
  }

  updateTime() {
    const now = new Date();
    const day = now.toLocaleDateString('fi-FI', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    const time = now.toLocaleTimeString('fi-FI', {
      hour: '2-digit',
      minute: '2-digit'
    });
    this.querySelector('#wcmw-card-day').innerText = day.toUpperCase();
    this.querySelector('#wcmw-card-time').innerText = time;
  }

  updateCard() {
    // Päivämäärä ja aika
    this.updateTime();

    // Sääentiteetti (muuta tarvittaessa)
    const weatherEntity = this.config.weather || 'weather.home';
    const windSpeedEntity = this.config.wind_speed || '';
    const windGustEntity = this.config.wind_gust || '';
    const tempEntity = this.config.temperature || '';
    const debug = this.config.debug || false;

    const weatherState = this._hass?.states[weatherEntity];
    const tempValue = tempEntity ? this._hass?.states[tempEntity]?.state : weatherState?.attributes.temperature;
    const tempUnit = weatherState?.attributes.temperature_unit || '°C';
    const condition = weatherState?.state || '';
    const windSpeed = windSpeedEntity ? this._hass?.states[windSpeedEntity]?.state : weatherState?.attributes.wind_speed;
    const windGust = windGustEntity ? this._hass?.states[windGustEntity]?.state : weatherState?.attributes.wind_gust_speed;

    // Sääkuvake
    const conditionIcon = this.getWeatherIcon(condition);

    // Tekstit
    this.querySelector('#wcmw-card-condition').innerText = this.getConditionText(condition);
    this.querySelector('#wcmw-card-temp').innerText = tempValue ? `${Math.round(tempValue)}${tempUnit}` : '-';
    this.querySelector('#wcmw-card-winds').innerText =
      (windSpeed ? `${windSpeed} m/s ` : '') +
      (windGust ? `🌬️ ${windGust} m/s` : '');

    // Kuvake
    this.querySelector('#wcmw-card-icon').innerHTML = conditionIcon;

    if(debug){
      console.log(`[WCMW DEBUG] Weather entity: ${weatherEntity}`);
    }
  }

  getWeatherIcon(condition) {
    const iconMap = {
      'clear': 'clear-day.svg',
      'cloudy': 'cloudy.svg',
      'rainy': 'rain.svg',
      // lisää muut
    };
    const iconFile = iconMap[(condition || '').toLowerCase()] || 'rain.svg';
    // HACS:in kautta oikea polku on /hacsfiles/<repo-nimi>/<kansio>/<kuva>
    return `<img src="/hacsfiles/weather-clock-my-way-card/icons/meteocons/${iconFile}" alt="${condition}">`;
  }
  /*
  getWeatherIcon(condition) {
    // Yksinkertainen ikonitulkinta, voit laajentaa
    switch ((condition || '').toLowerCase()) {
      case 'clear-night':
        return '🌕';
      case 'clear':
      case 'sunny':
        return '☀️';
      case 'cloudy':
        return '☁️';
      case 'partlycloudy':
      case 'partly-cloudy':
      case 'partly_cloudy':
        return '⛅️';
      case 'rainy':
      case 'rain':
        return '🌧️';
      case 'snowy':
      case 'snow':
        return '❄️';
      case 'fog':
        return '🌫️';
      case 'windy':
        return '💨';
      default:
        return '🌥️';
    }
  }
  */

  getConditionText(condition) {
    // Suomentaa säätilan
    switch ((condition || '').toLowerCase()) {
      case 'cloudy': return 'ENIMMÄKSEEN PILVISTÄ';
      case 'clear': return 'SELKEÄÄ';
      case 'rainy': return 'SATEISTA';
      case 'fog': return 'SUMUISTA';
      case 'snowy': return 'LUMISTA';
      case 'partlycloudy': return 'PUOLIPILVISTÄ';
      default: return condition ? condition.toUpperCase() : '';
    }
  }

  getCardSize() {
    return 3;
  }
}
customElements.define('weather-clock-my-way-card', WeatherClockMyWayCard);