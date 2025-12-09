package com.anonymous.WomenSafetyApp

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = ShakeServiceModule.NAME)
class ShakeServiceModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "ShakeServiceModule"
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun startService() {
        val intent = Intent(reactApplicationContext, ShakeService::class.java)
        reactApplicationContext.startService(intent)
    }

    @ReactMethod
    fun stopService() {
        val intent = Intent(reactApplicationContext, ShakeService::class.java)
        reactApplicationContext.stopService(intent)
    }

    @ReactMethod
    fun setEmergencyContact(number: String, message: String) {
        // store contact in SharedPreferences or handle as needed
    }
}
