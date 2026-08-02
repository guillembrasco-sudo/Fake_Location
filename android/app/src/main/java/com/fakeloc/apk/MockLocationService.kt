package com.fakelocation.app

import android.app.*
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationManager
import android.os.*
import androidx.core.app.NotificationCompat

class MockLocationService : Service() {

    private var locationManager: LocationManager? = null
    private val providerName = LocationManager.GPS_PROVIDER
    private val handler = Handler(Looper.getMainLooper())
    
    private var latitude = 0.0
    private var longitude = 0.0
    private var isRunning = false

    private val updateTask = object : Runnable {
        override fun run() {
            if (isRunning) {
                injectMockLocation(latitude, longitude)
                handler.postDelayed(this, 1000) // Inyectar cada 1000ms (1 segundo)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        setupTestProvider()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        latitude = intent?.getDoubleExtra("lat", 0.0) ?: 0.0
        longitude = intent?.getDoubleExtra("lng", 0.0) ?: 0.0

        val notification = createNotification()
        startForeground(1001, notification)

        if (!isRunning) {
            isRunning = true
            handler.post(updateTask)
        }

        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "mock_gps_channel",
                "Simulación de GPS Activa",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, "mock_gps_channel")
            .setContentTitle("FakeLocation Activo")
            .setContentText("Simulando GPS en: $latitude, $longitude")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        isRunning = false
        handler.removeCallbacks(updateTask)
        try {
            locationManager?.removeTestProvider(providerName)
        } catch (e: Exception) {
            e.printStackTrace()
        }
        super.onDestroy()
    }

    private val providers = listOf(
        LocationManager.GPS_PROVIDER,
        LocationManager.NETWORK_PROVIDER
    )

    private fun setupTestProvider() {
        for (provider in providers) {
            try {
                locationManager?.removeTestProvider(provider)
            } catch (_: Exception) {}

            try {
                locationManager?.addTestProvider(
                    provider,
                    false, false, false, false, true, true, true,
                    android.location.Provider.POWER_LOW,
                    android.location.Provider.ACCURACY_FINE
                )
                locationManager?.setTestProviderEnabled(provider, true)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun injectMockLocation(lat: Double, lng: Double) {
        for (provider in providers) {
            try {
                val mockLocation = Location(provider).apply {
                    this.latitude = lat
                    this.longitude = lng
                    this.altitude = 3.0
                    this.time = System.currentTimeMillis()
                    this.accuracy = 1.0f
                    this.elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()
                }
                locationManager?.setTestProviderLocation(provider, mockLocation)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}