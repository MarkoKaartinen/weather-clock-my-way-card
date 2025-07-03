# Weather Clock My Way

Tämä on Lovelace custom card Home Assistantille, joka näyttää ajan, päivän, lämpötilan, säätilan ja tuulitiedot kuvaasi mukaillen.

## Asennus

1. Kopioi `weather-clock-my-way-card.js` hakemistoon `/config/www/` Home Assistant -asennuksessasi.
2. Lisää resurssi käyttöliittymässä:  
   **Asetukset → Käyttöliittymä → Resurssit → Lisää resurssi**  
   - Tyyppi: JavaScript Module  
   - URL: `/local/weather-clock-my-way-card.js`
3. Käynnistä Home Assistantin käyttöliittymä uudelleen.

## Käyttö

Lisää kortti dashboardille:

```yaml
type: 'custom:weather-clock-my-way-card'
weather: weather.home
# Voit asettaa myös:
# temperature: sensor.ulkolampotila
# wind_speed: sensor.wind_speed
# wind_gust: sensor.wind_gust
```

**HUOM:**  
- Varmista, että käytät oikeita entiteettejä omasta Home Assistantistasi!
- Kortti päivittyy automaattisesti kerran sekunnissa.

## Mukauttaminen

- Tyylit, tekstit ja ikonit ovat helposti muokattavissa tiedostossa `weather-clock-my-way-card.js`.
- Lisää tai muuta sääkuvakkeet ja tekstit haluamallasi tavalla.

## HACS

- Lisää tämä repo custom repositoryksi HACS:iin, valitse tyyppi "Lovelace".
- Asenna kortti HACSista ja seuraa yllä olevia ohjeita.

## Linkit

- Ikonit: https://github.com/basmilius/weather-icons