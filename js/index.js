/* ========================================
   GLOBAL VARIABLES
   currentPlanetId: id of the planet currently shown in the detail panel
   countdownInterval: handle for the featured-launch countdown timer,
     so it can be cleared and restarted whenever launches are refreshed
   favoriteLaunches: array of launch ids the user has starred,
     persisted to localStorage
======================================== */
var NASA_API_KEY = 'DEMO_KEY'; // swap for your own free key from https://api.nasa.gov (DEMO_KEY has a low rate limit)
var LAUNCH_API_URL = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=13&mode=detailed';
var FAVORITES_STORAGE_KEY = 'cosmos-favorite-launches';

var currentPlanetId = 'earth';
var countdownInterval = null;
var favoriteLaunches = [];

// Maps a launch status name (as returned by the Launch Library API) to a Tailwind badge class.
var STATUS_STYLES = {
  'Go': 'bg-green-500/90 text-white',
  'To Be Determined': 'bg-yellow-500/90 text-white',
  'To Be Confirmed': 'bg-blue-500/90 text-white',
  'Hold': 'bg-red-500/90 text-white',
  'In Flight': 'bg-purple-500/90 text-white',
  'Success': 'bg-green-500/90 text-white',
  'Failure': 'bg-red-500/90 text-white',
  'Partial Failure': 'bg-orange-500/90 text-white'
};

// Font Awesome icons cycled through for launch cards that have no photo of their own.
var LAUNCH_ICONS = ['fa-rocket', 'fa-space-shuttle', 'fa-satellite-dish', 'fa-satellite'];

// Reference data for the Planets section. Values are the commonly cited
// figures for each planet (semimajor axis, mean radius, mass, etc).
var PLANETS = {
  mercury: {
    name: 'Mercury',
    image: './assets/images/mercury.png',
    description: 'Mercury is the smallest planet in the Solar System and the closest to the Sun. Its surface resembles that of the Moon, heavily cratered from billions of years of impacts, and it experiences the most extreme temperature swings of any planet.',
    distance: '57.9M km',
    radius: '2,439.7 km',
    mass: '3.30 \u00D7 10\u00B2\u00B3 kg',
    density: '5.43 g/cm\u00B3',
    orbitalPeriod: '88 days',
    rotation: '58.6 days',
    moons: '0',
    gravity: '3.7 m/s\u00B2',
    discoverer: 'Known since antiquity',
    discoveryDate: 'Ancient',
    bodyType: 'Planet',
    volume: '6.08 \u00D7 10\u00B9\u2070 km\u00B3',
    perihelion: '46.0M km',
    aphelion: '69.8M km',
    eccentricity: '0.2056',
    inclination: '7.00\u00B0',
    axialTilt: '0.034\u00B0',
    temp: '167\u00B0C',
    escape: '4.3 km/s',
    facts: [
      'Smallest planet in the Solar System',
      'Virtually no atmosphere to retain heat',
      'Surface temperatures swing from -180\u00B0C to 430\u00B0C',
      'A year on Mercury lasts just 88 Earth days'
    ]
  },
  venus: {
    name: 'Venus',
    image: './assets/images/venus.png',
    description: "Venus is the second planet from the Sun and Earth's closest planetary neighbor. A thick, toxic atmosphere of carbon dioxide traps heat in a runaway greenhouse effect, making it the hottest planet in the Solar System.",
    distance: '108.2M km',
    radius: '6,051.8 km',
    mass: '4.87 \u00D7 10\u00B2\u2074 kg',
    density: '5.24 g/cm\u00B3',
    orbitalPeriod: '225 days',
    rotation: '243 days (retrograde)',
    moons: '0',
    gravity: '8.87 m/s\u00B2',
    discoverer: 'Known since antiquity',
    discoveryDate: 'Ancient',
    bodyType: 'Planet',
    volume: '9.28 \u00D7 10\u00B9\u00B9 km\u00B3',
    perihelion: '107.5M km',
    aphelion: '108.9M km',
    eccentricity: '0.0068',
    inclination: '3.39\u00B0',
    axialTilt: '177.4\u00B0',
    temp: '464\u00B0C',
    escape: '10.36 km/s',
    facts: [
      'Hottest planet in the Solar System',
      'Rotates backwards compared to most planets',
      'A day on Venus is longer than its year',
      'Surface pressure is 92 times that of Earth'
    ]
  },
  earth: {
    name: 'Earth',
    image: './assets/images/earth.png',
    description: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 29% of Earth's surface is land consisting of continents and islands. The remaining 71% is covered with water, mostly by oceans, seas, gulfs, and other salt-water bodies, but also by lakes, rivers, and other fresh water, which together constitute the hydrosphere.",
    distance: '149.6M km',
    radius: '6,371 km',
    mass: '5.97 \u00D7 10\u00B2\u2074 kg',
    density: '5.51 g/cm\u00B3',
    orbitalPeriod: '365.25 days',
    rotation: '24 hours',
    moons: '1',
    gravity: '9.8 m/s\u00B2',
    discoverer: 'Known since antiquity',
    discoveryDate: 'Ancient',
    bodyType: 'Planet',
    volume: '1.083 \u00D7 10\u00B9\u00B2 km\u00B3',
    perihelion: '147.1M km',
    aphelion: '152.1M km',
    eccentricity: '0.0167',
    inclination: '0.00\u00B0',
    axialTilt: '23.44\u00B0',
    temp: '15\u00B0C',
    escape: '11.2 km/s',
    facts: [
      'Only known planet with liquid water',
      'Atmosphere contains 78% nitrogen',
      'Magnetic field protects from solar wind',
      'Formed 4.54 billion years ago'
    ]
  },
  mars: {
    name: 'Mars',
    image: './assets/images/mars.png',
    description: 'Mars, the Red Planet, is a dusty, cold desert world with a thin atmosphere. Iron oxide dust gives it a distinctive reddish hue, and evidence points to ancient rivers and lakes once flowing across its surface.',
    distance: '227.9M km',
    radius: '3,389.5 km',
    mass: '6.42 \u00D7 10\u00B2\u00B3 kg',
    density: '3.93 g/cm\u00B3',
    orbitalPeriod: '687 days',
    rotation: '24.6 hours',
    moons: '2',
    gravity: '3.71 m/s\u00B2',
    discoverer: 'Known since antiquity',
    discoveryDate: 'Ancient',
    bodyType: 'Planet',
    volume: '1.63 \u00D7 10\u00B9\u00B9 km\u00B3',
    perihelion: '206.6M km',
    aphelion: '249.2M km',
    eccentricity: '0.0934',
    inclination: '1.85\u00B0',
    axialTilt: '25.19\u00B0',
    temp: '-65\u00B0C',
    escape: '5.03 km/s',
    facts: [
      'Home to Olympus Mons, the tallest volcano in the Solar System',
      'Has two small moons, Phobos and Deimos',
      'Iron oxide dust gives it a reddish color',
      'Evidence suggests liquid water once flowed on its surface'
    ]
  },
  jupiter: {
    name: 'Jupiter',
    image: './assets/images/jupiter.png',
    description: 'Jupiter is the largest planet in the Solar System, a gas giant famous for its Great Red Spot, a storm larger than Earth that has raged for centuries. It has a faint ring system and dozens of known moons.',
    distance: '778.5M km',
    radius: '69,911 km',
    mass: '1.898 \u00D7 10\u00B2\u2077 kg',
    density: '1.33 g/cm\u00B3',
    orbitalPeriod: '11.9 years',
    rotation: '9.9 hours',
    moons: '95',
    gravity: '24.79 m/s\u00B2',
    discoverer: 'Known since antiquity',
    discoveryDate: 'Ancient',
    bodyType: 'Gas Giant',
    volume: '1.431 \u00D7 10\u00B9\u2075 km\u00B3',
    perihelion: '740.6M km',
    aphelion: '816.4M km',
    eccentricity: '0.0489',
    inclination: '1.30\u00B0',
    axialTilt: '3.13\u00B0',
    temp: '-110\u00B0C',
    escape: '59.5 km/s',
    facts: [
      'Largest planet in the Solar System',
      'The Great Red Spot is a storm larger than Earth',
      'Has more confirmed moons than any other planet',
      'A day on Jupiter lasts under 10 hours'
    ]
  },
  saturn: {
    name: 'Saturn',
    image: './assets/images/saturn.png',
    description: "Saturn is famed for its spectacular ring system made of countless particles of ice and rock. It's the least dense planet in the Solar System - so light it could float in a big enough bathtub of water.",
    distance: '1,434M km',
    radius: '58,232 km',
    mass: '5.68 \u00D7 10\u00B2\u2076 kg',
    density: '0.687 g/cm\u00B3',
    orbitalPeriod: '29.5 years',
    rotation: '10.7 hours',
    moons: '146',
    gravity: '10.44 m/s\u00B2',
    discoverer: 'Known since antiquity',
    discoveryDate: 'Ancient',
    bodyType: 'Gas Giant',
    volume: '8.27 \u00D7 10\u00B9\u2074 km\u00B3',
    perihelion: '1,357M km',
    aphelion: '1,507M km',
    eccentricity: '0.0565',
    inclination: '2.49\u00B0',
    axialTilt: '26.73\u00B0',
    temp: '-140\u00B0C',
    escape: '35.5 km/s',
    facts: [
      'Famous for its dazzling ring system',
      'Least dense planet - less dense than water',
      'Has over 140 confirmed moons, including Titan',
      'Winds can reach up to 1,800 km/h'
    ]
  },
  uranus: {
    name: 'Uranus',
    image: './assets/images/uranus.png',
    description: 'Uranus is an ice giant that rotates almost completely on its side, giving it extreme seasons that each last around 20 years. Methane in its atmosphere gives the planet its pale blue-green color.',
    distance: '2,871M km',
    radius: '25,362 km',
    mass: '8.68 \u00D7 10\u00B2\u2075 kg',
    density: '1.27 g/cm\u00B3',
    orbitalPeriod: '84.0 years',
    rotation: '17.2 hours (retrograde)',
    moons: '27',
    gravity: '8.87 m/s\u00B2',
    discoverer: 'William Herschel',
    discoveryDate: 'March 13, 1781',
    bodyType: 'Ice Giant',
    volume: '6.833 \u00D7 10\u00B9\u00B3 km\u00B3',
    perihelion: '2,742M km',
    aphelion: '3,003M km',
    eccentricity: '0.0457',
    inclination: '0.77\u00B0',
    axialTilt: '97.77\u00B0',
    temp: '-195\u00B0C',
    escape: '21.3 km/s',
    facts: [
      'Rotates on its side with a 98\u00B0 axial tilt',
      'First planet discovered using a telescope',
      'Coldest planetary atmosphere in the Solar System',
      'Has 13 known faint rings'
    ]
  },
  neptune: {
    name: 'Neptune',
    image: './assets/images/neptune.png',
    description: 'Neptune is the most distant planet from the Sun, a deep blue ice giant with the fastest winds in the Solar System, reaching speeds of up to 2,100 km/h.',
    distance: '4,495M km',
    radius: '24,622 km',
    mass: '1.024 \u00D7 10\u00B2\u2076 kg',
    density: '1.64 g/cm\u00B3',
    orbitalPeriod: '164.8 years',
    rotation: '16.1 hours',
    moons: '14',
    gravity: '11.15 m/s\u00B2',
    discoverer: 'Johann Galle',
    discoveryDate: 'September 23, 1846',
    bodyType: 'Ice Giant',
    volume: '6.254 \u00D7 10\u00B9\u00B3 km\u00B3',
    perihelion: '4,459M km',
    aphelion: '4,537M km',
    eccentricity: '0.0113',
    inclination: '1.77\u00B0',
    axialTilt: '28.32\u00B0',
    temp: '-200\u00B0C',
    escape: '23.5 km/s',
    facts: [
      'Discovered through mathematical prediction before observation',
      'Fastest winds in the Solar System',
      'Takes 165 years to orbit the Sun once',
      'Its large moon Triton orbits backwards'
    ]
  }
};

/* ========================================
   GENERIC HELPERS
======================================== */

// Prevents HTML/JS injection when text coming from an external API
// (APOD explanations, launch names, mission descriptions, ...) is
// inserted into the page.
function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// Shorthand for setting an element's text content by id, skipping
// silently if the element isn't on the page.
function setText(id, value) {
  var el = document.getElementById(id);
  if (el) {
    el.textContent = value;
  }
}

// Shorthand for setting an element's attribute by id.
function setAttr(id, attr, value) {
  var el = document.getElementById(id);
  if (el) {
    el.setAttribute(attr, value);
  }
}

// Formats a Date object as "Month Day, Year" (e.g. "March 14, 2024").
function formatLongDate(date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// Formats a Date object as "Mon Day, Year" (e.g. "Mar 14, 2024").
function formatShortDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Formats a Date object's UTC time as "HH:MM".
function formatUtcTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

/* ========================================
   SIDEBAR + SECTION NAVIGATION
======================================== */

// Reference to the overlay element shown behind the mobile sidebar.
// Kept as a module-level variable so it can be created once and removed again.
var sidebarOverlay = null;

function openSidebar() {
  var sidebar = document.getElementById('sidebar');
  sidebar.classList.add('sidebar-open');

  if (!sidebarOverlay) {
    sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    sidebarOverlay.addEventListener('click', closeSidebar);
    document.body.appendChild(sidebarOverlay);
  }
}

function closeSidebar() {
  var sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('sidebar-open');

  if (sidebarOverlay) {
    sidebarOverlay.parentNode.removeChild(sidebarOverlay);
    sidebarOverlay = null;
  }
}

// Shows the section matching the clicked nav link and hides the rest,
// then updates the active/inactive styling on every nav link.
function goToSection(clickedLink) {
  var target = clickedLink.dataset.section;
  var sections = document.querySelectorAll('.app-section');
  var navLinks = document.querySelectorAll('.nav-link');
  var i;

  for (i = 0; i < sections.length; i++) {
    sections[i].classList.toggle('hidden', sections[i].dataset.section !== target);
  }

  for (i = 0; i < navLinks.length; i++) {
    var isActive = navLinks[i] === clickedLink;
    navLinks[i].classList.toggle('bg-blue-500/10', isActive);
    navLinks[i].classList.toggle('text-blue-400', isActive);
    navLinks[i].classList.toggle('text-slate-300', !isActive);
  }

  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initNavigation() {
  var sidebarToggle = document.getElementById('sidebar-toggle');
  var navLinks = document.querySelectorAll('.nav-link');
  var i;

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      var sidebar = document.getElementById('sidebar');
      if (sidebar.classList.contains('sidebar-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  for (i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener('click', function (event) {
      event.preventDefault();
      goToSection(this);
    });
  }
}

/* ========================================
   APOD (Today in Space)
   Fetches NASA's Astronomy Picture of the Day for a chosen date and
   fills in the image/video, title, description and metadata fields.
======================================== */

// Keeps the little pill next to the date picker ("Dec 17, 2025") in
// sync with whatever date is currently selected.
function updateDateBadge(dateStr) {
  var dateInput = document.getElementById('apod-date-input');
  var wrapper = dateInput ? dateInput.closest('.date-input-wrapper') : null;
  if (!wrapper) {
    return;
  }

  var formatted = formatShortDate(new Date(dateStr + 'T00:00:00'));
  wrapper.setAttribute('data-date', formatted);

  var span = wrapper.querySelector('span');
  if (span) {
    span.textContent = formatted;
  }
}

function renderApodError() {
  setText('apod-title', 'Unable to load image');
  setText('apod-explanation', "We couldn't reach NASA's APOD service right now. This can happen if the DEMO_KEY rate limit was hit - try again in a moment, or add your own free API key from api.nasa.gov.");
  setText('apod-date', 'Astronomy Picture of the Day - Unavailable');
}

// Fills the "Today in Space" section with the data returned by the APOD API.
function renderApod(data) {
  var container = document.getElementById('apod-image-container');
  var img = document.getElementById('apod-image');
  var formattedDate = formatLongDate(new Date(data.date + 'T00:00:00'));

  setText('apod-date', 'Astronomy Picture of the Day - ' + formattedDate);
  setText('apod-title', data.title || 'Untitled');
  setText('apod-explanation', data.explanation || 'No description available.');
  setText('apod-date-info', data.date);
  setText('apod-media-type', data.media_type === 'video' ? 'Video' : 'Image');
  setText('apod-copyright', data.copyright ? '\u00A9 ' + data.copyright : '\u00A9 Public Domain / NASA');

  var dateDetail = document.getElementById('apod-date-detail');
  if (dateDetail) {
    dateDetail.innerHTML = '<i class="far fa-calendar mr-2"></i>' + escapeHtml(data.date);
  }

  // NASA sometimes publishes a video instead of an image for a given day,
  // so the image element is swapped for an iframe (and back again) as needed.
  if (data.media_type === 'video') {
    if (container) {
      container.innerHTML =
        '<iframe src="' + data.url + '" class="w-full h-full" frameborder="0" ' +
        'allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    }
  } else if (img) {
    img.src = data.hdurl || data.url;
    img.alt = data.title || 'Astronomy Picture of the Day';
    img.classList.remove('opacity-0');
  } else if (container) {
    container.innerHTML =
      '<img id="apod-image" class="w-full h-full object-cover" src="' + (data.hdurl || data.url) + '" ' +
      'alt="' + escapeHtml(data.title || 'Astronomy Picture of the Day') + '" />' +
      '<div class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">' +
        '<div class="absolute bottom-6 left-6 right-6">' +
          '<button class="w-full py-3 bg-white/10 backdrop-blur-md rounded-lg font-semibold hover:bg-white/20 transition-colors">' +
            '<i class="fas fa-expand mr-2"></i>View Full Resolution' +
          '</button>' +
        '</div>' +
      '</div>';
  }
}

// Requests the APOD entry for the given date (format: YYYY-MM-DD).
function fetchApod(dateStr) {
  var loading = document.getElementById('apod-loading');
  if (loading) {
    loading.classList.remove('hidden');
  }
  setText('apod-date', 'Astronomy Picture of the Day - Loading...');

  var url = 'https://api.nasa.gov/planetary/apod?api_key=' + NASA_API_KEY + '&date=' + dateStr;

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('NASA APOD request failed (' + response.status + ')');
      }
      return response.json();
    })
    .then(function (data) {
      renderApod(data);
    })
    .catch(function (err) {
      console.error('APOD fetch error:', err);
      renderApodError();
    })
    .finally(function () {
      if (loading) {
        loading.classList.add('hidden');
      }
    });
}

function initApod() {
  var dateInput = document.getElementById('apod-date-input');
  var loadBtn = document.getElementById('load-date-btn');
  var todayBtn = document.getElementById('today-apod-btn');
  var todayStr = new Date().toISOString().split('T')[0];

  if (dateInput) {
    dateInput.max = todayStr;
    dateInput.value = todayStr;
    dateInput.addEventListener('change', function () {
      updateDateBadge(dateInput.value);
    });
  }

  updateDateBadge(todayStr);
  fetchApod(todayStr);

  if (loadBtn) {
    loadBtn.addEventListener('click', function () {
      if (dateInput && dateInput.value) {
        updateDateBadge(dateInput.value);
        fetchApod(dateInput.value);
      }
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', function () {
      if (dateInput) {
        dateInput.value = todayStr;
      }
      updateDateBadge(todayStr);
      fetchApod(todayStr);
    });
  }
}

/* ========================================
   FAVORITES (starred launches, persisted to localStorage)
======================================== */

function loadFavorites() {
  try {
    var stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    favoriteLaunches = stored ? JSON.parse(stored) : [];
  } catch (e) {
    favoriteLaunches = [];
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteLaunches));
}

function isFavorite(launchId) {
  return favoriteLaunches.indexOf(launchId) !== -1;
}

// Adds/removes a launch id from favoriteLaunches and flips the heart icon.
function toggleFavorite(launchId, iconEl) {
  var index = favoriteLaunches.indexOf(launchId);

  if (index !== -1) {
    favoriteLaunches.splice(index, 1);
    iconEl.classList.remove('fas', 'text-pink-400');
    iconEl.classList.add('far');
  } else {
    favoriteLaunches.push(launchId);
    iconEl.classList.remove('far');
    iconEl.classList.add('fas', 'text-pink-400');
  }

  saveFavorites();
}

// Paints every .favorite-btn inside `scope` according to the saved favorites.
function applyFavoriteState(scope) {
  var buttons = scope.querySelectorAll('.favorite-btn');
  var i;

  for (i = 0; i < buttons.length; i++) {
    var icon = buttons[i].querySelector('i');
    if (icon && isFavorite(buttons[i].dataset.id)) {
      icon.classList.remove('far');
      icon.classList.add('fas', 'text-pink-400');
    }
  }
}

// Wires up click handlers for every .favorite-btn inside `scope`.
function attachFavoriteHandlers(scope) {
  var buttons = scope.querySelectorAll('.favorite-btn');
  var i;

  for (i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      var icon = this.querySelector('i');
      toggleFavorite(this.dataset.id, icon);
    });
  }
}

/* ========================================
   LAUNCHES
   Fetches upcoming launches from the Launch Library 2 API (SpaceDevs)
   and renders the featured launch, the countdown, and the grid of
   remaining launches.
======================================== */

function getStatusStyle(statusName) {
  return STATUS_STYLES[statusName] || 'bg-slate-500/90 text-white';
}

function statusBadgeText(statusName) {
  if (statusName === 'To Be Determined') {
    return 'TBD';
  }
  if (statusName === 'To Be Confirmed') {
    return 'TBC';
  }
  return statusName || 'Unknown';
}

function updateLaunchCounts(count) {
  setText('launches-count', count + ' Launches');
  setText('launches-count-mobile', String(count));
}

// Builds the markup for the big "Featured Launch" hero card.
function buildFeaturedLaunchHtml(launch) {
  var netDate = new Date(launch.net);
  var pad = launch.pad || {};
  var location = pad.location || {};
  var statusName = launch.status ? launch.status.name : 'Unknown';
  var provider = (launch.launch_service_provider && launch.launch_service_provider.name) || 'Unknown provider';
  var vehicle = (launch.rocket && launch.rocket.configuration && launch.rocket.configuration.name) || 'Unknown vehicle';
  var description = (launch.mission && launch.mission.description) || 'Mission details have not been published yet.';
  var imageUrl = (launch.image && (launch.image.image_url || launch.image)) || null;

  var imageHtml = imageUrl
    ? '<img src="' + imageUrl + '" alt="' + escapeHtml(launch.name || 'Launch') + '" class="w-full h-full object-cover min-h-[400px]" />'
    : '<div class="flex items-center justify-center h-full min-h-[400px] bg-slate-800"><i class="fas fa-rocket text-9xl text-slate-700/50"></i></div>';

  return (
    '<div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">' +
      '<div class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>' +
      '<div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">' +
        '<div class="flex flex-col justify-between">' +
          '<div>' +
            '<div class="flex items-center gap-3 mb-4">' +
              '<span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">' +
                '<i class="fas fa-star"></i>Featured Launch' +
              '</span>' +
              '<span class="px-4 py-1.5 rounded-full text-sm font-semibold ' + getStatusStyle(statusName) + '">' +
                statusBadgeText(statusName) +
              '</span>' +
            '</div>' +
            '<h3 class="text-3xl font-bold mb-3 leading-tight">' + escapeHtml(launch.name || 'Untitled Mission') + '</h3>' +
            '<div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">' +
              '<div class="flex items-center gap-2"><i class="fas fa-building"></i><span>' + escapeHtml(provider) + '</span></div>' +
              '<div class="flex items-center gap-2"><i class="fas fa-rocket"></i><span>' + escapeHtml(vehicle) + '</span></div>' +
            '</div>' +
            '<div class="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6">' +
              '<i class="fas fa-clock text-2xl text-blue-400"></i>' +
              '<div>' +
                '<p class="text-2xl font-bold text-blue-400" id="featured-countdown-value">--</p>' +
                '<p class="text-xs text-slate-400" id="featured-countdown-label">Until Launch</p>' +
              '</div>' +
            '</div>' +
            '<div class="grid xl:grid-cols-2 gap-4 mb-6">' +
              '<div class="bg-slate-900/50 rounded-xl p-4">' +
                '<p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-calendar"></i>Launch Date</p>' +
                '<p class="font-semibold">' + formatLongDate(netDate) + '</p>' +
              '</div>' +
              '<div class="bg-slate-900/50 rounded-xl p-4">' +
                '<p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-clock"></i>Launch Time</p>' +
                '<p class="font-semibold">' + formatUtcTime(netDate) + ' UTC</p>' +
              '</div>' +
              '<div class="bg-slate-900/50 rounded-xl p-4">' +
                '<p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-map-marker-alt"></i>Location</p>' +
                '<p class="font-semibold text-sm">' + escapeHtml(location.name || 'TBD') + '</p>' +
              '</div>' +
              '<div class="bg-slate-900/50 rounded-xl p-4">' +
                '<p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-globe"></i>Country</p>' +
                '<p class="font-semibold">' + escapeHtml(location.country_code || 'N/A') + '</p>' +
              '</div>' +
            '</div>' +
            '<p class="text-slate-300 leading-relaxed mb-6">' + escapeHtml(description) + '</p>' +
          '</div>' +
          '<div class="flex flex-col md:flex-row gap-3">' +
            '<a href="' + (launch.url || '#') + '" target="_blank" rel="noopener" class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2">' +
              '<i class="fas fa-info-circle"></i>View Full Details' +
            '</a>' +
            '<div class="icons self-end md:self-center flex gap-2">' +
              '<button class="favorite-btn px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors" data-id="' + launch.id + '"><i class="far fa-heart"></i></button>' +
              '<button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"><i class="fas fa-bell"></i></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="relative">' +
          '<div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">' +
            imageHtml +
            '<div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function renderFeaturedLaunch(launch) {
  var container = document.getElementById('featured-launch');
  if (!container) {
    return;
  }

  container.innerHTML = buildFeaturedLaunchHtml(launch);
  applyFavoriteState(container);
  attachFavoriteHandlers(container);
  startCountdown(new Date(launch.net));
}

// Starts (or restarts) the "Days Until Launch" countdown for the featured launch.
function startCountdown(targetDate) {
  var valueEl = document.getElementById('featured-countdown-value');
  var labelEl = document.getElementById('featured-countdown-label');
  if (!valueEl || !labelEl) {
    return;
  }

  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  function tick() {
    var diffMs = targetDate.getTime() - Date.now();

    if (diffMs <= 0) {
      valueEl.textContent = 'Liftoff!';
      labelEl.textContent = 'Launch window has opened';
      clearInterval(countdownInterval);
      return;
    }

    var totalSeconds = Math.floor(diffMs / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) {
      valueEl.textContent = String(days);
      labelEl.textContent = 'Day' + (days === 1 ? '' : 's') + ' Until Launch';
    } else if (hours > 0) {
      valueEl.textContent = hours + 'h ' + minutes + 'm';
      labelEl.textContent = 'Until Launch';
    } else {
      valueEl.textContent = minutes + 'm';
      labelEl.textContent = 'Until Launch';
    }
  }

  tick();
  countdownInterval = setInterval(tick, 60 * 1000);
}

// Builds the markup for one card in the "All Upcoming Launches" grid.
function buildLaunchCardHtml(launch, iconClass) {
  var netDate = new Date(launch.net);
  var pad = launch.pad || {};
  var location = pad.location || {};
  var statusName = launch.status ? launch.status.name : 'Unknown';
  var provider = (launch.launch_service_provider && launch.launch_service_provider.name) || 'Unknown';
  var vehicle = (launch.rocket && launch.rocket.configuration && launch.rocket.configuration.name) || 'Unknown';

  return (
    '<div class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer">' +
      '<div class="relative h-48 bg-slate-900/50 flex items-center justify-center">' +
        '<i class="fas ' + iconClass + ' text-5xl text-slate-700"></i>' +
        '<div class="absolute top-3 right-3">' +
          '<span class="px-3 py-1 backdrop-blur-sm rounded-full text-xs font-semibold ' + getStatusStyle(statusName) + '">' +
            statusBadgeText(statusName) +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="p-5">' +
        '<div class="mb-3">' +
          '<h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">' + escapeHtml(launch.name || 'Untitled Mission') + '</h4>' +
          '<p class="text-sm text-slate-400 flex items-center gap-2"><i class="fas fa-building text-xs"></i>' + escapeHtml(provider) + '</p>' +
        '</div>' +
        '<div class="space-y-2 mb-4">' +
          '<div class="flex items-center gap-2 text-sm"><i class="fas fa-calendar text-slate-500 w-4"></i><span class="text-slate-300">' + formatShortDate(netDate) + '</span></div>' +
          '<div class="flex items-center gap-2 text-sm"><i class="fas fa-clock text-slate-500 w-4"></i><span class="text-slate-300">' + formatUtcTime(netDate) + ' UTC</span></div>' +
          '<div class="flex items-center gap-2 text-sm"><i class="fas fa-rocket text-slate-500 w-4"></i><span class="text-slate-300">' + escapeHtml(vehicle) + '</span></div>' +
          '<div class="flex items-center gap-2 text-sm"><i class="fas fa-map-marker-alt text-slate-500 w-4"></i><span class="text-slate-300 line-clamp-1">' + escapeHtml(location.name || 'TBD') + '</span></div>' +
        '</div>' +
        '<div class="flex items-center gap-2 pt-4 border-t border-slate-700">' +
          '<a href="' + (launch.url || '#') + '" target="_blank" rel="noopener" class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold text-center">Details</a>' +
          '<button class="favorite-btn px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors" data-id="' + launch.id + '"><i class="far fa-heart"></i></button>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function renderLaunchGrid(launches) {
  var grid = document.getElementById('launches-grid');
  if (!grid) {
    return;
  }

  var html = '';
  var i;

  for (i = 0; i < launches.length; i++) {
    html += buildLaunchCardHtml(launches[i], LAUNCH_ICONS[i % LAUNCH_ICONS.length]);
  }

  grid.innerHTML = html;
  applyFavoriteState(grid);
  attachFavoriteHandlers(grid);
}

// Requests the next batch of upcoming launches and renders every part of the section.
function fetchLaunches() {
  var grid = document.getElementById('launches-grid');
  if (grid) {
    grid.innerHTML =
      '<div class="col-span-full text-center py-12 text-slate-400">' +
        '<i class="fas fa-spinner fa-spin text-3xl mb-3"></i><p>Loading upcoming launches...</p>' +
      '</div>';
  }

  fetch(LAUNCH_API_URL)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Launch Library request failed (' + response.status + ')');
      }
      return response.json();
    })
    .then(function (data) {
      var launches = data.results || [];
      updateLaunchCounts(launches.length);

      if (launches.length === 0) {
        if (grid) {
          grid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-12">No upcoming launches found.</p>';
        }
        return;
      }

      renderFeaturedLaunch(launches[0]);
      renderLaunchGrid(launches.slice(1));
    })
    .catch(function (err) {
      console.error('Launches fetch error:', err);
      if (grid) {
        grid.innerHTML = '<p class="col-span-full text-center text-slate-400 py-12">Couldn\'t load launch data right now. Please try again shortly.</p>';
      }
    });
}

function initLaunches() {
  fetchLaunches();
}

/* ========================================
   PLANETS
   Uses the static PLANETS data above to fill the detail panel when
   a planet card is clicked, and highlights the matching comparison-table row.
======================================== */

// Rebuilds the "Quick Facts" list for the given array of fact strings.
function buildFactsHtml(facts) {
  var html = '';
  var i;

  for (i = 0; i < facts.length; i++) {
    html +=
      '<li class="flex items-start">' +
        '<i class="fas fa-check text-green-400 mt-1 mr-2"></i>' +
        '<span class="text-slate-300">' + escapeHtml(facts[i]) + '</span>' +
      '</li>';
  }

  return html;
}

// Adds a subtle highlight to the row in the comparison table matching the given planet name.
function highlightComparisonRow(planetName) {
  var rows = document.querySelectorAll('#planet-comparison-tbody tr');
  var i;

  for (i = 0; i < rows.length; i++) {
    var nameEl = rows[i].querySelector('span.font-semibold');
    var isMatch = nameEl && nameEl.textContent.trim().toLowerCase() === planetName.toLowerCase();
    rows[i].classList.toggle('bg-blue-500/5', !!isMatch);
  }
}

// Fills the detail panel (image, stats, discovery info, quick facts) for the given planet id.
function selectPlanet(planetId) {
  var planet = PLANETS[planetId];
  if (!planet) {
    return;
  }

  currentPlanetId = planetId;

  setText('planet-detail-name', planet.name);
  setText('planet-detail-description', planet.description);
  setAttr('planet-detail-image', 'src', planet.image);
  setAttr('planet-detail-image', 'alt', planet.name + ' planet render');

  setText('planet-distance', planet.distance);
  setText('planet-radius', planet.radius);
  setText('planet-mass', planet.mass);
  setText('planet-density', planet.density);
  setText('planet-orbital-period', planet.orbitalPeriod);
  setText('planet-rotation', planet.rotation);
  setText('planet-moons', planet.moons);
  setText('planet-gravity', planet.gravity);

  setText('planet-discoverer', planet.discoverer);
  setText('planet-discovery-date', planet.discoveryDate);
  setText('planet-body-type', planet.bodyType);
  setText('planet-volume', planet.volume);

  setText('planet-perihelion', planet.perihelion);
  setText('planet-aphelion', planet.aphelion);
  setText('planet-eccentricity', planet.eccentricity);
  setText('planet-inclination', planet.inclination);
  setText('planet-axial-tilt', planet.axialTilt);
  setText('planet-temp', planet.temp);
  setText('planet-escape', planet.escape);

  var factsList = document.getElementById('planet-facts');
  if (factsList) {
    factsList.innerHTML = buildFactsHtml(planet.facts);
  }

  highlightComparisonRow(planet.name);
}

function initPlanets() {
  var cards = document.querySelectorAll('.planet-card');
  var i;

  for (i = 0; i < cards.length; i++) {
    cards[i].addEventListener('click', function () {
      var clicked = this;
      selectPlanet(clicked.dataset.planetId);

      for (var j = 0; j < cards.length; j++) {
        cards[j].style.borderColor = cards[j] === clicked ? 'var(--planet-color)' : '#334155';
      }
    });
  }

  // Show Earth by default, matching the static markup already in the page.
  selectPlanet('earth');
}

/* ========================================
   INITIALIZATION
======================================== */
document.addEventListener('DOMContentLoaded', function () {
  loadFavorites();
  initNavigation();
  initApod();
  initLaunches();
  initPlanets();
});