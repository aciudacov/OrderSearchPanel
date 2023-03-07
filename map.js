let place = null;
let hasPlace = false;

function initMap() {
    const input = document.getElementById("locationInput");
    const options = {
        fields: ["place_id", "formatted_address", "geometry", "name", "address_components"],
        strictBounds: false,
        language: "en",
        types: ["(regions)"],
    };

    const autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.addListener("place_changed", () => {
        place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
            window.alert("No details available for input: '" + place.name + "'");
            hasPlace = false;
            return;
        }
        hasPlace = true;
    });
}

window.initMap = initMap;