let isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
let lastNavigationTarget = null;
let savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '{}');

// Funksjon for å oppdatere navigasjonen basert på innloggingsstatus
function updateNavigation() {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');

    if (isLoggedIn) {
        // Skjul "Logg inn" og "Sign Up", vis "Logg ut"
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'inline-block';
    } else {
        // Vis "Logg inn" og "Sign Up", skjul "Logg ut"
        loginLink.style.display = 'inline-block';
        registerLink.style.display = 'inline-block';
        logoutLink.style.display = 'none';
    }
}

// Funksjon for å vise hjemmesiden
function showHome() {
    document.querySelectorAll('.home-page, .login-page, .main-page, .offers-page, .register-page, .about-page')
        .forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });
    const homePage = document.querySelector('.home-page');
    homePage.classList.add('active');
    homePage.style.display = 'block';
}

// Funksjon for å navigere til en side hvis brukeren er logget inn
function navigateIfLogged(target) {
    // Sjekk innloggingsstatus direkte fra localStorage
    const isUserLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
    if (target === 'about') {
        showAbout();
    } else if (!isUserLoggedIn) {
        lastNavigationTarget = target;
        showLogin();
    } else {
        showPage(target);
    }
}

// Funksjon for å vise innloggingssiden
function showLogin() {
    document.querySelectorAll('.home-page, .login-page, .main-page, .offers-page, .register-page, .about-page')
        .forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });
    const loginPage = document.querySelector('.login-page');
    loginPage.classList.add('active');
    loginPage.style.display = 'block';
}

// Funksjon for å vise registreringssiden
function showRegister() {
    document.querySelectorAll('.home-page, .login-page, .main-page, .offers-page, .register-page, .about-page')
        .forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });
    const registerPage = document.querySelector('.register-page');
    registerPage.classList.add('active');
    registerPage.style.display = 'block';
}

// Funksjon for å vise "Om Oss"-siden
function showAbout() {
    document.querySelectorAll('.home-page, .login-page, .main-page, .offers-page, .register-page, .about-page')
        .forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });
    const aboutPage = document.querySelector('.about-page');
    aboutPage.classList.add('active');
    aboutPage.style.display = 'block';
}

// Funksjon for å håndtere innlogging
function login() {
    const phone = document.getElementById('phone').value;
    if (!/^\d{8}$/.test(phone)) {
        document.getElementById('login-error').textContent = 'Telefonnummer må være 8 sifre!';
        return;
    }
    isLoggedIn = true;
    localStorage.setItem('isLoggedIn', true);
    document.getElementById('login-error').textContent = '';
    updateNavigation();
    if (lastNavigationTarget) {
        showPage(lastNavigationTarget);
        lastNavigationTarget = null;
    } else {
        showHome();
    }
}

// Funksjon for å håndtere registrering
function register() {
    const phone = document.getElementById('new-phone').value;
    if (!/^\d{8}$/.test(phone)) {
        document.getElementById('register-error').textContent = 'Telefonnummer må være 8 sifre!';
        return;
    }
    isLoggedIn = true;
    localStorage.setItem('isLoggedIn', true);
    document.getElementById('register-error').textContent = '';
    updateNavigation();
    showHome();
}

// Funksjon for å logge ut
function logout() {
    isLoggedIn = false;
    localStorage.setItem('isLoggedIn', false);
    updateNavigation();
    showHome();
}

// Funksjon for å vise en spesifikk side
function showPage(target) {
    document.querySelectorAll('.home-page, .login-page, .main-page, .offers-page, .register-page, .about-page')
        .forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });
    const targetPage = document.querySelector(`.${target}-page`);
    targetPage.classList.add('active');
    targetPage.style.display = 'block';
}

// Ny funksjon for å håndtere klikk på hero-boksen
function handleHeroClick() {
    // Sjekk innloggingsstatus direkte fra localStorage
    const isUserLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
    if (isUserLoggedIn) {
        // Hvis brukeren er logget inn, gå til "Dine kundeklubber"-siden
        showPage('main');
    } else {
        // Hvis brukeren ikke er logget inn, gå til innloggingssiden
        showLogin();
    }
}

// Realtime filteroppdatering
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.filter-club, .filter-theme');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selectedClubs = Array.from(document.querySelectorAll('.filter-club:checked')).map(cb => cb.getAttribute('data-club'));
            const selectedThemes = Array.from(document.querySelectorAll('.filter-theme:checked')).map(cb => cb.getAttribute('data-theme'));
            applyFilters(selectedClubs, selectedThemes);
        });
    });

    // Start nedtelling for tilbud
    startCountdowns();
});

// Funksjon for å lagre og bruke filtre
function saveAndApplyFilters() {
    const filterName = document.getElementById('filter-name').value.trim();
    if (!filterName) {
        alert('Vennligst skriv inn et navn for filteret!');
        return;
    }

    const selectedClubs = Array.from(document.querySelectorAll('.filter-club:checked')).map(checkbox => checkbox.getAttribute('data-club'));
    const selectedThemes = Array.from(document.querySelectorAll('.filter-theme:checked')).map(checkbox => checkbox.getAttribute('data-theme'));

    savedFilters[filterName] = { clubs: selectedClubs, themes: selectedThemes };
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));

    updateFilterList();

    applyFilters(selectedClubs, selectedThemes);

    document.getElementById('filter-name').value = '';
}

// Funksjon for å oppdatere listen over lagrede filtre
function updateFilterList() {
    const filterList = document.getElementById('filter-list');
    filterList.innerHTML = '';
    for (let name in savedFilters) {
        const li = document.createElement('li');
        li.textContent = name;
        li.onclick = () => loadAndApplyFilter(name);
        filterList.appendChild(li);
    }
}

// Funksjon for å laste og bruke et lagret filter
function loadAndApplyFilter(name) {
    const filter = savedFilters[name];
    if (filter) {
        document.querySelectorAll('.filter-club').forEach(checkbox => {
            checkbox.checked = filter.clubs.includes(checkbox.getAttribute('data-club'));
        });
        document.querySelectorAll('.filter-theme').forEach(checkbox => {
            checkbox.checked = filter.themes.includes(checkbox.getAttribute('data-theme'));
        });

        applyFilters(filter.clubs, filter.themes);
    }
}

// Funksjon for å bruke filtre på tilbud
function applyFilters(clubs = [], themes = []) {
    const offerItems = document.querySelectorAll('.offer-item');
    offerItems.forEach(item => {
        const club = item.getAttribute('data-club');
        const theme = item.getAttribute('data-theme');

        const clubMatch = clubs.length === 0 || clubs.includes(club);
        const themeMatch = themes.length === 0 || themes.includes(theme);

        if (clubMatch && themeMatch) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Funksjon for å spore brukerpreferanser
function trackPreference(club, theme) {
    console.log(`Bruker klikket på tilbud fra ${club} i kategorien ${theme}`);
}

// Funksjon for å vise nærliggende butikker
function showNearbyStores() {
    const nearbyStores = document.getElementById('nearby-stores');
    nearbyStores.classList.toggle('active');
}

// Funksjon for å starte nedtelling for tilbud
function startCountdowns() {
    const countdownElements = document.querySelectorAll('.countdown');
    countdownElements.forEach(element => {
        const endDate = new Date(element.getAttribute('data-end-date')).getTime();
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = endDate - now;

            if (distance < 0) {
                element.textContent = 'Tilbudet er utløpt';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            element.textContent = `${days}d ${hours}t ${minutes}m ${seconds}s`;
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    });
}




// Initial load
showHome();
updateNavigation();
updateFilterList();
