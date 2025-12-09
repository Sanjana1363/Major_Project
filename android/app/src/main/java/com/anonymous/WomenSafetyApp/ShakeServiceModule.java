package com.anonymous.WomenSafetyApp;

import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class ShakeServiceModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public ShakeServiceModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @Override
    public String getName() {
        return "ShakeServiceModule";
    }

    @ReactMethod
    public void startService() {
        Intent serviceIntent = new Intent(reactContext, ShakeService.class);
        reactContext.startForegroundService(serviceIntent);
    }

    @ReactMethod
    public void stopService() {
        Intent serviceIntent = new Intent(reactContext, ShakeService.class);
        reactContext.stopService(serviceIntent);
    }

    @ReactMethod
    public void setEmergencyContact(String phoneNumber, String message, Promise promise) {
        EmergencyContactHelper.setContact(phoneNumber, message);
        promise.resolve("Contact set: " + phoneNumber);
    }
}
