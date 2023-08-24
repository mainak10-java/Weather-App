const API_KEY=  "357976cabbcc46d2f1303e6d67bd6425";

const userTab=document.querySelector('#curr-city-weather');
const searchTab=document.querySelector('#search-city-weather');
const grantAccessContainer= document.querySelector('.grant-access-container');
const searchForm= document.querySelector('.form-container');
const loadingScreen= document.querySelector('.loading-container');
const userInfoContainer = document.querySelector(".user-info-container");
const errorContainer= document.querySelector('.error-container');

let currentTab=userTab;
currentTab.classList.add("current-tab");
getFromSessionStorage();

function switchTab(clickedTab){
    errorContainer.classList.remove('active');
    
    if(currentTab!=clickedTab){
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");

        //If the search form is invisible
        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        //Now i need to make the weather tab visible with every data it ahs
        else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
}


userTab.addEventListener("click" , () =>{
    switchTab(userTab); // here we are passing the clicked tab as the param
});


searchTab.addEventListener("click", () =>{
    switchTab(searchTab);
});

function getFromSessionStorage(){
    const localCoordinates= sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates=JSON.parse(localCoordinates);
        fetchYourWeatherInfo(coordinates);
    }
}

const apiErrorText= document.querySelector("[data-apiErrorText]");
const apiErrorImg = document.querySelector("[data-notFoundImg]");


async function fetchYourWeatherInfo(coordinates){
    const {lat, lon}= coordinates;
    grantAccessContainer.classList.remove("active");

    loadingScreen.classList.add("acitve");
    try{
        const response= await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data= await response.json();
        if(!data.sys)
         throw data;

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(error){
        loadingScreen.classList.remove("active");
        errorContainer.classList.add("active");
        apiErrorImg.style.display = "none";
        apiErrorText.innerText = `Error: ${error?.message}`;
    }
}

function renderWeatherInfo(weatherInfo){
    const cityName= document.querySelector("[data-cityName]");
    const countryIcon= document.querySelector("[data-countryIcon]");
    const desc= document.querySelector("[data-weatherDesc]");
    const weatherIcon= document.querySelector("[data-weatherIcon]");
    const temp=document.querySelector("[data-weatherTemp]");
    const windspeed= document.querySelector("[data-windSpeed]");
    const cloudiness=document.querySelector("[data-cloudiness]");
    const humidity=document.querySelector("[data-humidity]");

    cityName.innerText=weatherInfo?.name;
    countryIcon.src= `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText=weatherInfo?.weather?.[0]?.description;
    weatherIcon.src=`http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText=`${weatherInfo?.main?.temp} °C`;
    windspeed.innerText=`${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText=`${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert('Geolocation support unavailable');
    }
}

function showPosition(position){
    const userCoordinates= {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchYourWeatherInfo(userCoordinates);
}
const grantAccessBtn=document.querySelector("#grant-access-btn");
grantAccessBtn.addEventListener('click', getLocation);

const searchInput=document.querySelector("#search-bar")

searchForm.addEventListener("submit", (e) => {

    e.preventDefault();  // Prevent the default action
    let cityName=searchInput.value;

    if(cityName === "")
        return;
    else
        fetchCityWeatherInfo(cityName);
    cityName="";
});



async function fetchCityWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorContainer.classList.remove("active");

    try{
        const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data=await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    //  console.log("Data Rendered");
    }
    catch(error){
        loadingScreen.classList.remove('active');
        errorContainer.classList.add('active');
        apiErrorText.innerText = `${error?.message}`;
    }
}
