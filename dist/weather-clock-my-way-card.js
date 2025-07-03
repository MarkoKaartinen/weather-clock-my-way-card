class WeatherClockMyWayCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.innerHTML = `<ha-card id="weather-clock-my-way-card">
      <style>
        #weather-clock-my-way-card {
          
        }
        .weather-container {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          color: #fff;
          padding: 24px;
          border-radius: 16px;
          gap: 32px;
        }
        
        .weather-info {
          display: flex;
          flex-direction: column;
        }
        
        .weather-date {
          text-transform: uppercase;
          font-weight: bold;
          font-size: 1.1rem;
        }
        
        .weather-time {
          font-weight: 900;
          font-size: 60px;
          line-height: 1;
        }
        
        .weather-row {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        
        .weather-description {
          text-transform: uppercase;
          font-weight: bold;
          font-size: 1rem;
        }
        
        .weather-temp {
          font-weight: 900;
          font-size: 40px;
          line-height: 1;
        }
        
        .weather-winds {
          display: flex;
          flex-direction: row;
          gap: 8px;
        }
        
        .wind-direction,
        .wind-gust {
          font-weight: bold;
          font-size: 14px;
        }
        
        .weather-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .weather-icon img {
          width: 150px;
          height: 150px;
        }
      </style>
      <div class="weather-container">
      <div>
        <div class="weather-info">
          <div class="weather-date">
            <div class="day" id="day"></div>
          </div>
          <div class="weather-time">
            <div class="time" id="time"></div>
          </div>
        </div>
        <div class="weather-row">
          <div>
            <div>
              <div class="weather-description"><div class="condition" id="condition"></div></div>
              <div class="weather-temp"><div class="temp" id="temp"></div></div>
              <div class="weather-winds">
                  <div class="winds" id="winds"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="weather-icon-container">
        <div class="weather-icon" id="icon"></div>
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
    this.querySelector('#day').innerText = day.toUpperCase();
    this.querySelector('#time').innerText = time;
  }

  updateCard() {
    // Päivämäärä ja aika
    this.updateTime();

    // Sääentiteetti (muuta tarvittaessa)
    const weatherEntity = this.config.weather || 'weather.home';
    const windSpeedEntity = this.config.wind_speed || '';
    const windGustEntity = this.config.wind_gust || '';
    const tempEntity = this.config.temperature || '';
    const weatherState = this._hass?.states[weatherEntity];
    const tempValue = tempEntity ? this._hass?.states[tempEntity]?.state : weatherState?.attributes.temperature;
    const tempUnit = weatherState?.attributes.temperature_unit || '°C';
    const condition = weatherState?.state || '';
    const windSpeed = windSpeedEntity ? this._hass?.states[windSpeedEntity]?.state : weatherState?.attributes.wind_speed;
    const windGust = windGustEntity ? this._hass?.states[windGustEntity]?.state : weatherState?.attributes.wind_gust_speed;

    // Sääkuvake
    const conditionIcon = this.getWeatherIcon(condition);

    // Tekstit
    this.querySelector('#condition').innerText = this.getConditionText(condition);
    this.querySelector('#temp').innerText = tempValue ? `${Math.round(tempValue)}${tempUnit}` : '-';
    this.querySelector('#winds').innerText =
      (windSpeed ? `${windSpeed} m/s ` : '') +
      (windGust ? `🌬️ ${windGust} m/s` : '');

    // Kuvake
    this.querySelector('#icon').innerHTML = conditionIcon;
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