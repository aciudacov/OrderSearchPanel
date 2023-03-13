window.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        let html = document.getElementsByTagName('html');
        html[0].setAttribute('data-bs-theme', 'dark');
    }
    else {
        let html = document.getElementsByTagName('html');
        html[0].setAttribute('data-bs-theme', 'light');
    }
});

window.onload = (_event) => {
    addEventListenerToAddButton();
    addEventListenerToPostRange();
    addEventListenerToShipWithinRange();
};

//tooltip init
const miwe = new bootstrap.Tooltip(document.getElementById('miwe'));
const noea = new bootstrap.Tooltip(document.getElementById('noea'));
const nowe = new bootstrap.Tooltip(document.getElementById('nowe'));
const sout = new bootstrap.Tooltip(document.getElementById('sout'));
const soea = new bootstrap.Tooltip(document.getElementById('soea'));
const sowe = new bootstrap.Tooltip(document.getElementById('sowe'));

const bsOffcanvas = new bootstrap.Offcanvas('#searchFilters');

function addEventListenerToAddButton() {
    let button = document.getElementById('addLocationButton');
    button.addEventListener("click", function () {
        let input = document.getElementById('locationInput');
        if (input.value != '') {
            if (checkCountry(place)) {
                let locationsDiv = document.getElementById('locations');
                let cityElement = createLocation();
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
    let vehicleTypes = Array.from(document.querySelectorAll('#vehicleTypesDropdown input:checked')).map(c => c.value);
    let trailerType = document.getElementById('trailerType').value;
    let vehicleStatus = document.getElementById('vehicleStatus').value;
    let minVehicles = document.getElementById('minVehicles').value;
    let maxVehicles = document.getElementById('maxVehicles').value;
    let readyToShip = document.getElementById('readyToShip').value;
    let paymentType = document.getElementById('paymentType').value;
    let minTotal = document.getElementById('minTotal').value;
    let minPpm = document.getElementById('minPpm').value;
    let token = localStorage.getItem('token');
    return {
        token, locations, postRange, vehicleTypes, trailerType, vehicleStatus, minVehicles, maxVehicles, readyToShip, paymentType, minTotal, minPpm
    }
}

function addEventListenerToShipWithinRange() {
    let input = document.getElementById('readyToShip');
    let text = document.getElementById('readyToShipText');
    input.addEventListener("input", function () {
        if (input.value == -1) {
            text.innerHTML = 'any time';
        }
        else if (input.value == 0) {
            text.innerHTML = 'today';
        }
        else {
            text.innerHTML = input.value + ' day(s)';
        }
    });
}

function addEventListenerToPostRange() {
    let input = document.getElementById('postRange');
    let text = document.getElementById('postRangeText');
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
    let item = document.createElement('div');
    item.classList.add('input-group');
    let state = document.getElementById('locationInput').value;
    item.innerHTML = '<button class="btn btn-outline-secondary" type="button" onclick="switchLocationType(this)">PU</button>'
        + '<input disabled type="text" class="form-control" data-scope="pickup" data-type="' + getPlaceType(place) + '" data-place="' + place.place_id + '" value="' + state + '">'
        + '<button class="btn btn-outline-secondary" type="button" onclick="removeLocation(this)">Remove</button>';
    return item;
}

function createRegion(option) {
    let locationsDiv = document.getElementById('locations');
    let item = document.createElement('div');
    item.classList.add('input-group');
    item.innerHTML = '<button class="btn btn-outline-secondary" type="button" onclick="switchLocationType(this)">PU</button>'
        + '<input disabled type="text" class="form-control" data-scope="pickup" data-type="region" value="' + option.innerHTML + '">'
        + '<button class="btn btn-outline-secondary" type="button" onclick="removeLocation(this)">Remove</button>';
    let region = item;
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

if (localStorage.getItem('token') == null) {
    const tokenModal = new bootstrap.Modal('#tokenModal');
    tokenModal.show();
}

function saveToken() {
    let token = document.getElementById('tokenInput');
    if (token.value != '') {
        localStorage.setItem('token', token.value)
    }
    else {
        window.alert('Token cannot be empty');
    }
}

async function postData(url, payload) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
    });
    if (response.status == 400) {
        const tokenModal = new bootstrap.Modal('#errorModal');
        tokenModal.show();
    }
    else {
        return response.json();
    }
}

function showFilters(){
    bsOffcanvas.show();
}

const apiUrl = "https://2527-105-66-3-14.eu.ngrok.io/platform/search";
async function sendPayload() {
    bsOffcanvas.hide();
    let payload = getPayloadData();
    console.log(payload);
    let spinner = document.getElementById('spinner');
    spinner.classList.remove('d-none');
    try
    {
        await postData(apiUrl, payload).then((data) => {
            console.log(data);
            spinner.classList.add('d-none');
            if (data.count != 0)
            {
                populateResults(data);
            }
            else
            {
                const tokenModal = new bootstrap.Modal('#emptyResultsModal');
                tokenModal.show();
            }
        });
    }
    catch (error)
    {
        console.log(error);
    }
}

function addVehicleStatusBadge(state){
    if (state)
    {
        return '<span class="badge text-bg-danger">INOP</span>';
    }
    else
    {
        return '<span class="badge text-bg-success">OP</span>';
    }
}

function getDateFromUtc(datetime){
    if (datetime)
    {
        const date = new Date(datetime);
        return date.toLocaleDateString("en-US");
    }
    else
    {
        return 'unspecified';
    }
}

function getPickupDate(postedDate, pickupDate){
    const posted = new Date(postedDate);
    const pickup = new Date(pickupDate);
    posted.setHours(0, 0, 0, 0);
    pickup.setHours(0, 0, 0, 0);
    if (posted - pickup == 0 || pickup - posted < 0){
        return 'ASAP';
    }
    else{
        return pickup.toLocaleDateString("en-US");
    }
}

function populateVehiclesModal(vehicles){
    let resultList = '';
    vehicles.forEach(veh =>{
        resultList += `<ul class="list-group">
                            <li class="list-group-item">${veh.make} ${veh.model} ${veh.year}</li>
                            <li class="list-group-item">Dimensions: Unspecified</li>
                            <li class="list-group-item">Weight: Unspecified</li>
                        </ul>`;
    });
    return resultList;
}

function populateAdditionalInfo(info){
    if (info){
        return `<li class="list-group-item">Additional info: ${info}</li>`;
    }
    else{
        return '';   
    }
}

function populateOrderId(orderId){
    if (orderId){
        return `<li class="list-group-item"><h6 class="fw-bold">Order ID: ${orderId}</h6></li>`;
    }
    else{
        return '';   
    }
}

function populateResults(responseObj) {
    let resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';
    responseObj.items.forEach(el => {
        let item = document.createElement('div');
        item.classList.add('card', 'mt-2', 'mb-2');
        item.innerHTML = `<div class="card-body row">
                <div class="col-sm">
                    <ul class="list-group">
                        <li class="list-group-item">
                            <h5 class="fw-bold">$${el.Price.total}</h5>
                            <span>${el.distance}mi</span>/<span>$${(el.Price.total / el.distance).toFixed(2)} per mile</span>
                        </li>
                        <li class="list-group-item">
                            <button type="button" class="btn btn-secondary" data-bs-toggle="modal"
                                data-bs-target="#modal${el.id}">
                                <i class="bi bi-info-circle"></i>
                            </button>
                            Vehicles: ${el.vehicles.length} ${addVehicleStatusBadge(el.hasInOpVehicle)}
                        </li>
                        <li class="list-group-item">Trailer type: ${el.trailerType}</li>
                    </ul>
                </div>
                <div class="col-sm">
                    <ul class="list-group">
                        <li class="list-group-item">
                            <a href="https://www.google.com/maps?q=36.026391,-81.933475&ll=36.026391,-81.933475&z=10"
                                class="btn btn-secondary btn-sm" target="_blank"><i class="bi bi-geo-alt"></i></a>
                            <span>Pickup:</span>
                            <span>${el.origin.city}, ${el.origin.state}, ${el.origin.zip}</span>
                        </li>
                        <li class="list-group-item">
                            <a href="https://www.google.com/maps?q=38.54388,-122.810608&ll=38.54388,-122.810608&z=10"
                                class="btn btn-secondary btn-sm" target="_blank"><i class="bi bi-geo-alt"></i></a>
                            <span>Delivery:</span>
                            <span>${el.destination.city}, ${el.destination.state}, ${el.destination.zip}</span>
                        </li>
                        <li class="list-group-item">
                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#mapModal${el.id}" target="_blank">View route</button>
                        </li>
                        ${populateAdditionalInfo(el.additionalInfo)}
                    </ul>
                </div>
                <div class="col-sm">
                    <ul class="list-group">
                        <li class="list-group-item">${el.shipper.companyName}</li>
                        <li class="list-group-item">Rating ${el.shipper.rating}%</li>
                        <li class="list-group-item"><a href="tel:${el.shipper.phone}">${el.shipper.phone}</a></li>
                        <li class="list-group-item"><a href="mailto:${el.shipper.email}">${el.shipper.email}</a></li>
                        <li class="list-group-item">${el.shipper.hoursOfOperation}</li>
                    </ul>
                </div>
                <div class="col-sm p-1">
                    <ul class="list-group">
                        <li class="list-group-item">Posted: ${getDateFromUtc(el.createdDate)}</li>
                        <li class="list-group-item">Pick up: ${getPickupDate(el.createdDate, el.availableDate)}</li>
                        <li class="list-group-item">Preferred delivery: ${getDateFromUtc(el.desiredDeliveryDate)}</li>
                        <li class="list-group-item">Expires: ${getDateFromUtc(el.expirationDate)}</li>
                        ${populateOrderId(el.shipperOrderId)}
                    </ul>
                </div>
                <!-- Modal -->
                <div class="modal fade" id="modal${el.id}" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5">Vehicle(s) info</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                ${populateVehiclesModal(el.vehicles)}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal fade modal-lg" id="mapModal${el.id}" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5">Route on map</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <iframe width="100%" src="https://www.google.com/maps/embed/v1/directions?key=AIzaSyCKsYTgi8DCDNpplXRcWfp5tLI4GBcHaRg&origin=${el.origin.geoCode.latitude},${el.origin.geoCode.longitude}&destination=${el.destination.geoCode.latitude},${el.destination.geoCode.longitude}&mode=driving" width="600" height="450" style="border:0" loading="lazy" allowfullscreen></iframe>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        resultsContainer.appendChild(item);
    });
}