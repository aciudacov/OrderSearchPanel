window.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        var html = document.getElementsByTagName('html');
        html[0].setAttribute('data-bs-theme', 'dark');
    }
    else {
        var html = document.getElementsByTagName('html');
        html[0].setAttribute('data-bs-theme', 'light');
    }
});

window.onload = (event) => {
    addEventListenerToAddButton();
    addEventListenerToPostRange();
};

function addEventListenerToAddButton() {
    var button = document.getElementById('addLocationButton');
    button.addEventListener("click", function () {
        var input = document.getElementById('locationInput');
        if (input.value != '') {
            if (checkCountry(place)) {
                var locationsDiv = document.getElementById('locations');
                var cityElement = createLocation();
                locationsDiv.appendChild(cityElement);
                input.value = "";
            }
            else {
                window.alert('This location is not within USA');
                input.value = "";
                place = null;
            }
        }
    });
}

function getPayloadData() {
    let locations = Array.from(document.querySelectorAll('#locations input')).map(loc => ({
        name: loc.getAttribute('data-name'),
        id: loc.getAttribute('data-place'),
        type: loc.getAttribute('data-type'),
        scope: loc.getAttribute('data-scope'),
    }));
    let postRange = document.getElementById('postRange').value;
    let checkboxValues = Array.from(document.querySelectorAll('#vehicleTypesDropdown input:checked')).map(c => c.value);
    let trailerType = document.getElementById('trailerType').value;
    let vehicleStatus = document.getElementById('vehicleStatus').value;
    let minVehicles = document.getElementById('minVehicles').value;
    let readyToShip = document.getElementById('readyToShip').value;
    let paymentType = document.getElementById('paymentType').value;
    let minTotal = document.getElementById('minTotal').value;
    let minPpm = document.getElementById('minPpm').value;
}

function addEventListenerToPostRange() {
    var input = document.getElementById('postRange');
    var text = document.getElementById('postRangeText');
    input.addEventListener("input", function () {
        if (input.value == 0) {
            text.innerHTML = 'all time';
        }
        else {
            text.innerHTML = input.value + ' hour(s)';
        }
    });
}

function checkCountry(placeObj) {
    let country = placeObj.address_components.find(a => a.types.includes('country')).short_name;
    return country == 'US';
}

function getPlaceType(placeObj) {
    if (placeObj.address_components.find(a => a.types.includes('locality')) !== undefined) {
        return 'city';
    }
    else {
        return 'state';
    }
}

function createLocation() {
    var item = document.createElement('div');
    item.classList.add('input-group');
    var state = document.getElementById('locationInput').value;
    item.innerHTML = '<button class="btn btn-outline-secondary" type="button" onclick="switchLocationType(this)">PU</button>'
        + '<input disabled type="text" class="form-control" data-scope="pickup" data-type="' + getPlaceType(place) + '" data-place="' + place.place_id + '" value="' + state + '">'
        + '<button class="btn btn-outline-secondary" type="button" onclick="removeLocation(this)">Remove</button>';
    return item;
}

function createRegion(option) {
    var locationsDiv = document.getElementById('locations');
    var item = document.createElement('div');
    item.classList.add('input-group');
    item.innerHTML = '<button class="btn btn-outline-secondary" type="button" onclick="switchLocationType(this)">PU</button>'
        + '<input disabled type="text" class="form-control" data-scope="pickup" data-type="region" value="' + option.innerHTML + '">'
        + '<button class="btn btn-outline-secondary" type="button" onclick="removeLocation(this)">Remove</button>';
    var region = item;
    locationsDiv.appendChild(region);
}

function removeLocation(button) {
    button.parentElement.remove();
}

function switchLocationType(button) {
    if (button.innerHTML == 'PU') {
        button.nextSibling.setAttribute('data-scope', 'delivery');
        button.innerHTML = 'DEL';
    }
    else {
        button.nextSibling.setAttribute('data-scope', 'pickup');
        button.innerHTML = 'PU';
    }
}

async function postData() {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authentication': token
        },
        body: JSON.stringify(payload),
    });
    return response.json();
}


if (localStorage.getItem('token') == null) {
    const tokenModal = new bootstrap.Modal('#tokenModal');
    tokenModal.show();
}

function saveToken() {
    var token = document.getElementById('tokenInput');
    if (token.value != '') {
        localStorage.setItem('token', token.value)
    }
    else {
        window.alert('Token cannot be empty');
    }
}

/*
postData("https://example.com/answer", { answer: 42 }).then((data) => {
  console.log(data); // JSON data parsed by `data.json()` call
});
*/