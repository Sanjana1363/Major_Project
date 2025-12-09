package com.anonymous.WomenSafetyApp;

public class EmergencyContactHelper {
    private static String contactNumber = null;
    private static String contactMessage = null;

    public static void setContact(String num, String msg) {
        contactNumber = num;
        contactMessage = msg;
    }

    public static String getContactNumber() {
        return contactNumber;
    }

    public static String getContactMessage() {
        return contactMessage;
    }
}
