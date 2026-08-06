package com.fakeloc.apk

import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun load() {
        super.load()
        registerPlugin(MockLocationPlugin::class.java)
    }
}