var place = null;

function initMap() {
    const input = document.getElementById("locationInput");
    const options = {
        fields: ["place_id", "formatted_address", "name", "address_components"],
        strictBounds: false,
        language: "en",
        types: ["(regions)"],
    };

    const autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.addListener("place_changed", () => {
        place = autocomplete.getPlace();
    });
}

window.initMap = initMap;