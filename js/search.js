
jQuery(App);
function App($) {

    const input = $("#input");
    const output = $("#output");
    const table = $("#dataTable");
    const forecastForCity = $("#forecastForCity");

    input.focus();
    input.on("input", handleInput);

    function handleInput() {
        const inputLength = input.val().length;
        if (inputLength > 2) {
            clearTimeout(window.timer);
            window.timer = setTimeout(getForecast, 700); // blank period timeout to prevent wasteful of the server resources
        } else if (inputLength < 2) { // Handling when user is deleting and reaching input length 1 and below
            clearTimeout(window.timer);
            output.animate({ opacity: 0 }, 1000);
            $("#forecastForCity").animate({ opacity: 0 }, 1000);
            table.empty();
        }
    }

    function getForecast() {
        let URL = "https://api.openweathermap.org/data/2.5/forecast?q=" + input.val() + "&units=metric" + "&appid=f60f25502d741d7b0dc7d58de36d5ea7";
        let options = {
            url: URL,
            success: handleResponce
        };
        $.ajax(options);
    }

    function handleResponce(data) {
        table.empty();

        let dates = getDates(data);

        var city = '<h2>Weather forecast for ' + data.city.name + ', ' + data.city.country + '</h2>'
        forecastForCity.html(city);

        for (i = 0; i < dates.length; i++) {
            const dateDetails = getDetailsForDate(data.list, dates[i]);

            let columnDate = "<td class='selectedDate'>" + dateDetails[0].dt_txt.substring(0, 10) + "</td>";
            let columnDescription = "<td class='selectedDate'>" + capitalizeFirstLetter(dateDetails[0].weather[0].description) + "<img src='http://openweathermap.org/img/w/" + dateDetails[0].weather[0].icon + ".png'> " + "</td>";
            let columnTemperature = "<td class='selectedDate'>" + dateDetails[0].main.temp + " &deg;C" + "</td>";
            let columnHumidity = "<td class='selectedDate'>" + dateDetails[0].main.humidity + "%" + "</td>";
            let columnMinTemperature = "<td class='selectedDate'>" + dateDetails[0].main.temp_min + "&deg;C" + "</td>";
            let columnMaxTemperature = "<td class='selectedDate'>" + dateDetails[0].main.temp_max + "&deg;C" + "</td>";
            let columnWindSpeed = "<td class='selectedDate'>" + dateDetails[0].wind.speed + " m/s" + "</td>";

            let newRowContent = "<tr id='" + dateDetails[0].dt_txt.substring(0, 10) + "'>" + columnDate + columnDescription + columnTemperature + columnHumidity + columnMinTemperature + columnMaxTemperature + columnWindSpeed + "</tr>";

            table.append(newRowContent);

        }

        output.animate({ opacity: 1 }, 50);
        forecastForCity.animate({ opacity: 1 }, 50);
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
    //Utils
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}