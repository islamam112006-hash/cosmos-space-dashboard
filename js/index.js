// NASA API Key - using demo key for now
var NASA_API_KEY = "QOF2hwQhlWH7CMJUtoBjXn2BpukepUAQNovUJ8Qu";

// API Key and Endpoints
var APOD_URL = "https://api.nasa.gov/planetary/apod";
var PLANETS_URL = "https://solar-system-opendata-proxy.vercel.app/api/planets";
var LAUNCHES_URL =
  "https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=10";

// Global variable to store planet data
var allPlanetsData = [];

// Run when the page loads
document.addEventListener("DOMContentLoaded", function () {
  // Set max date for the calendar
  var todayDate = new Date().toISOString().split("T")[0];
  var dateInput = document.getElementById("apod-date-input");
  document.getElementById("apod-date-display").innerText =
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  if (dateInput) {
    dateInput.max = todayDate;
    dateInput.value = todayDate;
  }

  // Setup UI parts
  setupNavigation();
  setupSidebar();

  // Get initial data from APIs
  loadTodayAPOD();
  loadUpcomingLaunches();
  loadPlanetsData();
});

// Sidebar toggle for mobile
function setupSidebar() {
  var toggleBtn = document.getElementById("sidebar-toggle");
  var sidebar = document.getElementById("sidebar");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("sidebar-mobile");
    });
  }
}

// Handle clicking menu links
function setupNavigation() {
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = document.querySelectorAll(".app-section");

  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", function (e) {
      e.preventDefault();
      var targetId = this.getAttribute("data-section");

      // Change active link color
      for (var j = 0; j < navLinks.length; j++) {
        navLinks[j].classList.remove("bg-blue-500/10", "text-blue-400");
        navLinks[j].classList.add("text-slate-300");
      }
      this.classList.add("bg-blue-500/10", "text-blue-400");
      this.classList.remove("text-slate-300");

      // Show only the clicked section
      for (var k = 0; k < sections.length; k++) {
        if (sections[k].id === targetId) {
          sections[k].classList.remove("hidden");
        } else {
          sections[k].classList.add("hidden");
        }
      }

      // Close menu on mobile
      if (window.innerWidth < 1024) {
        document.getElementById("sidebar").classList.add("sidebar-mobile");
      }
    });
  }
}

// --- NASA APOD Section ---

function loadTodayAPOD() {
  fetchAPOD("");
}

// Get data from NASA
function fetchAPOD(dateValue) {
  var loading = document.getElementById("apod-loading");
  var image = document.getElementById("apod-image");

  if (loading) loading.classList.remove("hidden");
  if (image) image.style.opacity = "0.3";

  var url = APOD_URL + "?api_key=" + NASA_API_KEY;
  if (dateValue !== "") {
    url = url + "&date=" + dateValue;
  }

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.error) {
        alert("Error: " + data.error.message);
      } else {
        displayAPOD(data);
      }
    })
    .catch(function (err) {
      console.log(err);
      alert("Could not load space image.");
    })
    .finally(function () {
      if (loading) loading.classList.add("hidden");
      if (image) image.style.opacity = "1";
    });
}

// Update the APOD UI
function displayAPOD(data) {
  document.getElementById("apod-image").src = data.url;
  document.getElementById("apod-title").innerText = data.title;
  document.getElementById("apod-date").innerText =
    "Astronomy Picture of the Day - " + data.date;
  document.getElementById("apod-explanation").innerText = data.explanation;

  var copyrightText = "© NASA Public Domain";
  if (data.copyright) {
    copyrightText = "© " + data.copyright;
  }
  document.getElementById("apod-copyright").innerText = copyrightText;

  document.getElementById("apod-date-detail").innerHTML =
    '<i class="far fa-calendar mr-2"></i>' + data.date;
  document.getElementById("apod-date-info").innerText = data.date;

  var type = data.media_type;
  document.getElementById("apod-media-type").innerText =
    type.charAt(0).toUpperCase() + type.slice(1);
}

// APOD Buttons
var loadBtn = document.getElementById("load-date-btn");
if (loadBtn) {
  loadBtn.addEventListener("click", function () {
    var dateVal = document.getElementById("apod-date-input").value;
    if (dateVal) {
      fetchAPOD(dateVal);
    }
  });
}

var todayBtn = document.getElementById("today-apod-btn");
if (todayBtn) {
  todayBtn.addEventListener("click", function () {
    var today = new Date().toISOString().split("T")[0];
    document.getElementById("apod-date-input").value = today;
    loadTodayAPOD();
  });
}

// --- Launches Section ---

function loadUpcomingLaunches() {
  fetch(LAUNCHES_URL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var launches = data.results;

      // Update counts in header
      var countTxt = document.getElementById("launches-count");
      var countMob = document.getElementById("launches-count-mobile");
      if (countTxt) countTxt.innerText = launches.length + " Launches";
      if (countMob) countMob.innerText = launches.length;

      if (launches.length > 0) {
        displayFeaturedLaunch(launches[0]);

        // Remove first one and show the rest
        var otherLaunches = [];
        for (var i = 1; i < launches.length; i++) {
          otherLaunches.push(launches[i]);
        }
        displayLaunchesGrid(otherLaunches);
      }
    })
    .catch(function (err) {
      console.log("Launch error:", err);
    });
}

function displayFeaturedLaunch(launch) {
  var container = document.getElementById("featured-launch");
  if (!container) return;

  var date = new Date(launch.net);

  var status = launch.status?.abbrev || "TBD";

  var provider = launch.launch_service_provider?.name || "Unknown";

  var rocket = launch.rocket?.configuration?.name || "Unknown";

  var description =
    launch.mission?.description || "No mission description available.";

  var location = launch.pad?.location?.name || "Unknown Location";

  var country = launch.pad?.location?.country_code || "Unknown";

  var image = `
        <div class="flex items-center justify-center h-full min-h-[400px] bg-slate-800">
            <i class="fas fa-rocket text-9xl text-slate-700/50"></i>
        </div>
    `;

  if (launch.image?.image_url) {
    image = `
            <img 
                src="${launch.image.image_url}" 
                class="w-full h-full object-cover min-h-[400px]"
                alt="Launch Image"
                onerror="this.style.display='none'"
            >
        `;
  }

  container.innerHTML = `
    <div
        class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all"
    >

        <div
            class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
        ></div>


        <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">


            <div class="flex flex-col justify-between">

                <div>

                    <div class="flex items-center gap-3 mb-4">

                        <span
                            class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2"
                        >
                            <i class="fas fa-star"></i>
                            Featured Launch
                        </span>


                        <span
                            class="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold"
                        >
                            ${status}
                        </span>

                    </div>


                    <h3 class="text-3xl font-bold mb-3 leading-tight">
                        ${launch.name}
                    </h3>


                    <div
                        class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400"
                    >

                        <div class="flex items-center gap-2">
                            <i class="fas fa-building"></i>
                            <span>${provider}</span>
                        </div>


                        <div class="flex items-center gap-2">
                            <i class="fas fa-rocket"></i>
                            <span>${rocket}</span>
                        </div>

                    </div>



                    



                    <div class="grid xl:grid-cols-2 gap-4 mb-6">


                        <div class="bg-slate-900/50 rounded-xl p-4">
                            <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                                <i class="fas fa-calendar"></i>
                                Launch Date
                            </p>

                            <p class="font-semibold">
                                ${date.toLocaleDateString()}
                            </p>
                        </div>



                        <div class="bg-slate-900/50 rounded-xl p-4">

                            <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                                <i class="fas fa-clock"></i>
                                Launch Time
                            </p>

                            <p class="font-semibold">
                                ${date.toLocaleTimeString()} UTC
                            </p>

                        </div>



                        <div class="bg-slate-900/50 rounded-xl p-4">

                            <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                                <i class="fas fa-map-marker-alt"></i>
                                Location
                            </p>

                            <p class="font-semibold text-sm">
                                ${location}
                            </p>

                        </div>



                        <div class="bg-slate-900/50 rounded-xl p-4">

                            <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                                <i class="fas fa-globe"></i>
                                Country
                            </p>

                            <p class="font-semibold">
                                ${country}
                            </p>

                        </div>


                    </div>



                    <p class="text-slate-300 leading-relaxed mb-6">
                        ${description}
                    </p>


                </div>



                <div class="flex flex-col md:flex-row gap-3">

                    <button
                        class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
                    >

                        <i class="fas fa-info-circle"></i>
                        View Full Details

                    </button>



                    <div class="icons self-end md:self-center">

                        <button
                            class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
                        >
                            <i class="far fa-heart"></i>
                        </button>


                        <button
                            class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
                        >
                            <i class="fas fa-bell"></i>
                        </button>

                    </div>

                </div>


            </div>



            <div class="relative">

                <div
                    class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50"
                >

                    ${image}


                    <div
                        class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"
                    ></div>

                </div>

            </div>



        </div>

    </div>
    `;
}

function displayLaunchesGrid(launchesList) {
  var grid = document.getElementById("launches-grid");
  if (!grid) return;

  grid.innerHTML = "";

  for (var i = 0; i < launchesList.length; i++) {
    var item = launchesList[i];

    var date = new Date(item.net);

    var formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    var status = item.status?.abbrev || "TBD";

    var provider = item.launch_service_provider?.name || "Unknown";

    var rocket = item.rocket?.configuration?.name || "Unknown";

    var location = item.pad?.location?.name || "Unknown Location";

    var statusColor = "bg-blue-500/90";

    if (status === "Go") {
      statusColor = "bg-green-500/90";
    } else if (status === "TBC") {
      statusColor = "bg-yellow-500/90";
    }

    var imgHtml =
      '<div class="w-full h-full flex items-center justify-center bg-slate-900">' +
      '<i class="fas fa-rocket text-5xl text-slate-700"></i>' +
      "</div>";

    if (item.image && item.image.image_url) {
      imgHtml =
        '<img src="' +
        item.image.image_url +
        '"' +
        ' class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"' +
        " onerror=\"this.style.display='none'; this.parentNode.innerHTML='<div class=&quot;w-full h-full flex items-center justify-center bg-slate-900&quot;><i class=&quot;fas fa-rocket text-5xl text-slate-700&quot;></i></div>';\">";
    }

    var card = document.createElement("div");

    card.className =
      "bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer";

    card.innerHTML = `

<div class="relative h-48 bg-slate-900/50 flex items-center justify-center overflow-hidden">
        ${imgHtml}


        <div class="absolute top-3 right-3">

            <span
            class="px-3 py-1 ${statusColor} text-white backdrop-blur-sm rounded-full text-xs font-semibold">
                ${status}
            </span>

        </div>

    </div>



    <div class="p-5">


        <div class="mb-3">


            <h4
            class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">

                ${item.name}

            </h4>



            <p class="text-sm text-slate-400 flex items-center gap-2">

                <i class="fas fa-building text-xs"></i>

                ${provider}

            </p>


        </div>




        <div class="space-y-2 mb-4">


            <div class="flex items-center gap-2 text-sm">

                <i class="fas fa-calendar text-slate-500 w-4"></i>

                <span class="text-slate-300">
                    ${formattedDate}
                </span>

            </div>




            <div class="flex items-center gap-2 text-sm">

                <i class="fas fa-clock text-slate-500 w-4"></i>

                <span class="text-slate-300">
                    ${date.toLocaleTimeString()} UTC
                </span>

            </div>





            <div class="flex items-center gap-2 text-sm">

                <i class="fas fa-rocket text-slate-500 w-4"></i>

                <span class="text-slate-300">
                    ${rocket}
                </span>

            </div>





            <div class="flex items-center gap-2 text-sm">

                <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>

                <span class="text-slate-300 line-clamp-1">
                    ${location}
                </span>

            </div>


        </div>




        <div
        class="flex items-center gap-2 pt-4 border-t border-slate-700">


            <button
            class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">

                Details

            </button>




            <button
            class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">

                <i class="far fa-heart"></i>

            </button>



        </div>


    </div>

    `;

    grid.appendChild(card);
  }
}

// --- Planets Section ---

function loadPlanetsData() {
  fetch(PLANETS_URL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (Array.isArray(data)) {
        allPlanetsData = data;
      } else {
        allPlanetsData = data.bodies;
      }

      setupPlanetCards();
    })
    .catch(function (err) {
      console.log("Planet error:", err);
    });
}

function setupPlanetCards() {
  var cards = document.querySelectorAll(".planet-card");
  for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener("click", function (event) {
      var pId = event.target.getAttribute("data-planet-id");
      showPlanetDetails(pId);
    });
  }
}

function showPlanetDetails(planetId) {
  var planet = null;
  for (var i = 0; i < allPlanetsData.length; i++) {
    if (
      allPlanetsData[i].englishName.toLowerCase() === planetId.toLowerCase()
    ) {
      planet = allPlanetsData[i];
      break;
    }
  }

  if (planet === null) return;

  // Update the big planet card
  document.getElementById("planet-detail-name").innerText = planet.englishName;
  document.getElementById("planet-detail-image").src =
    "./assets/images/" + planetId + ".png";

  // Update scientific numbers
  document.getElementById("planet-perihelion").innerText =
    formatNumber(planet.perihelion) + " km";
  document.getElementById("planet-aphelion").innerText =
    formatNumber(planet.aphelion) + " km";
  document.getElementById("planet-eccentricity").innerText =
    planet.eccentricity;
  document.getElementById("planet-inclination").innerText =
    planet.inclination + "°";
  document.getElementById("planet-axial-tilt").innerText =
    planet.axialTilt + "°";

  // Convert Kelvin to Celsius
  var celsius = planet.avgTemp - 273.15;
  document.getElementById("planet-temp").innerText = celsius.toFixed(1) + "°C";

  // Convert m/s to km/s
  var escapeKm = planet.escape / 1000;
  document.getElementById("planet-escape").innerText =
    escapeKm.toFixed(2) + " km/s";
}

// Simple number formatting
function formatNumber(num) {
  if (!num) return "0";
  return new Intl.NumberFormat().format(num);
}
