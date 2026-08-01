package com.fakelocation.app

import android.content.Context
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.SystemClock
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "MockLocation")
class MockLocationPlugin : Plugin() {

    private var locationManager: LocationManager? = null
    private val providerName = LocationManager.GPS_PROVIDER

    @PluginMethod
    fun startMocking(call: PluginCall) {
        val lat = call.getDouble("lat")
        val lng = call.getDouble("lng")

        if (lat == null || lng == null) {
            call.reject("Latitud y longitud son requeridas")
            return
        }

        try {
            locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
            
            // Añadir el proveedor de prueba
            locationManager?.addTestProvider(
                providerName,
                false, false, false, false, true, true, true,
                android.location.Provider.POWER_LOW,
                android.location.Provider.ACCURACY_FINE
            )
            locationManager?.setTestProviderEnabled(providerName, true)

            // Crear la ubicación falsa
            val mockLocation = Location(providerName).apply {
                latitude = lat
                longitude = lng
                altitude = 3.0
                time = System.currentTimeMillis()
                accuracy = 1.0f
                elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()
            }

            // Inyectar en el sistema
            locationManager?.setTestProviderLocation(providerName, mockLocation)

            // TODO: Iniciar ForegroundService aquí para mantener el bucle en 2º plano
            call.resolve()
        } catch (e: SecurityException) {
            call.reject("Permiso denegado. Asegúrate de habilitar esta app en las Opciones de Desarrollador como 'Aplicación de simulación de ubicación'.", e)
        } catch (e: Exception) {
            call.reject("Error al iniciar mock location: ${e.message}", e)
        }
    }

    @PluginMethod
    fun stopMocking(call: PluginCall) {
        try {
            locationManager?.removeTestProvider(providerName)
            call.resolve()
        } catch (e: Exception) {
            call.reject("Error al detener mock location: ${e.message}", e)
        }
    }
}