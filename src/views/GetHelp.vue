<template>
  <section class="grid">
    <div class="card">
      <h2 style="margin-top:0">Immediate Help</h2>
      <ul>
        <li><b>Emergency (AU):</b> 000</li>
        <li><b>Lifeline:</b> 13 11 14</li>
        <li><b>Kids Helpline:</b> 1800 55 1800</li>
      </ul>
      <p class="badge">If you or someone you know is in danger, call emergency services.</p>
    </div>

    <div class="card map-card">
      <h2 style="margin-top:0">Find Services & Navigate</h2>

      <div class="controls">
        <div class="row">
          <label class="label">From</label>
          <div id="from-geocoder" class="geocoder"></div>
          <button class="btn" @click="useMyLocation">Use my location</button>
        </div>
        <div class="row">
          <label class="label">To</label>
          <div id="to-geocoder" class="geocoder"></div>
          <button class="btn" :disabled="!fromCoord || !toCoord" @click="route">Route</button>
        </div>
      </div>

      <div id="map" class="map"></div>

   
      <p v-if="trip" class="badge" style="margin-top:.75rem">
        <b>Route:</b> {{ trip.distanceKm.toFixed(2) }} km · {{ Math.round(trip.durationMin) }} min (walking)
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

const token = import.meta.env.VITE_MAPBOX_TOKEN
const melb = [144.9631, -37.8136] 

const mapRef = ref(null)
const fromCoord = ref(null)   
const toCoord = ref(null)     
const fromMarker = ref(null)
const toMarker = ref(null)
const trip = ref(null)      

function ensureMarker(markerRef, coord, color) {
  if (markerRef.value) markerRef.value.remove()
  markerRef.value = new mapboxgl.Marker({ color }).setLngLat(coord).addTo(mapRef.value)
}

async function route () {
  if (!fromCoord.value || !toCoord.value) return

  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/` +
              `${fromCoord.value.join(',')};${toCoord.value.join(',')}` +
              `?geometries=geojson&overview=full&access_token=${token}`

  const res = await fetch(url)
  const json = await res.json()
  const r = json.routes?.[0]
  if (!r) return

  const geo = r.geometry

  const srcId = 'route'
  if (mapRef.value.getSource(srcId)) {
    mapRef.value.getSource(srcId).setData({ type: 'Feature', geometry: geo })
  } else {
    mapRef.value.addSource(srcId, { type: 'geojson', data: { type: 'Feature', geometry: geo } })
    mapRef.value.addLayer({
      id: 'route-line',
      type: 'line',
      source: srcId,
      paint: { 'line-color': '#2563eb', 'line-width': 5, 'line-opacity': 0.85 }
    })
  }

  trip.value = {
    distanceKm: (r.distance || 0) / 1000,
    durationMin: (r.duration || 0) / 60
  }

  const coords = geo.coordinates
  let minX = coords[0][0], minY = coords[0][1], maxX = minX, maxY = minY
  for (const [x, y] of coords) {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }
  mapRef.value.fitBounds([[minX, minY], [maxX, maxY]], { padding: 40 })
}

function useMyLocation () {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition((pos) => {
    fromCoord.value = [pos.coords.longitude, pos.coords.latitude]
    ensureMarker(fromMarker, fromCoord.value, '#10b981') // green
    mapRef.value.flyTo({ center: fromCoord.value, zoom: 14 })
  })
}

onMounted(() => {
  if (!token) {
    console.warn('Missing VITE_MAPBOX_TOKEN')
    return
  }

  mapboxgl.accessToken = token
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: melb,
    zoom: 12
  })
  mapRef.value = map

  map.addControl(new mapboxgl.NavigationControl())
  const geo = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: false
  })
  map.addControl(geo)

  const fromG = new MapboxGeocoder({
    accessToken: token,
    mapboxgl,
    placeholder: 'Search origin…',
    proximity: { longitude: melb[0], latitude: melb[1] }
  })
  document.getElementById('from-geocoder').appendChild(fromG.onAdd(map))
  fromG.on('result', (e) => {
    const c = e.result.center
    fromCoord.value = c
    ensureMarker(fromMarker, c, '#10b981')
  })

  const toG = new MapboxGeocoder({
    accessToken: token,
    mapboxgl,
    placeholder: 'Search destination…',
    proximity: { longitude: melb[0], latitude: melb[1] }
  })
  document.getElementById('to-geocoder').appendChild(toG.onAdd(map))
  toG.on('result', (e) => {
    const c = e.result.center
    toCoord.value = c
    ensureMarker(toMarker, c, '#ef4444') // red
  })

  geo.on('geolocate', (e) => {
    if (!fromCoord.value) {
      fromCoord.value = [e.coords.longitude, e.coords.latitude]
      ensureMarker(fromMarker, fromCoord.value, '#10b981')
    }
  })
})
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
}
.card { padding: 16px; border-radius: 12px; background: #fff; box-shadow: 0 2px 12px rgba(16,24,40,.06); }
.map-card { display: grid; grid-template-rows: auto auto 1fr auto; gap: 8px; }
.controls .row { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
.label { width: 52px; font-weight: 600; }
.geocoder :deep(.mapboxgl-ctrl-geocoder) { min-width: 260px; max-width: 100%; }
.map { width: 100%; height: 440px; border-radius: 10px; overflow: hidden; }
.btn { padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; }
.btn:hover { background: #f8fafc; }
.badge { display: inline-block; padding: 4px 8px; border-radius: 999px; background:#eef2ff; color:#334155; font-size: 12px; }
</style>