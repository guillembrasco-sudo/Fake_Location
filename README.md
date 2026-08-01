# 📍 FakeLocation - Simulador de Ubicación GPS

Una aplicación móvil híbrida desarrollada con **React, Vite y Capacitor** que permite modificar la ubicación GPS de un dispositivo Android a nivel de sistema operativo en tiempo real, mediante una interfaz moderna basada en **Glassmorphism**.

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)

---

## 🌟 Características

* 🗺️ **Mapa Interactivo en Tiempo Real:** Renderizado fluido mediante OpenStreetMap y Leaflet.
* 🔍 **Buscador de Direcciones Global:** Búsqueda rápida de ciudades, calles y puntos de interés utilizando la API de geocodificación de Nominatim.
* 💎 **Interfaz Glassmorphism:** Paneles flotantes semi-transparentes con efecto de desenfoque (*backdrop-filter*) adaptados para entornos móviles.
* 🛰️ **Falsificación Nativa de GPS:** Inyección de coordenadas simuladas (*Mock Location*) directamente en la API `LocationManager` de Android.
* 🔄 **Soporte en Segundo Plano:** Diseñado para mantener la ubicación activa mientras se ejecutan otras aplicaciones.

---

## 🏗️ Arquitectura del Sistema

La aplicación combina tecnologías web modernas con un puente nativo de Android:

```text
 ┌──────────────────────────────────────────────────────────────┐
 │                  FRONTEND (React + Vite)                     │
 │  - UI de Mapa (Leaflet) + Buscador (Nominatim API)           │
 │  - Diseño UI/UX con Glassmorphism CSS                        │
 └──────────────────────────────┬───────────────────────────────┘
                                │ Capacitor Bridge
 ┌──────────────────────────────▼───────────────────────────────┐
 │               PLUGIN NATIVO (Capacitor Kotlin)               │
 │  - MockLocationPlugin.kt                                     │
 └──────────────────────────────┬───────────────────────────────┘
                                │ Android System APIs
 ┌──────────────────────────────▼───────────────────────────────┐
 │                    ANDROID OS LAYER                          │
 │  - LocationManager (setTestProviderLocation)                 │
 │  - Foreground Service (Persistencia en 2º plano)             │
 └──────────────────────────────────────────────────────────────┘
```

## ❓ Solución de Problemas Frecuentes

* **¿Por qué la ubicación no cambia en otras apps?**
  * Asegúrate de haber seleccionado **FakeLocation** dentro de *Ajustes de desarrollador > Seleccionar aplicación para simular ubicación*.
  * Verifica que la aplicación tenga concedidos los permisos de **Ubicación** en la configuración de Android.
* **¿Por qué Android cancela el servicio al bloquear la pantalla?**
  * Desactiva la optimización de batería de Android para esta aplicación (*Ajustes > Batería > Optimización de batería > FakeLocation > No optimizar*).


---

## ⚠️ Exención de Responsabilidad / Disclaimer

Este software ha sido desarrollado **exclusivamente con fines educativos, de aprendizaje y de pruebas de desarrollo**. El creador de este proyecto no se hace responsable del uso indebido que terceros puedan darle a esta herramienta, incluyendo la vulneración de términos de servicio de aplicaciones de terceros, la alteración de registros de asistencia o la evadir restricciones geográficas.