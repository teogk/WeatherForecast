
jQuery(App);
function App($) {

    const input = $("#input");
    const tableOutput = $("#tableOutput");
    const forecastForCity = $("#forecastForCity");
    const tbody_forecast = $("#tbody_forecast");
    const backButton = $('#backButton');
    let weatherData;

    input.focus();
    input.on("input", handleInput);
    backButton.on("click", handleBackButton);

    function handleInput() {
        const inputLength = input.val().length;
        if (inputLength > 2) {
            clearTimeout(window.timer);
            window.timer = setTimeout(getForecast, 700); // Blank period timeout to prevent wasteful of the server resources
        } else if (inputLength === 0) {
            clearTimeout(window.timer);
            backButtonDisplay(false);
            forecastForCity.animate({ opacity: 0 }, 900);
            tableOutput.animate({ opacity: 0 }, 600);
            tbody_forecast.empty();
        }
    }

    function getForecast() {

        const URL = "https://api.openweathermap.org/data/2.5/forecast?q=" + input.val() + "&units=metric" + "&appid=f60f25502d741d7b0dc7d58de36d5ea7";
        if (sessionStorage.getItem(URL) === null) { // Make the call if url isn't cached
            const options = {
                url: URL,
                statusCode: { 404: handleError404 },
                success: show5dayForecast
            };
            Smartjax.ajax(options);
        } else {
            getDataFromSessionStorage(URL);
        }
        window.timer = setTimeout(clearSessionStorage, 300000); // Clear after 5 minutes
    }

    function show5dayForecast(data) {
        const dates = getDates(data);
        weatherData = data;
        tbody_forecast.empty();
        changeCursorTo("pointer");

        const city = `<h2>Weather forecast for ${data.city.name}, ${data.city.country}</h2>`;
        forecastForCity.html(city);

        for (let i = 0; i < dates.length; i++) {
            const dateDetails = getDetailsForDate(data.list, dates[i]);
            populateTableWith(dateDetails[0], true);
        }
        $('tbody > tr').click(handleClickInTheSelectedDate);

        forecastForCity.css('opacity', '1');
        tableOutput.css('opacity', '1');
        backButtonDisplay(false);
    }

    function getDataFromSessionStorage(URL) {
        const dataFromSessionStorage = JSON.parse(sessionStorage.getItem(URL));
        show5dayForecast(dataFromSessionStorage);
    }

    function showWeatherDataEvery3Hours() {
        const selectedDate = sessionStorage.getItem('dateId');
        tbody_forecast.empty();

        const dateDetails = getDetailsForDate(weatherData.list, selectedDate);
        for (let i = 0; i < dateDetails.length; i++) {
            populateTableWith(dateDetails[i], false);
        }
        backButtonDisplay(true);
    }

    function handleBackButton() {
        show5dayForecast(weatherData);
    }

    function populateTableWith(details, showOnlyDate) {
        const description = capitalizeFirstLetter(details.weather[0].description);
        let dateTxt;
        if (showOnlyDate) {
            dateTxt = details.dt_txt.substring(5, 10); // month-day (5 day Forecast)
        } else {
            dateTxt = details.dt_txt.substring(5, 16); // month-day hour:minutes (Forecast Every 3 Hours)
        }
        const columnDate = `<td>${dateTxt}</td>`;
        const columnDescription = `<td><img src="http://openweathermap.org/img/w/${details.weather[0].icon}.png" class="descriptionImg img-fluid" alt="${description}" title="${description}"></td>`;
        const columnTemperature = `<td>${details.main.temp}&deg;C</td>`;
        const columnHumidity = `<td>${details.main.humidity}%</td>`;
        const columnMinTemperature = `<td>${details.main.temp_min}&deg;C</td>`;
        const columnMaxTemperature = `<td>${details.main.temp_max}&deg;C</td>`;

        const newRowContent = `<tr id="${dateTxt}"> ${columnDate} ${columnDescription} ${columnTemperature} ${columnHumidity} ${columnMinTemperature} ${columnMaxTemperature}</tr>`;
        tbody_forecast.append(newRowContent);
    }

    function getDates(data) {
        const dates = [];
        for (let i = 0; i < data.list.length; i++) {
            const date = data.list[i].dt_txt.substring(5, 10);
            if (!dates.includes(date)) {
                dates.push(date);
            }
        }
        return dates;
    }

    function getDetailsForDate(list, date) {
        const dateDetails = [];
        for (let i = 0; i < list.length; i++) {
            const listDate = list[i].dt_txt.substring(5, 10);
            if (listDate === date) {
                dateDetails.push(list[i]);
            }
        }
        return dateDetails;
    }

    function handleClickInTheSelectedDate(data) {
        const dateId = $(this).closest('tr').attr('id');
        sessionStorage.setItem('dateId', dateId);
        changeCursorTo("default_");
        showWeatherDataEvery3Hours(data);
    }

    function changeCursorTo(cursorType) {
        if (cursorType === "pointer") {
            $('tbody').css('cursor', 'pointer');
        } else {
            $('tbody').css('cursor', 'default');
        }
    }

    function backButtonDisplay(show) {
        if (show) {
            backButton.delay(60).show(0);
        } else {
            backButton.hide();
        }
    }

    function handleError404() {
        backButtonDisplay(false);
        tableOutput.animate({ opacity: 0 }, 0);
        tbody_forecast.empty();
        forecastForCity.html("No results found. Please try a different location").animate({ opacity: 1 }, 1000);
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function clearSessionStorage() {
        sessionStorage.clear();
    }
}