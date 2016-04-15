package io.jchat.android.entity;

public class MyMessage {
    private String direction;
    private String type;
    private String date;
    private String content;
    private String sendState;

    public MyMessage(String direction, String type, String date, String content, String sendState) {
        this.direction = direction;
        this.type = type;
        this.date = date;
        this.content = content;
        this.sendState = sendState;
    }
}
