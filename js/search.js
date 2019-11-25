
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
            window.timer = setTimeout(getResults, 700); // blank period timeout to prevent wasteful of the server resources
        } else if (inputLength < 2) { // Handling when user is deleting and reaching input length 1 and below
            clearTimeout(window.timer);
            output.animate({ opacity: 0 }, 1000);
            $("#forecastForCity").animate({ opacity: 0 }, 1000);
            table.empty();
        }
    }

    function getResults() {
        let URL = "https://api.openweathermap.org/data/2.5/forecast?q=" + input.val() + "&units=metric" + "&appid=f60f25502d741d7b0dc7d58de36d5ea7";
        let options = {
            url: URL,
            success: handleResponce
        };
        $.ajax(options);
    }

    function handleResponce(data) {

        output.animate({ opacity: 1 }, 50);
        forecastForCity.animate({ opacity: 1 }, 50);
        table.empty();

        var city = '<h2>Weather forecast for ' + data.city.name + ', ' + data.city.country + '</h2>'
        forecastForCity.html(city);

        for (var i = 0; i < data.list.length; i += 8) {

            let columnDate = "<td class='border res'>" + data.list[i].dt_txt.substring(0, 10) + "</td>";
            let columnDescription = "<td class='border res'>" + data.list[i].weather[0].description + "<img src='http://openweathermap.org/img/w/" + data.list[0].weather[0].icon + ".png'> " + "</td>";
            let columnTemperature = "<td class='border res'>" + data.list[i].main.temp + " &deg;C" + "</td>";
            let columnHumidity = "<td class='border res'>" + data.list[i].main.humidity + "%" + "</td>";
            let columnMinTemperature = "<td class='border res'>" + data.list[i].main.temp_min + "&deg;C" + "</td>";
            let columnMaxTemperature = "<td class='border res'>" + data.list[i].main.temp_max + "&deg;C" + "</td>";
            let columnWindSpeed = "<td class='border res '>" + data.list[i].wind.speed + " m/s" + "</td>";

            let newRowContent = "<tr>" + columnDate + columnDescription + columnTemperature + columnHumidity + columnMinTemperature + columnMaxTemperature + columnWindSpeed + "</tr>";

            table.append(newRowContent);
        }

    }


}