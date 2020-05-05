
jQuery(App);
function App($) {

    const input = $("#input");
    const tableOutput = $("#tableOutput");
    const tbody_5dayForecast = $("#tbody_5dayForecast");
    const tbody_ForecastEvery3Hours = $("#tbody_ForecastEvery3Hours");
    const forecastForCity = $("#forecastForCity");
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
            tbody_5dayForecast.empty();
        }
    }

    function getForecast() {
        tbody_ForecastEvery3Hours.empty();

        let URL = "https://api.openweathermap.org/data/2.5/forecast?q=" + input.val() + "&units=metric" + "&appid=f60f25502d741d7b0dc7d58de36d5ea7";
        if (sessionStorage.getItem(URL) === null) { // Make the call if url isn't cached
            let options = {
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
        let dates = getDates(data);
        weatherData = data;
        tbody_5dayForecast.empty();
        changeCursorTo("pointer");

        const city = '<h2>Weather forecast for ' + data.city.name + ', ' + data.city.country + '</h2>'
        forecastForCity.html(city);

        for (i = 0; i < dates.length; i++) {
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
        tbody_5dayForecast.empty();

        const dateDetails = getDetailsForDate(weatherData.list, selectedDate);
        for (let i = 0; i < dateDetails.length; i++) {
            populateTableWith(dateDetails[i], false);
        }
        backButtonDisplay(true);
    }

    function handleBackButton() {
        tbody_ForecastEvery3Hours.empty();
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
        const columnDate = "<td>" + dateTxt + "</td>";
        const columnDescription = "<td>" + "<img src='http://openweathermap.org/img/w/" + details.weather[0].icon + ".png' class='descriptionImg img-fluid' alt='" + description + "' title='" + description + "'>" + "</td>";
        const columnTemperature = "<td>" + details.main.temp + " &deg;C" + "</td>";
        const columnHumidity = "<td>" + details.main.humidity + "%" + "</td>";
        const columnMinTemperature = "<td>" + details.main.temp_min + "&deg;C" + "</td>";
        const columnMaxTemperature = "<td>" + details.main.temp_max + "&deg;C" + "</td>";

        const newRowContent = "<tr id='" + dateTxt + "'>" + columnDate + columnDescription + columnTemperature + columnHumidity + columnMinTemperature + columnMaxTemperature + "</tr>";
        tbody_5dayForecast.append(newRowContent);
    }

    function getDates(data) {
        let dates = [];
        for (i = 0; i < data.list.length; i++) {
            if (!dates.includes(data.list[i].dt_txt.substring(5, 10))) {
                dates.push(data.list[i].dt_txt.substring(5, 10));
            }
        }
        return dates;
    }

    function getDetailsForDate(list, date) {
        let dateValues = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].dt_txt.substring(5, 10) == date) {
                dateValues.push(list[i]);
            }
        }
        return dateValues;
    }

    function handleClickInTheSelectedDate(data) {
        let dateId = $(this).closest('tr').attr('id');
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

    function backButtonDisplay(bool) {
        if (bool) {
            backButton.delay(60).show(0);
        } else {
            backButton.hide();
        }
    }

    function handleError404() {
        forecastForCity.html("No results found. Please try a different location").animate({ opacity: 1 }, 1000);
        tableOutput.animate({ opacity: 0 }, 100);
        tbody_5dayForecast.empty();
        tbody_ForecastEvery3Hours.empty();
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function clearSessionStorage() {
        sessionStorage.clear();
    }
}