package com.fakeloc.apk

import android.Manifest
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.os.Build
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "MockLocation")
class MockLocationPlugin : Plugin() {

    @PluginMethod
    fun checkConfig(call: PluginCall) {
        val context = context
        val ret = JSObject()

        // 1. Permiso de ubicación en la app
        val hasLocationPermission = ContextCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        // 2. GPS del dispositivo activado
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        val isGpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)

        // 3. App seleccionada en Opciones de Desarrollador
        var isMockAppSelected = false
        try {
            val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_MOCK_LOCATION,
                    android.os.Process.myUid(),
                    context.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_MOCK_LOCATION,
                    android.os.Process.myUid(),
                    context.packageName
                )
            }
            isMockAppSelected = (mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            isMockAppSelected = false
        }

        // 4. Permiso de notificaciones (Android 13+)
        val hasNotificationPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context, Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }

        ret.put("hasLocationPermission", hasLocationPermission)
        ret.put("isGpsEnabled", isGpsEnabled)
        ret.put("isMockAppSelected", isMockAppSelected)
        ret.put("hasNotificationPermission", hasNotificationPermission)

        call.resolve(ret)
    }

    @PluginMethod
    fun startMocking(call: PluginCall) {
        val lat = call.getDouble("lat")
        val lng = call.getDouble("lng")

        if (lat == null || lng == null) {
            call.reject("Coordenadas inválidas (latitud/longitud no recibidas)")
            return
        }

        val context = context
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager

        // Validación previa antes de intentar arrancar
        if (!locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
            call.reject("El GPS está desactivado. Activa la ubicación en los ajustes del teléfono.")
            return
        }

        try {
            val intent = Intent(context, MockLocationService::class.java).apply {
                putExtra("lat", lat)
                putExtra("lng", lng)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }

            call.resolve()
        } catch (e: SecurityException) {
            call.reject("Falta permiso: Selecciona FakeLocation en 'Aplicación para simular ubicación' en Opciones de Desarrollador.")
        } catch (e: Exception) {
            call.reject("No se pudo iniciar el servicio nativo: ${e.localizedMessage}")
        }
    }

    @PluginMethod
    fun stopMocking(call: PluginCall) {
        try {
            val context = context
            val intent = Intent(context, MockLocationService::class.java)
            context.stopService(intent)
            call.resolve()
        } catch (e: Exception) {
            call.reject("Error al detener el servicio: ${e.localizedMessage}")
        }
    }

    @PluginMethod
    fun openDeveloperSettings(call: PluginCall) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            call.resolve()
        } catch (e: Exception) {
            call.reject("No se pudieron abrir las Opciones de Desarrollador")
        }
    }

    @PluginMethod
    fun openLocationSettings(call: PluginCall) {
        try {
            val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            call.resolve()
        } catch (e: Exception) {
            call.reject("No se pudieron abrir los Ajustes de Ubicación")
        }
    }
}