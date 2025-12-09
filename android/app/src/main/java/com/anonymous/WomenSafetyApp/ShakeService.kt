package com.anonymous.WomenSafetyApp

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log

class ShakeService : Service() {

    override fun onCreate() {
        super.onCreate()
        Log.d("ShakeService", "Service started")
        // TODO: Implement shake detection in foreground/background
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        Log.d("ShakeService", "Service stopped")
    }
}
