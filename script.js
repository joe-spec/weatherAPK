
var APIKey = "3d44e735d54eb161a90e34a5ec76979e";
var cityArr = [];
//function to show saved city button after refresh
function showSavedData() {
    var cityArr = JSON.parse(localStorage.getItem('citylist'));
    for (var i = 0; i < cityArr.length; i++) {
        console.log("cityArr", cityArr);
        // Then dynamicaly generating buttons for each city in the array
        var a = $("<button>").attr({ "class": "btn", "id": cityArr[i] });
        // Providing the initial button text
        a.text(cityArr[i]);
        // Adding the button to the buttons-view div
        //  $("#result").append(a);
        // $("#buttons-view").append(a);

        $("#" + cityArr[i]).on("click", function (event) {
            event.preventDefault();

            var cityName = this.id;

            getWeatherToday(cityName, "existing");
            getWeatherForecast(cityName, APIKey);
        });
    }
}

//when the dom node is ready
$(function () {
    // showSavedData();
    if ("geolocation" in navigator) { //check geolocation available 
        //try to get user current location using getCurrentPosition() method

        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        navigator.geolocation.getCurrentPosition(function (position) {
            console.log(position);
            getWeatherCurrentLocation(position.coords.latitude, position.coords.longitude);
            getCurrentLocationForecast(position.coords.latitude, position.coords.longitude, APIKey);
            // $("#result").html("Found your location <br />Lat : " + position.coords.latitude + " </br>Lang :" + position.coords.longitude);
        }, null, options);
    } else {
        console.log("Browser doesn't support geolocation!");
    }
    //  $("p").text("The DOM is now loaded and can be manipulated.");
});

//Function .on("click") to trigger AJAX call
$('#find-city').on("click", function (event) {
    event.preventDefault();
    getWeatherTodayButton();
    getWeatherForecastButton(APIKey);
    saveCity();
});
function getWeatherTodayButton() {
    var cityInput = $("#city-input").val();
    getWeatherToday(cityInput, "new");

}

function getWeatherCurrentLocation(lat, lng, callType) {
    $("weather-result").html("");

    //query the api endpoint
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&appid=" + APIKey;
    var cityLat;
    var cityLon;
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        .then(function (response) {
            var currentDate = moment().format('LLL')
            console.log(currentDate)
            //Create div for weather
            var weatherDiv = $('<div class="weatherdiv">');
            var getIcon = response.weather[0].icon;
            console.log("cek icon", getIcon);
            var iconURL = $('<img>').attr({ "src": "https://openweathermap.org/img/w/" + getIcon + ".png" });
            var city = $("<p>").html("<h3>" + response.name + " (" + currentDate + ")");
            city.append(iconURL);
            var tempF = (response.main.temp - 273.15) * 1.80 + 32;
            $('.temp').html(tempF.toFixed() + "Degree");
            //Store the weather data
            var temp = $('<p>').html("Temperature: " + tempF.toFixed() + "&deg" + "F");
            var wind = $('<p>').text("Wind Speed: " + response.wind.speed + " MPH");
            var humidity = $('<p>').text("Humidity: " + response.main.humidity + "%");
            weatherDiv.append(city, temp, wind, humidity);
            $("#weather-result").prepend(city, temp, humidity, wind);
            cityLat = response.coord.lat;
            cityLon = response.coord.lon;
            getUVInd(APIKey, cityLat, cityLon);
            //if button city name already exist
            if (callType == "existing")
                return;
            for (var i = 0; i < city.length; i++) {
                // Then dynamicaly generating buttons for each city in the array
                var a = $("<button>").attr({ "class": "list-group-item list-group-item-action", "id": response.name });
                // Providing the initial button text
                a.text(response.name);
                // Adding the button to the buttons-view div
                $("#buttons-view").append(a);
                $("#" + response.name).on("click", function (event) {
                    event.preventDefault();
                    var cityName = this.id;
                    saveCity();
                    getWeatherToday(cityName, "existing");

                });
            }
        })
}

function getWeatherToday(cityInput, callType) {
    //clear for new search result
    $("#weather-result").html("");
    cityArr.push(cityInput);
    // Query the database
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&appid=" + APIKey;
    var cityLat;
    var cityLon;
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        .then(function (response) {
            var currentDate = moment().format('LLL')
            console.log(currentDate)
            //Create div for weather
            var weatherDiv = $('<div class="weatherdiv">');
            var getIcon = response.weather[0].icon;
            console.log("cek icon", getIcon);
            var iconURL = $('<img>').attr({ "src": "https://openweathermap.org/img/w/" + getIcon + ".png" });
            var city = $("<p>").html("<h3>" + response.name + " (" + currentDate + ")");
            city.append(iconURL);
            var tempF = (response.main.temp - 273.15) * 1.80 + 32;
            $('.temp').html(tempF.toFixed() + "Degree");
            //Store the weather data
            var temp = $('<p>').html("Temperature: " + tempF.toFixed() + "&deg" + "F");
            var wind = $('<p>').text("Wind Speed: " + response.wind.speed + " MPH");
            var humidity = $('<p>').text("Humidity: " + response.main.humidity + "%");
            weatherDiv.append(city, temp, wind, humidity);
            $("#weather-result").prepend(city, temp, humidity, wind);
            cityLat = response.coord.lat;
            cityLon = response.coord.lon;
            getUVInd(APIKey, cityLat, cityLon);
            //if button city name already exist
            if (callType == "existing")
                return;
            for (var i = 0; i < city.length; i++) {
                // Then dynamicaly generating buttons for each city in the array
                var a = $("<button>").attr({ "class": "list-group-item list-group-item-action", "id": response.name });
                // Providing the initial button text
                a.text(response.name);
                // Adding the button to the buttons-view div
                $("#buttons-view").append(a);
                $("#" + response.name).on("click", function (event) {
                    event.preventDefault();
                    var cityName = this.id;
                    saveCity();
                    getWeatherToday(cityName, "existing");

                });
            }
        })
}


//Function to get UV Index
function getUVInd(APIKey, cityLat, cityLon) {
    var queryURLUV = "https://api.openweathermap.org/data/2.5/uvi?lat=" + cityLat + "&lon=" + cityLon + "&appid=" + APIKey;

    $.ajax({
        url: queryURLUV,
        method: "GET"
    })

        .then(function (response) {
            console.log(response);
            //Create div for weather
            var weatherDiv = $('<div class="weatherdiv">');
            var uvInd = $('<p>').html("UV Index: " + "<span class='badge badge-danger p-2'>" + response.value + "</span>");
            weatherDiv.append(uvInd);
            $("#weather-result").append(uvInd);
        })
}

function getWeatherForecastButton(APIKey) {
    var cityInput = $("#city-input").val();
    getWeatherForecast(cityInput, APIKey)
}

function getCurrentLocationForecast(lat, lng, APIKey) {
    //clear for new search result
    $("#weather-forecast").html("");
    var queryURLFor = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lng + "&units=imperial&appid=" + APIKey;
    //  var queryURLFor = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lng + "&units=imperial&appid=" + APIKey;
    $.ajax({
        url: queryURLFor,
        method: "GET",
    })
        .then(function (response) {
            var getForInfo = response.daily;
            for (var i = 1; i < getForInfo.length; i++) {
                var getIcon = getForInfo[i].weather[0].icon;
                //get epoch time and convert to date
                var getForDate = getForInfo[i].dt * 1000;
                var getWeatherDate = new Date(getForDate).getDate();
                var getWeatherMonth = new Date(getForDate).getMonth();
                var getWeatherYear = new Date(getForDate).getFullYear();
                var getForTemp = getForInfo[i].temp.day;
                var getForHum = getForInfo[i].humidity;

                var cardWeather = $('<div>').attr({ "class": "card bg-info shadow mx-2 flex-container mt-4" });
                var cardBodyWeather = $('<div>').attr({ "class": "card-body" });
                var iconURL = $('<img>').attr({ "src": "https://openweathermap.org/img/w/" + getIcon + ".png" });
                var weatherForDate = $('<p>').html((getWeatherMonth + 1) + "/" + getWeatherDate + "/" + getWeatherYear);
                var weatherIcon = $("<p>").append(iconURL);
                var weatherForTemp = $('<p>').html("Temperature: " + getForTemp + "&deg" + "F");
                var weatherForHum = $('<p>').html("Humidity: " + getForHum + "% <br>");

                cardBodyWeather.append(weatherForDate, weatherIcon, weatherForTemp, weatherForHum);
                cardWeather.append(cardBodyWeather);
                $("#weather-forecast").append(cardWeather);
            }
            /*  var getForInfo = response.list;
             //divide by 8 since API updates weather every 3 hours a day
             for (var i = 1; i <= getForInfo.length / 8; i++) {
                 var getIcon = getForInfo[i * 7].weather[0].icon;
                 //get epoch time and convert to date
                 var getForDate = getForInfo[i * 7].dt * 1000;
                 var getWeatherDate = new Date(getForDate).getDate();
                 var getWeatherMonth = new Date(getForDate).getMonth();
                 var getWeatherYear = new Date(getForDate).getFullYear();
 
                 var getForTemp = getForInfo[i * 7].main.temp;
                 var getForHum = getForInfo[i * 7].main.humidity;
 
                 //create card body
                 var cardWeather = $('<div>').attr({ "class": "card bg-info shadow mx-2 flex-container" });
                 var cardBodyWeather = $('<div>').attr({ "class": "card-body" });
                 var iconURL = $('<img>').attr({ "src": "https://openweathermap.org/img/w/" + getIcon + ".png" });
                 var weatherForDate = $('<p>').html((getWeatherMonth + 1) + "/" + getWeatherDate + "/" + getWeatherYear);
                 var weatherIcon = $("<p>").append(iconURL);
                 var weatherForTemp = $('<p>').html("Temperature: " + getForTemp + "&deg" + "F");
                 var weatherForHum = $('<p>').html("Humidity: " + getForHum + "% <br>");
 
                 cardBodyWeather.append(weatherForDate, weatherIcon, weatherForTemp, weatherForHum);
                 cardWeather.append(cardBodyWeather);
                 $("#weather-forecast").append(cardWeather);
             } */
        })
}

function getWeatherForecast(cityInput, APIKey) {
    //clear for new search result
    $("#weather-forecast").html("");
    //    var queryURLFor = "https://api.openweathermap.org/data/2.5/onecall?q=" + cityInput + "&units=imperial&appid=" + APIKey;
    // var queryURLFor = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityInput + "&units=imperial&appid=" + APIKey;

    //Using api from positionstack to get location from place or address

    //this is the api key for position stack
    const positionStackKey = "094ba92a327cfc3b07c8a29851637554";

    $.when($.ajax("http://api.positionstack.com/v1/forward?access_key=094ba92a327cfc3b07c8a29851637554&query=" + cityInput)).then(function (response) {
        //  console.log('response for position', response);
        const location = response.data[0];
        const longitude = location.longitude;
        const latitude = location.latitude;
        var queryURLFor = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&units=imperial&appid=" + APIKey;

        $.ajax({
            url: queryURLFor,
            method: "GET",
        })
            .then(function (response) {
                //   console.log('forecase reponse ', response);
                //  var getForInfo = response.list;
                var getForInfo = response.daily;
                for (var i = 1; i < getForInfo.length; i++) {
                    var getIcon = getForInfo[i].weather[0].icon;
                    //get epoch time and convert to date
                    var getForDate = getForInfo[i].dt * 1000;
                    var getWeatherDate = new Date(getForDate).getDate();
                    var getWeatherMonth = new Date(getForDate).getMonth();
                    var getWeatherYear = new Date(getForDate).getFullYear();
                    var getForTemp = getForInfo[i].temp.day;
                    var getForHum = getForInfo[i].humidity;

                    var cardWeather = $('<div>').attr({ "class": "card bg-info shadow mx-2 flex-container mt-4" });
                    var cardBodyWeather = $('<div>').attr({ "class": "card-body" });
                    var iconURL = $('<img>').attr({ "src": "https://openweathermap.org/img/w/" + getIcon + ".png" });
                    var weatherForDate = $('<p>').html((getWeatherMonth + 1) + "/" + getWeatherDate + "/" + getWeatherYear);
                    var weatherIcon = $("<p>").append(iconURL);
                    var weatherForTemp = $('<p>').html("Temperature: " + getForTemp + "&deg" + "F");
                    var weatherForHum = $('<p>').html("Humidity: " + getForHum + "% <br>");

                    cardBodyWeather.append(weatherForDate, weatherIcon, weatherForTemp, weatherForHum);
                    cardWeather.append(cardBodyWeather);
                    $("#weather-forecast").append(cardWeather);

                }
                //divide by 8 since API updates weather every 3 hours a day
                // for (var i = 1; i <= getForInfo.length / 8; i++) {
                //     var getIcon = getForInfo[i * 7].weather[0].icon;
                //     //get epoch time and convert to date
                //     var getForDate = getForInfo[i * 7].dt * 1000;
                //     var getWeatherDate = new Date(getForDate).getDate();
                //     var getWeatherMonth = new Date(getForDate).getMonth();
                //     var getWeatherYear = new Date(getForDate).getFullYear();

                //     var getForTemp = getForInfo[i * 7].main.temp;
                //     var getForHum = getForInfo[i * 7].main.humidity;

                //     //create card body
                //     var cardWeather = $('<div>').attr({ "class": "card bg-info shadow mx-2 flex-container" });
                //     var cardBodyWeather = $('<div>').attr({ "class": "card-body" });
                //     var iconURL = $('<img>').attr({ "src": "https://openweathermap.org/img/w/" + getIcon + ".png" });
                //     var weatherForDate = $('<p>').html((getWeatherMonth + 1) + "/" + getWeatherDate + "/" + getWeatherYear);
                //     var weatherIcon = $("<p>").append(iconURL);
                //     var weatherForTemp = $('<p>').html("Temperature: " + getForTemp + "&deg" + "F");
                //     var weatherForHum = $('<p>').html("Humidity: " + getForHum + "% <br>");

                //     cardBodyWeather.append(weatherForDate, weatherIcon, weatherForTemp, weatherForHum);
                //     cardWeather.append(cardBodyWeather);
                //     $("#weather-forecast").append(cardWeather);
                // }
            })
    });


}

function saveCity() {
    localStorage.setItem("citylist", JSON.stringify(cityArr));
}
