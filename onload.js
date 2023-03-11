window.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        var html = document.getElementsByTagName('html');
        html[0].setAttribute('data-bs-theme', 'dark');
    }
    else
    {
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
            if (checkCountry(place))
            {
                var locationsDiv = document.getElementById('locations');
                var cityElement = createLocation();
                locationsDiv.appendChild(cityElement);
                input.value = "";
            }
            else
            {
                window.alert('This location is not within USA');
                input.value = "";
                place = null;
            }
        }
    });
}

function getPayloadData(){
    let locations = Array.from(document.querySelectorAll('#locations input')).map(loc => ({
        name: loc.getAttribute('data-name'),
        id: loc.getAttribute('data-place'),
        type: loc.getAttribute('data-type')
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

function checkCountry(placeObj)
{
    let country = placeObj.address_components.find(a => a.types.includes('country')).short_name;
    return country == 'US';
}

function getPlaceType(placeObj) {
    if (placeObj.address_components.find(a => a.types.includes('locality')) !== undefined)
    {
        return 'city';
    }
    else
    {
        return 'state';
    }
}
/*
city => {
    address_components[0] => ['locality', 'political']
} 
extract place_id, name and decide on location type

state => {
    address_components[0].types => ['administrative_area_level_1', 'political']
    address_components[1].types => ['country', 'political']
}
exctract component[0].short_name

if (address_components[?].types.contains('country')
and this item short_name not equal to US - this is outside USA and should be restricted)

administrative_area_level_1 = state
locality = city
*/

function createLocation() {
    var item = document.createElement('div');
    item.classList.add('input-group');
    var state = document.getElementById('locationInput').value;
    item.innerHTML = '<button class="btn btn-outline-secondary" type="button" onclick="switchLocationType(this)">PU</button>'
        + '<input disabled type="text" class="form-control" data-type="" data-place="'+ place.place_id +'" value="' + state + '">'
        + '<button class="btn btn-outline-secondary" type="button" onclick="removeLocation(this)">Remove</button>';
    return item;
}

function createRegion(option) {
    var locationsDiv = document.getElementById('locations');
    var item = document.createElement('div');
    item.classList.add('input-group');
    item.innerHTML = '<button class="btn btn-outline-secondary" type="button" onclick="switchLocationType(this)">PU</button>'
        + '<input disabled type="text" class="form-control" data-type="region" value="' + option.innerHTML + '">'
        + '<button class="btn btn-outline-secondary" type="button" onclick="removeLocation(this)">Remove</button>';
    var region = item;
    locationsDiv.appendChild(region);
}

function removeLocation(button) {
    button.parentElement.remove();
}

function switchLocationType(button) {
    postData().then((data) => {
        console.log(data);});
    if (button.innerHTML == 'PU') {
        button.innerHTML = 'DEL';
    }
    else {
        button.innerHTML = 'PU';
    }
}
const apiUrl = "https://prod-search-app-bff.awscal2.manheim.com/api/open-search";

const payload =
{
    "vehicleCount": {
        "min": 1,
        "max": null
    },
    "postedWithinHours": null,
    "tagListingsPostedWithin": 2,
    "trailerTypes": [],
    "paymentTypes": [],
    "vehicleTypes": [],
    "operability": "all",
    "minimumPaymentTotal": null,
    "readyToShipWithinDays": null,
    "minimumPricePerMile": null,
    "offset": 0,
    "limit": 50,
    "sortFields": [
        {
            "name": "PICKUP",
            "direction": "ASC"
        },
        {
            "name": "DELIVERYMETROAREA",
            "direction": "ASC"
        }
    ],
    "shipperIds": [],
    "desiredDeliveryDate": null,
    "displayBlockedShippers": false,
    "showPreferredShippersOnly": false,
    "showTaggedOnTop": false,
    "requestType": "Open",
    "locations": []
}

const token = "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjVFMjQ1MkUwRkQ4MTcxMjZGNTQzOENDNEZEM0ZEODc4OENFNjlEN0MiLCJ0eXAiOiJhdCtqd3QiLCJ4NXQiOiJYaVJTNFAyQmNTYjFRNHpFX1RfWWVJem1uWHcifQ.eyJuYmYiOjE2Nzg1NzM4MzcsImV4cCI6MTY3ODU3NzQzNywiaXNzIjoiaHR0cHM6Ly9pZC5jZW50cmFsZGlzcGF0Y2guY29tIiwiYXVkIjpbImxpc3RpbmdzLXNlYXJjaC1hcGkiLCJ1c2VyX21hbmFnZW1lbnRfYmZmIl0sImNsaWVudF9pZCI6InNpbmdsZV9zcGFfcHJvZF9jbGllbnQiLCJzdWIiOiJyYXdpbmMiLCJhdXRoX3RpbWUiOjE2Nzc3Nzc5NjksImlkcCI6ImxvY2FsIiwidXNlcm5hbWUiOiJyYXdpbmMiLCJ0aWVyR3JvdXAiOiJDYXJyaWVyIiwiY29tcGFueU5hbWUiOiJJbnRvIFRoZSBSYXcgSW5jIiwiY3VzdG9tZXJJZCI6ImNhZGM1Y2UzLTNjNDctNDkyZS1hZGU0LTc1OGM0MmFjYmIyYSIsImFjdGl2YXRpb25EYXRlIjoiMjAyMi0wOS0yOSAxMjo1Mjo0MSIsImFjY291bnRTdGF0dXMiOiJBY3RpdmUiLCJpc0FjdGl2ZSI6dHJ1ZSwidXNlcklkIjoiN2U2OTE5OGQtMjVkNi00YzZkLWJmYjgtMmViMTliY2ExOTRlIiwibnVtYmVyT2ZBY2NvdW50cyI6IjEiLCJzY29wZSI6WyJvcGVuaWQiLCJsaXN0aW5nc19zZWFyY2giLCJ1c2VyX21hbmFnZW1lbnRfYmZmIl0sImFtciI6WyJwd2QiXSwicm9sZXMiOlsiT1dORVIiXSwibWFya2V0UGxhY2VJZHMiOlsxMDAwMF19.tYO9osZQuFrc7NqZwYt1sFjvoWf0owoyjbN3OsGe1VX1GK6ERMBTE80b-EnPW3HPmRradRxk71jz4Xil9_1F5y19hX6kBc6lRAoLNHHPOtQmzuCLFXl70NPyUdykfRlKGIRGSqJbBJbtGN73aSujrcmmhPM_RQsND4f3htgTuq_1LarbnflzHhoqlWGrGEdFSfDYm8XKd92Tfcul3NWcMxNHinQG6S777YwtIXqQJbZdnvGSWpwm8ia10noFaAc2txZSGEmBPLIbN4JS_3a0336t12_POWLIdQfhF1qK6Fa_E_Dh0T_pWxZERJ2SUrJVrBgQqV36UhzA9CgzWtMnDA";
// Example POST method implementation:
async function postData() {
    // Default options are marked with *
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authentication': token
      },
      body: JSON.stringify(payload), // body data type must match "Content-Type" header
    });
    return response.json();
  }
  
  /*
  postData("https://example.com/answer", { answer: 42 }).then((data) => {
    console.log(data); // JSON data parsed by `data.json()` call
  });

  fetch("http://example.com/movies.json", {
    mode: "cors"
  })
  .then((response) => response.json())
  .then((data) => console.log(data));
  */