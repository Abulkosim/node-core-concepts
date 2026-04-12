// composables/useMap.js — the adapter interface your components expect

// Leaflet version
export function useMap(elementRef) {
  let map = null;

  function init(center, zoom) {
    map = L.map(elementRef.value).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  }

  function addMarker(lat, lng, label) {
    L.marker([lat, lng]).addTo(map).bindPopup(label);
  }

  function panTo(lat, lng) {
    map.setView([lat, lng]);
  }

  return { init, addMarker, panTo };
}

// composables/useMap.js — swapped to Yandex, same interface

export function useMap(elementRef) {
  let map = null;

  function init(center, zoom) {
    map = new ymaps.Map(elementRef.value, {
      center: [center[0], center[1]],
      zoom,
    });
  }

  function addMarker(lat, lng, label) {
    const placemark = new ymaps.Placemark([lat, lng], { balloonContent: label });
    map.geoObjects.add(placemark);
  }

  function panTo(lat, lng) {
    map.panTo([lat, lng]);
  }

  return { init, addMarker, panTo };
}