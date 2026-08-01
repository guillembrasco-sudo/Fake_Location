package com.fakelocation.app

import android.content.Intent
import android.os.Build
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

import android.app.AppOpsManager
import android.content.Context
import android.location.LocationManager
import android.provider.Settings
import com.getcapacitor.JSObject

@CapacitorPlugin(name = "MockLocation")
class MockLocationPlugin : Plugin() {

    @PluginMethod
    fun checkConfig(call: PluginCall) {
        val context = context
        val ret = JSObject()

        // 1. Comprobar si el GPS está activado
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        val isGpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)

        // 2. Comprobar si la app está seleccionada como Mock Location App en Desarrollo
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

        ret.put("isGpsEnabled", isGpsEnabled)
        ret.put("isMockAppSelected", isMockAppSelected)
        call.resolve(ret)
    }

    @PluginMethod
    fun openDeveloperSettings(call: PluginCall) {
        val intent = Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
        call.resolve()
    }

    @PluginMethod
    fun openLocationSettings(call: PluginCall) {
        val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
        call.resolve()
    }

    @PluginMethod
    fun startMocking(call: PluginCall) {
        val lat = call.getDouble("lat")
        val lng = call.getDouble("lng")

        if (lat == null || lng == null) {
            call.reject("Latitud y longitud requeridas")
            return
        }

        val context = context
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
    }

    @PluginMethod
    fun stopMocking(call: PluginCall) {
        val context = context
        val intent = Intent(context, MockLocationService::class.java)
        context.stopService(intent)
        call.resolve()
    }
}