window.onload = (event) => {
    addEventListenerToAddButton();
    addEventListenerToPostRange();
};

function addEventListenerToAddButton() {
    var button = document.getElementById('addLocationButton');
    button.addEventListener("click", function () {
        var input = document.getElementById('locationInput');
        if (input.value != '') {
            var locationsDiv = document.getElementById('locations');
            var cityElement = createLocation();
            locationsDiv.appendChild(cityElement);
            input.value = "";
        }
    });
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

function createLocation() {
    var item = document.createElement('div');
    item.classList.add('input-group');
    var state = document.getElementById('locationInput').value;
    item.innerHTML = '<button class="btn btn-outline-secondary" type="button" onclick="switchLocationType(this)">PU</button>'
        + '<input disabled type="text" class="form-control" aria-describedby="button-addon2" value="' + state + '">'
        + '<button class="btn btn-outline-secondary" type="button" onclick="removeLocation(this)">Remove</button>';
    return item;
}

function createRegion(option) {
    var locationsDiv = document.getElementById('locations');
    var item = document.createElement('div');
    item.classList.add('input-group');
    item.innerHTML = '<button class="btn btn-outline-secondary" type="button" onclick="switchLocationType(this)">PU</button>'
        + '<input disabled type="text" class="form-control" aria-describedby="button-addon2" value="' + option.innerHTML + '">'
        + '<button class="btn btn-outline-secondary" type="button" onclick="removeLocation(this)">Remove</button>';
    var region = item;
    locationsDiv.appendChild(region);
}

function removeLocation(button) {
    button.parentElement.remove();
}

function switchLocationType(button) {
    if (button.innerHTML == 'PU') {
        button.innerHTML = 'DEL';
    }
    else {
        button.innerHTML = 'PU';
    }
}