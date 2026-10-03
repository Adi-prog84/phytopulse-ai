import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Radio,
  Wifi,
  BatteryCharging,
  Clock,
  CheckCircle2,
  Terminal,
  Code2,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  Power
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { deviceAPI } from '../services/api';

export default function Devices() {
  const { farm } = useFarm();
  const [devices, setDevices] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory'); // inventory | integration

  useEffect(() => {
    deviceAPI.getDevices(farm.id).then((res) => {
      if (res.success && res.data) {
        setDevices(res.data);
      }
    });
  }, [farm.id]);

  const esp32SampleCode = `#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

#define DHTPIN 18
#define DHTTYPE DHT22
#define SOIL_PIN 34
#define RAIN_PIN 19
#define RELAY_PIN 25

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASS";
const char* serverUrl = "http://YOUR_SERVER_IP:5000/api/devices/sensor-data";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // Off initially (Active LOW)
  dht.begin();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Read Sensors
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    int rawSoil = analogRead(SOIL_PIN);
    float soilMoisture = map(rawSoil, 4095, 1500, 0, 100);
    bool rainDetected = (digitalRead(RAIN_PIN) == LOW);

    // Build JSON Payload
    StaticJsonDocument<256> doc;
    doc["device_id"] = "ESP32-S3-01";
    doc["farm_id"] = 1;
    doc["soil_moisture"] = soilMoisture;
    doc["temperature"] = t;
    doc["humidity"] = h;
    doc["rain_detected"] = rainDetected;

    String jsonString;
    serializeJson(doc, jsonString);

    int httpCode = http.POST(jsonString);
    if (httpCode == 200) {
      String response = http.getString();
      StaticJsonDocument<256> respDoc;
      deserializeJson(respDoc, response);

      // Actuate Relay based on AI Decision Engine response
      const char* pumpCommand = respDoc["data"]["pump_command"];
      if (String(pumpCommand) == "ON") {
        digitalWrite(RELAY_PIN, LOW); // Turn Relay ON
      } else {
        digitalWrite(RELAY_PIN, HIGH); // Turn Relay OFF
      }
    }
    http.end();
  }
  delay(5000); // 5 second sampling loop
}`;

  return (
    <div className="space-y-6">
      {/* Title & Tabs */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Hardware Device Fleet & Node Registry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of physical or virtual field sensor and actuator nodes.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'inventory'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Virtual Device Fleet
          </button>
          <button
            onClick={() => setActiveTab('integration')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'integration'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Future ESP32 Code
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Simulation Disclosure: </strong>
            All nodes below operate as <em>Virtual Device — Simulation Mode</em>. No physical microcontrollers are currently attached.
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/40">
          Ready for Real ESP32
        </span>
      </div>

      {activeTab === 'inventory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {devices.map((dev) => (
            <div
              key={dev.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    ONLINE
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Signal: {dev.signal_strength} dBm
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight">{dev.device_name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{dev.device_type}</p>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="text-slate-300 font-mono text-[10px] truncate" title={dev.spec}>
                    {dev.spec}
                  </div>
                  <div className="text-slate-400 text-[10px] font-mono truncate" title={dev.pin_mapping}>
                    Pins: {dev.pin_mapping}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center space-x-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{dev.battery_level}%</span>
                </div>
                <span className="text-[10px] text-slate-500">Virtual Simulation</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Future Hardware Integration Code View */
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>ESP32-S3 Arduino C++ Firmware (Zero Frontend Rewrite)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Flash this sketch directly to physical ESP32 boards. Data routes straight into the existing Decision Engine.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/30">
              API: POST /api/devices/sensor-data
            </span>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs overflow-x-auto font-mono max-h-96">
            <code>{esp32SampleCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
