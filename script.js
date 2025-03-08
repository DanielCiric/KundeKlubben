// Simulert "database" med brukere
let users = [
    { phone: "123", password: "", clubs: ["Coop Extra", "Rema 1000", "H&M Club"] }
];

// Simulerte butikkposisjoner (latitude/longitude)
const stores = {
    "Coop Extra": { name: "Coop Extra", lat: 62.7367, lon: 7.1578 }, // Molde, Norge (eksempel)
    "Rema 1000": { name: "Rema 1000", lat: 62.7380, lon: 7.1600 },
    "H&M Club": { name: "H&M Club", lat: 62.7350, lon: 7.1550 },
    "Clas Ohlson": { name: "Clas Ohlson", lat: 62.7370, lon: 7.1590 },
    "Dressmann": { name: "Dressmann", lat: 62.7360, lon: 7.1580 },
    "Power": { name: "Power", lat: 62.7390, lon: 7.1610 },
    "Bik Bok": { name: "Bik Bok", lat: 62.7355, lon: 7.1560 }
};

// Objekt for å lagre brukers preferanser (klikk)
let userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};

// Objekt for å lagre brukers filtervalg
let savedFilters = JSON.parse(localStorage.getItem('savedFilters')) || {};

// Funksjon for å fjerne active-klassen fra alle lenker og legge den til den valgte
function updateActiveLink(activePage) {
    // Finn den aktive siden
    const activePageElement = document.querySelector('.main-page.active, .offers-page.active, .about-page.active');
    if (!activePageElement) return;

    // Finn sidebaren i den aktive siden
    const sidebar = activePageElement.querySelector('.sidebar');
    if (!sidebar) return;

    // Fjern active-klassen fra alle lenker i den aktive sidebaren
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => link.classList.remove('active'));

    // Legg til active-klassen på den korrekte lenken i den aktive sidebaren
    sidebarLinks.forEach(link => {
        if (activePage === 'main' && link.id === 'main-link') {
            link.classList.add('active');
        } else if (activePage === 'offers' && link.id === 'offers-link') {
            link.classList.add('active');
        } else if (activePage === 'about' && link.id === 'about-link') {
            link.classList.add('active');
        }
    });
}

// Funksjon for å spore preferanser når brukeren klikker på et tilbud
function trackPreference(club, theme) {
    userPreferences[club] = (userPreferences[club] || 0) + 1;
    userPreferences[theme] = (userPreferences[theme] || 0) + 1;
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    filterOffers();
}

// Countdown-funksjon
function startCountdowns() {
    const countdowns = document.querySelectorAll('.countdown');
    countdowns.forEach(countdown => {
        const endDate = new Date(countdown.getAttribute('data-end-date'));
        updateCountdown(countdown, endDate);
        setInterval(() => updateCountdown(countdown, endDate), 1000);
    });
}

function updateCountdown(countdown, endDate) {
    const now = new Date();
    const timeLeft = endDate - now;

    if (timeLeft < 0) {
        countdown.textContent = "Tilbudet har utgått";
        countdown.style.color = '#ef233c';
        return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    countdown.textContent = `Rester: ${days}d ${hours}t ${minutes}m ${seconds}s`;
}

// Funksjon for å vise nærliggende butikker
function showNearbyStores() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            const nearbyStores = findNearbyStores(userLat, userLon);
            displayNearbyStores(nearbyStores);
        }, error => {
            alert("Kunne ikke hente posisjonen din: " + error.message);
            displayNearbyStores([]); // Vis mockup-kartet selv om geolokasjon feiler
        });
    } else {
        alert("Geolocation støttes ikke i din nettleser.");
        displayNearbyStores([]); // Vis mockup-kartet selv om geolokasjon ikke støttes
    }
}

function findNearbyStores(userLat, userLon) {
    const nearby = [];
    for (const storeName in stores) {
        const store = stores[storeName];
        const distance = calculateDistance(userLat, userLon, store.lat, store.lon);
        if (distance < 5) { // Vis butikker innen 5 km (kan justeres)
            const storeId = storeName.toLowerCase().replace(/\s+/g, '');
            nearby.push({ name: store.name, distance: distance.toFixed(2), id: storeId });
        }
    }
    return nearby.sort((a, b) => a.distance - b.distance); // Sorter etter avstand
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
}

function displayNearbyStores(stores) {
    const container = document.getElementById('nearby-stores');
    container.style.display = 'block';

    // Skjul alle markører først
    const markers = document.querySelectorAll('.store-marker');
    markers.forEach(marker => {
        marker.style.display = 'none';
    });

    // Fjern eventuelle tidligere meldinger
    const existingMessage = container.querySelector('p.no-stores-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Vis kun markører for butikker som er i nærheten
    if (stores.length === 0) {
        const noStoresMessage = document.createElement('p');
        noStoresMessage.className = 'no-stores-message';
        noStoresMessage.textContent = 'Ingen butikker i nærheten funnet.';
        noStoresMessage.style.position = 'absolute';
        noStoresMessage.style.top = '50%';
        noStoresMessage.style.left = '50%';
        noStoresMessage.style.transform = 'translate(-50%, -50%)';
        noStoresMessage.style.color = '#333';
        noStoresMessage.style.fontSize = '16px';
        container.appendChild(noStoresMessage);
    } else {
        stores.forEach(store => {
            const marker = document.querySelector(`.store-marker[data-store="${store.id}"]`);
            if (marker) {
                marker.style.display = 'block';
            }
        });
    }
}

// Funksjon for å lagre filtre
function saveFilters() {
    const filterName = document.getElementById('filterName').value.trim();
    if (!filterName) {
        alert("Vennligst gi filteret et navn.");
        return;
    }

    const filters = {
        coop: document.getElementById('coop').checked,
        rema: document.getElementById('rema').checked,
        hm: document.getElementById('hm').checked,
        clas: document.getElementById('clas').checked,
        dressmann: document.getElementById('dressmann').checked,
        power: document.getElementById('power').checked,
        bikbok: document.getElementById('bikbok').checked,
        mat: document.getElementById('mat').checked,
        klaer: document.getElementById('klaer').checked,
        elektronikk: document.getElementById('elektronikk').checked
    };

    savedFilters[filterName] = filters;
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
    loadFilterOptions();
    alert(`Filter "${filterName}" er lagret!`);
    document.getElementById('filterName').value = '';
}

// Funksjon for å laste lagrede filtre
function loadFilters() {
    const select = document.getElementById('savedFilters');
    const selectedFilter = select.value;
    if (!selectedFilter) return;

    const filters = savedFilters[selectedFilter];
    document.getElementById('coop').checked = filters.coop || false;
    document.getElementById('rema').checked = filters.rema || false;
    document.getElementById('hm').checked = filters.hm || false;
    document.getElementById('clas').checked = filters.clas || false;
    document.getElementById('dressmann').checked = filters.dressmann || false;
    document.getElementById('power').checked = filters.power || false;
    document.getElementById('bikbok').checked = filters.bikbok || false;
    document.getElementById('mat').checked = filters.mat || false;
    document.getElementById('klaer').checked = filters.klaer || false;
    document.getElementById('elektronikk').checked = filters.elektronikk || false;
    filterOffers();
}

// Funksjon for å laste inn alternativer i dropdown for lagrede filtre
function loadFilterOptions() {
    const select = document.getElementById('savedFilters');
    select.innerHTML = '<option value="">Velg lagret filter</option>';
    for (const name in savedFilters) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    }
}

// Bytt mellom sider
function login() {
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const error = document.getElementById('login-error');
    const user = users.find(u => u.phone === phone && u.password === password);

    if (user) {
        document.querySelector('.login-page').classList.remove('active');
        document.querySelector('.main-page').classList.add('active');
        error.textContent = "";
        updateActiveLink('main');
    } else {
        error.textContent = "Feil telefonnummer eller passord. Prøv igjen eller opprett en bruker.";
    }
}

function showRegister() {
    document.querySelector('.login-page').classList.remove('active');
    document.querySelector('.register-page').classList.add('active');
}

function showLogin() {
    document.querySelector('.register-page').classList.remove('active');
    document.querySelector('.login-page').classList.add('active');
}

function register() {
    const phone = document.getElementById('new-phone').value;
    const password = document.getElementById('new-password').value;
    const error = document.getElementById('register-error');

    if (phone.length < 8) {
        error.textContent = "Telefonnummeret må være minst 8 sifre.";
        return;
    }

    if (users.some(u => u.phone === phone)) {
        error.textContent = "Dette telefonnummeret er allerede registrert.";
        return;
    }

    users.push({ phone: phone, password: password, clubs: ["Coop Extra", "Rema 1000"] });
    error.textContent = "Bruker opprettet! Gå tilbake og logg inn.";
}

// Legger til funksjon for å vise kundeavis-siden
function showOffers() {
    document.querySelector('.main-page').classList.remove('active');
    document.querySelector('.offers-page').classList.add('active');
    document.querySelector('.about-page').classList.remove('active');
    filterOffers();
    startCountdowns();
    loadFilterOptions();
    updateActiveLink('offers');
}

// Legger til funksjon for å gå tilbake til hovedside
function showMain() {
    document.querySelector('.offers-page').classList.remove('active');
    document.querySelector('.about-page').classList.remove('active');
    document.querySelector('.main-page').classList.add('active');
    updateActiveLink('main');
}

// Legger til funksjon for å vise Om Oss-siden
function showAbout() {
    document.querySelector('.main-page').classList.remove('active');
    document.querySelector('.offers-page').classList.remove('active');
    document.querySelector('.about-page').classList.add('active');
    updateActiveLink('about');
}

// Legger til funksjon for å filtrere tilbud
function filterOffers() {
    const offers = Array.from(document.querySelectorAll('#offers-list .offer-item'));
    const coop = document.getElementById('coop').checked;
    const rema = document.getElementById('rema').checked;
    const hm = document.getElementById('hm').checked;
    const clas = document.getElementById('clas').checked;
    const dressmann = document.getElementById('dressmann').checked;
    const power = document.getElementById('power').checked;
    const bikbok = document.getElementById('bikbok').checked;
    const mat = document.getElementById('mat').checked;
    const klaer = document.getElementById('klaer').checked;
    const elektronikk = document.getElementById('elektronikk').checked;

    // Sorter basert på preferanser
    offers.sort((a, b) => {
        const clubA = a.getAttribute('data-club');
        const themeA = a.getAttribute('data-theme');
        const clubB = b.getAttribute('data-club');
        const themeB = b.getAttribute('data-theme');
        const scoreA = (userPreferences[clubA] || 0) + (userPreferences[themeA] || 0);
        const scoreB = (userPreferences[clubB] || 0) + (userPreferences[themeB] || 0);
        return scoreB - scoreA; // Høyere score først
    });

    // Filtrer og vis
    offers.forEach(offer => {
        const club = offer.getAttribute('data-club');
        const theme = offer.getAttribute('data-theme');
        let show = false;

        if (
            (coop && club === 'coop') ||
            (rema && club === 'rema') ||
            (hm && club === 'hm') ||
            (clas && club === 'clas') ||
            (dressmann && club === 'dressmann') ||
            (power && club === 'power') ||
            (bikbok && club === 'bikbok') ||
            (!coop && !rema && !hm && !clas && !dressmann && !power && !bikbok)
        ) {
            if (
                (mat && theme === 'mat') ||
                (klaer && theme === 'klaer') ||
                (elektronikk && theme === 'elektronikk') ||
                (!mat && !klaer && !elektronikk)
            ) {
                show = true;
            }
        }

        offer.style.display = show ? 'block' : 'none';
    });


    

    // Oppdater DOM med sortert rekkefølge
    const list = document.getElementById('offers-list');
    list.innerHTML = '';
    offers.forEach(offer => list.appendChild(offer));
}

// Start countdown når siden lastes
window.onload = () => {
    if (document.querySelector('.offers-page.active')) {
        startCountdowns();
    }
};
