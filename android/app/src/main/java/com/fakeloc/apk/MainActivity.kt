package com.fakeloc.apk

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Registro del plugin nativo en Kotlin
        registerPlugin(MockLocationPlugin::class.java)
    }
}