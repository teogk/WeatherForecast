
jQuery(App);
function App($) {

    const input = $("#input");
    const output = $("#output");
    const dataTableWithDates = $("#dataTableWithDates");
    const dataTableWithDateForecastEvery3Hours = $("#dataTableWithDateForecastEvery3Hours");
    const forecastForCity = $("#forecastForCity");
    const backButton = $('#backButton');
    let weatherData;

    input.focus();
    input.on("input", handleInput);
    backButton.click(getForecast);

    function handleInput() {
        const inputLength = input.val().length;
        if (inputLength > 2) {
            clearTimeout(window.timer);
            window.timer = setTimeout(getForecast, 700); // blank period timeout to prevent wasteful of the server resources
        } else if (inputLength < 2) { // Handling when user is deleting and reaching input length 1 and below
            clearTimeout(window.timer);
            output.animate({ opacity: 0 }, 1000);
            forecastForCity.animate({ opacity: 0 }, 1000);
            dataTableWithDates.empty();
        }
    }

    function getForecast() {
        backButton.css('opacity', '0');
        dataTableWithDateForecastEvery3Hours.empty();

        let URL = "https://api.openweathermap.org/data/2.5/forecast?q=" + input.val() + "&units=metric" + "&appid=f60f25502d741d7b0dc7d58de36d5ea7";
        let options = {
            url: URL,
            success: show5dayForecast
        };
        $.ajax(options);
    }

    function show5dayForecast(data) {
        weatherData = data;
        dataTableWithDates.empty();
        let dates = getDates(data);

        const city = '<h2>Weather forecast for ' + data.city.name + ', ' + data.city.country + '</h2>'
        forecastForCity.html(city);

        for (i = 0; i < dates.length; i++) {
            const dateDetails = getDetailsForDate(data.list, dates[i]);

            populateTableWith(dateDetails[0], true);
        }
        $('tr').click(showDateDetails);

        forecastForCity.animate({ opacity: 1 }, 50);
        output.animate({ opacity: 1 }, 50);

    }
    function showWeatherDataEvery3Hours() {
        const selectedDate = sessionStorage.getItem('dateId');
        dataTableWithDates.empty();

        const city = '<h2>Weather forecast for ' + weatherData.city.name + ', ' + weatherData.city.country + '</h2>'
        forecastForCity.html(city);

        const dateDetails = getDetailsForDate(weatherData.list, selectedDate);
        for (let i = 0; i < dateDetails.length; i++) {
            populateTableWith(dateDetails[i], false);
        }
        forecastForCity.animate({ opacity: 1 }, 50);
        output.animate({ opacity: 1 }, 50);
        backButton.animate({ opacity: 1 }, 50);
    }
    //Utils

    function populateTableWith(details, showOnlyDate) {
        let dateTxt;
        if (showOnlyDate) {
            dateTxt = details.dt_txt.substring(0, 10);
        } else {
            dateTxt = details.dt_txt;
        }
        let columnDate = "<td>" + dateTxt + "</td>";
        let columnDescription = "<td>" + capitalizeFirstLetter(details.weather[0].description) + "<img src='http://openweathermap.org/img/w/" + details.weather[0].icon + ".png'> " + "</td>";
        let columnTemperature = "<td>" + details.main.temp + " &deg;C" + "</td>";
        let columnHumidity = "<td>" + details.main.humidity + "%" + "</td>";
        let columnMinTemperature = "<td>" + details.main.temp_min + "&deg;C" + "</td>";
        let columnMaxTemperature = "<td>" + details.main.temp_max + "&deg;C" + "</td>";

        let newRowContent = "<tr id='" + dateTxt + "'>" + columnDate + columnDescription + columnTemperature + columnHumidity + columnMinTemperature + columnMaxTemperature + "</tr>";
        dataTableWithDates.append(newRowContent);
    }

    function getDates(data) {
        let dates = [];
        for (i = 0; i < data.list.length; i++) {
            if (!dates.includes(data.list[i].dt_txt.substring(0, 10))) {
                dates.push(data.list[i].dt_txt.substring(0, 10));
            }
        }
        return dates;
    }

    function getDetailsForDate(list, date) {

        let dateValues = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i].dt_txt.substring(0, 10) == date) {
                dateValues.push(list[i]);
            }
        }
        return dateValues;
    }

    function showDateDetails(data) {
        let dateId = $(this).closest('tr').attr('id');
        sessionStorage.clear();
        sessionStorage.setItem('dateId', dateId);
        showWeatherDataEvery3Hours(data);
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}