package com.anonymous.WomenSafetyApp;

import android.app.Service;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.telephony.SmsManager;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class ShakeService extends Service implements SensorEventListener {

    private static final String CHANNEL_ID = "ShakeServiceChannel";
    private SensorManager sensorManager;
    private Sensor accelerometer;
    private boolean shakeDetected = false;

    // Default emergency contact (can be overridden via helper)
    private static final String DEFAULT_NUMBER = "1234567890";
    private static final String DEFAULT_MESSAGE = "🚨 SOS! Shake detected in Women Safety App. I need help.";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        Log.d("ShakeService", "Service created ✅");

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        if (sensorManager != null) {
            accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Women Safety App")
                .setContentText("Shake detection running in background")
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .build();

        startForeground(1, notification);

        if (accelerometer != null) {
            sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_NORMAL);
        }

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
        Log.d("ShakeService", "Service destroyed ❌");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        float x = event.values[0];
        float y = event.values[1];
        float z = event.values[2];

        double acceleration = Math.sqrt(x * x + y * y + z * z);

        if (acceleration > 15 && !shakeDetected) {
            shakeDetected = true;

            Log.d("ShakeService", "🚨 Shake detected!");

            // Show emergency notification
            Notification alert = new NotificationCompat.Builder(this, CHANNEL_ID)
                    .setContentTitle("🚨 Emergency SOS Triggered")
                    .setContentText("Shake detected in background!")
                    .setSmallIcon(android.R.drawable.ic_dialog_alert)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .build();

            NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.notify(2, alert);
            }

            // Send SMS to emergency contact
            try {
                String number = EmergencyContactHelper.getContactNumber();
                String message = EmergencyContactHelper.getContactMessage();

                if (number == null) number = DEFAULT_NUMBER;
                if (message == null) message = DEFAULT_MESSAGE;

                SmsManager smsManager = SmsManager.getDefault();
                smsManager.sendTextMessage(number, null, message, null, null);
                Log.d("ShakeService", "SMS sent to " + number);
            } catch (Exception e) {
                Log.e("ShakeService", "❌ SMS failed", e);
            }

            // Reset shake detection after 5 sec
            new Handler().postDelayed(() -> shakeDetected = false, 5000);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) { }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Shake Detection Service",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
