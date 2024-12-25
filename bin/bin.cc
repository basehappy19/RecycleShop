#include <Adafruit_GFX.h>       // Basic graphics library
#include <Adafruit_ST7735.h>    // Library for the ST7735 screen
#include <SPI.h>                // SPI library
#include <WiFi.h>               // WiFi library for ESP32
#include <HTTPClient.h>         // HTTPClient library for POST requests
#include "QRCodeGenerator.h"    // QRCode Generator Library for QR generation
#include <ArduinoJson.h>

// Pin Definitions
#define TFT_CS 5
#define TFT_DC 16
#define TFT_RST 17
#define BUZZER_PIN 25
#define SENSOR_PIN 15
#define BUTTON_PIN 22

// WiFi credentials
const char* ssid = "@2.4G_BaseRedter";
const char* password = "babaj230725510910135312";

// Base API URL
const String BASE_API_URL = "http://192.168.1.2:8000/api/";

// API Paths
const String QR_CODE_API_PATH = "requestLink";
const String CHECK_STUDENT_ID_API_PATH = "requestLink?code=";
const String POINT_API_PATH = "sendBottle";

const String QR_CODE_API_URL = BASE_API_URL + QR_CODE_API_PATH;
const String CHECK_STUDENT_ID_API_URL = BASE_API_URL + CHECK_STUDENT_ID_API_PATH;
const String POINT_API_URL = BASE_API_URL + POINT_API_PATH;

// Global Variables
int counter = 0;
String studentId = "";
String status = "";
String qrLink = "";
String qrCode = ""; 
bool qrFetched = false;
unsigned long lastCheckTime = 0;  
unsigned long qrStartTime = 0;
bool studentIdFound = false;

Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);

// Timing Variables
unsigned long lastIdleTime = 0;
unsigned long lastAdTime = 0;
unsigned long lastBottleTime = 0;
const unsigned long adInterval = 15000;

// Sensor Detection Variables
unsigned long sensorDetectionStartTime = 0;
const unsigned long sensorDetectionTimeout = 30000;
int sensorDetectionCountdown = 0;

// System States
enum State {
  WELCOME,
  SENSOR_DETECTION,
  THANK_YOU,
  SHOW_QR_CODE 
};
State currentState = WELCOME;

void showWelcomeScreen();
void showSensorDetectionScreen();
void showThankYouScreen();
void displayBottleCount();
void drawCenteredText(const char* text, uint16_t color, uint8_t size, int y);
void thankYouSound();
void sendBottleData();
void connectToWiFi();
void fetchQRCodeLink();
void showQRCode(String link);
void checkStudentId();  

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(SENSOR_PIN, INPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  Serial.begin(115200);

  tft.initR(INITR_BLACKTAB);
  tft.setRotation(1);

  showWelcomeScreen();
  connectToWiFi();
}

void loop() {
  int sensorState = digitalRead(SENSOR_PIN);
  int buttonState = digitalRead(BUTTON_PIN);
  
  switch (currentState) {
    case WELCOME:
      if (buttonState == LOW) {
        currentState = SHOW_QR_CODE;
        delay(200); // Debounce button
      }
      break;

    case SHOW_QR_CODE:
      if (!qrFetched) {
        fetchQRCodeLink();
      }
      if (millis() - lastCheckTime > 5000) {
        lastCheckTime = millis();
        checkStudentId();  
      }
      
      if (millis() - qrStartTime > 60000) { 
        currentState = WELCOME;  
      }
      if (studentIdFound) {
        sensorDetectionStartTime = millis();
        sensorDetectionCountdown = 30;
        showSensorDetectionScreen();
        for (int i = 0; i < 3; i++) {
          digitalWrite(BUZZER_PIN, HIGH);
          delay(200);
          digitalWrite(BUZZER_PIN, LOW);
          delay(200);
        }
        lastBottleTime = millis();
        currentState = SENSOR_DETECTION;
      }
      break;

    case SENSOR_DETECTION:
    {
      unsigned long currentTime = millis();
      unsigned long elapsedTime = currentTime - sensorDetectionStartTime;
      sensorDetectionCountdown = max(0UL, 30 - (elapsedTime / 1000));
      showSensorDetectionScreen(); 
      static unsigned long bottleCountDisplayTime = 0;
      if (sensorState == LOW) {
        lastBottleTime = currentTime;
        digitalWrite(BUZZER_PIN, HIGH);
        delay(100);
        digitalWrite(BUZZER_PIN, LOW);
        counter++;
        displayBottleCount();  
        bottleCountDisplayTime = currentTime;
        sensorDetectionStartTime = currentTime;
        sensorDetectionCountdown = 30;
      }

      if (elapsedTime >= sensorDetectionTimeout || buttonState == LOW) {
        currentState = THANK_YOU;
        showThankYouScreen();
        sendBottleData();
      }
    }
    break;


    case THANK_YOU:
      thankYouSound();
      counter = 0;
      qrCode = "";
      qrLink = "";
      studentId = "";
      status = "";
      qrFetched = false;
      showWelcomeScreen();
      currentState = WELCOME;
      break;

  }

  delay(100);
}

void fetchQRCodeLink() {
  qrStartTime = millis();
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(QR_CODE_API_URL);
    http.addHeader("binKey", "f415c278-a09d-426f-96bf-35b00f45b89d");

    String payload = {};
    int httpResponseCode = http.POST(payload);

    if (httpResponseCode == 200) {
      String response = http.getString();

      DynamicJsonDocument doc(1024);

      DeserializationError error = deserializeJson(doc, response);

      if (error) {
        Serial.println("Failed to parse JSON: " + String(error.f_str()));
        currentState = WELCOME;
        return;
      }

      qrCode = doc["code"].as<String>();
      qrLink = doc["link"].as<String>();

      if (qrLink.length() > 0) {
        showQRCode(qrLink);
        qrFetched = true;
      } else {
        Serial.println("Invalid QR link received.");
        currentState = WELCOME;
      }

    } else {
      delay(2000);
      fetchQRCodeLink();
    }

    http.end();
  } else {
    currentState = WELCOME;
  }
}

void checkStudentId() {
  if (WiFi.status() == WL_CONNECTED && qrCode.length() > 0) {
    HTTPClient http;
    String url = CHECK_STUDENT_ID_API_URL + qrCode;
    http.begin(url);

    http.addHeader("binKey", "f415c278-a09d-426f-96bf-35b00f45b89d");

    int httpResponseCode = http.GET();

    if (httpResponseCode == 200) {
      String response = http.getString();

      DynamicJsonDocument doc(1024);

      DeserializationError error = deserializeJson(doc, response);

      if (error) {
        Serial.println("Failed to parse JSON: " + String(error.f_str()));
        return;
      }

      studentId = doc["studentId"].as<String>();
      status = doc["status"].as<String>();

      if (studentId.length() > 0 && status == "STUDENT_ID_RECEIVED") {
        studentIdFound = true; 

      } else {
        studentIdFound = false;
      }

    }

    http.end();
  } else {
    Serial.println("Wi-Fi not connected or QR code is empty.");
  }
}

void showQRCode(String link) {
  tft.fillScreen(ST77XX_WHITE);

  QRCode qrcode;
  uint8_t qrcodeData[qrcode_getBufferSize(6)];

  qrcode_initText(&qrcode, qrcodeData, 6, 0, link.c_str()); 

  int qrSize = qrcode.size;
  int xOffset = (tft.width() - qrSize * 2) / 2; 
  int yOffset = (tft.height() - qrSize * 2) / 2;

  for (int y = 0; y < qrSize; y++) {
    for (int x = 0; x < qrSize; x++) {
      if (qrcode_getModule(&qrcode, x, y)) {
        tft.fillRect(xOffset + x * 2, yOffset + y * 2, 2, 2, ST77XX_BLACK);
      } else {
        tft.fillRect(xOffset + x * 2, yOffset + y * 2, 2, 2, ST77XX_WHITE);
      }
    }
  }
}

void showWelcomeScreen() {
  tft.fillScreen(ST77XX_BLUE);
  drawCenteredText("Welcome!", ST77XX_WHITE, 2, 20);
  drawCenteredText("Press button to start", ST77XX_WHITE, 2, 60);
  lastIdleTime = millis();
}

void showSensorDetectionScreen() {
  tft.fillScreen(ST77XX_RED);
  drawCenteredText("Please insert bottles", ST77XX_WHITE, 2, 40);
  
  String countdownText = String(sensorDetectionCountdown) + " sec";
  drawCenteredText(countdownText.c_str(), ST77XX_WHITE, 1, 80);
}

void showThankYouScreen() {
  tft.fillScreen(ST77XX_YELLOW);
  drawCenteredText("Thank you for recycling!", ST77XX_BLACK, 2, 40);
}

void displayBottleCount() {
  static int lastDisplayedCount = -1;
  if (lastDisplayedCount != counter) {
    tft.fillScreen(ST77XX_GREEN);
    drawCenteredText("Total bottles", ST77XX_BLACK, 2, 20);
    drawCenteredText(String(counter).c_str(), ST77XX_BLACK, 3, 60);
    lastDisplayedCount = counter;
  }
}

void drawCenteredText(const char* text, uint16_t color, uint8_t size, int y) {
  tft.setTextColor(color);
  tft.setTextSize(size);
  int16_t x1, y1;
  uint16_t w, h;
  tft.getTextBounds(text, 0, 0, &x1, &y1, &w, &h);
  tft.setCursor((tft.width() - w) / 2, y);
  tft.print(text);
}

void thankYouSound() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
    delay(200);
  }  
}

void sendBottleData() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(POINT_API_URL); 
    http.addHeader("Content-Type", "application/json");
    http.addHeader("binKey", "f415c278-a09d-426f-96bf-35b00f45b89d");

    String payload = "{";
    payload += "\"studentId\":\"" + studentId + "\",";
    payload += "\"bottle\":" + String(counter) + ",";
    payload += "\"code\":\"" + qrCode + "\"";
    payload += "}";


    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      Serial.println(http.getString());
    } else {
      Serial.printf("Error code: %d\n", httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("Wi-Fi not connected, unable to send data.");
  }
}

void connectToWiFi() {
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}