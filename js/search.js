
jQuery(App);
function App($) {

    const input = $("#input");
    const output = $("#output");
    const tableWith5dayForecast = $("#tableWith5dayForecast");
    const tableWithForecastEvery3Hours = $("#tableWithForecastEvery3Hours");
    const forecastForCity = $("#forecastForCity");
    const backButton = $('#backButton');
    let weatherData;

    input.focus();
    input.on("keyup", handleInput);
    input.on("paste", preventDefault);
    backButton.on("click", handleButton);

    function handleButton(URL) {
        backButtonDisplay(false);
        tableWithForecastEvery3Hours.empty();
        show5dayForecast(weatherData);
    }

    function handleInput() {
        const inputLength = input.val().length;
        if (inputLength > 2) {
            clearTimeout(window.timer);
            window.timer = setTimeout(getForecast, 600); // blank period timeout to prevent wasteful of the server resources
        } else if (inputLength < 1) {
            clearTimeout(window.timer);
            forecastForCity.animate({ opacity: 0 }, 900);
            output.animate({ opacity: 0 }, 600);
            tableWith5dayForecast.empty();
            tableWithForecastEvery3Hours.empty();

        }
    }

    function getForecast() {
        tableWithForecastEvery3Hours.empty();

        let URL = "https://api.openweathermap.org/data/2.5/forecast?q=" + input.val() + "&units=metric" + "&appid=f60f25502d741d7b0dc7d58de36d5ea7";
        if (sessionStorage.getItem(URL) === null) { // Make the call if url isn't cached
            console.log("kane klisi"); //////////////////////////////////////////////////////////////////////////////////////////
            let options = {
                url: URL,
                success: show5dayForecast
            };
            Smartjax.ajax(options);
        } else {
            console.log("iparxei");////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            getDataFromSessionStorage(URL);
            window.timer = setTimeout(clearTimer, 300000); // Clear Session Storage cache after 5 minutes
        }

    }

    function getDataFromSessionStorage(URL) {
        const dataFromSessionStorage = JSON.parse(sessionStorage.getItem(URL));
        show5dayForecast(dataFromSessionStorage);
    }

    function show5dayForecast(data) {
        weatherData = data;
        tableWith5dayForecast.empty();
        let dates = getDates(data);
        changeCursorTo("pointer");

        const city = '<h2>Weather forecast for ' + data.city.name + ', ' + data.city.country + '</h2>'
        forecastForCity.html(city);

        for (i = 0; i < dates.length; i++) {
            const dateDetails = getDetailsForDate(data.list, dates[i]);

            populateTableWith(dateDetails[0], true);
        }
        $('tbody > tr').click(handleClickInTheSelectedDate);

        forecastForCity.animate({ opacity: 1 }, 50);
        output.animate({ opacity: 1 }, 50);

    }
    function showWeatherDataEvery3Hours() {
        const selectedDate = sessionStorage.getItem('dateId');
        tableWith5dayForecast.empty();

        const dateDetails = getDetailsForDate(weatherData.list, selectedDate);
        for (let i = 0; i < dateDetails.length; i++) {
            populateTableWith(dateDetails[i], false);
        }
        forecastForCity.animate({ opacity: 1 }, 50);
        output.animate({ opacity: 1 }, 50);
    }
    //Utils

    function populateTableWith(details, showOnlyDate) {
        const description = capitalizeFirstLetter(details.weather[0].description);
        let dateTxt;
        if (showOnlyDate) {
            dateTxt = details.dt_txt.substring(5, 10); //month-day
        } else {
            dateTxt = details.dt_txt.substring(5, 16); //month-day hour:minutes
        }
        const columnDate = "<td>" + dateTxt + "</td>";
        const columnDescription = "<td>" + "<img src='http://openweathermap.org/img/w/" + details.weather[0].icon + ".png' class='descriptionImg img-fluid' alt='" + description + "' title='" + description + "'>" + "</td>";
        const columnTemperature = "<td>" + details.main.temp + " &deg;C" + "</td>";
        const columnHumidity = "<td>" + details.main.humidity + "%" + "</td>";
        const columnMinTemperature = "<td>" + details.main.temp_min + "&deg;C" + "</td>";
        const columnMaxTemperature = "<td>" + details.main.temp_max + "&deg;C" + "</td>";

        const newRowContent = "<tr id='" + dateTxt + "'>" + columnDate + columnDescription + columnTemperature + columnHumidity + columnMinTemperature + columnMaxTemperature + "</tr>";
        tableWith5dayForecast.append(newRowContent);
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
        backButtonDisplay(true);
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

    function preventDefault(e) {
        e.preventDefault();
    };

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function clearTimer() {
        sessionStorage.clear();
    }
}