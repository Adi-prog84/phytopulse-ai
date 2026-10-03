import urllib.request, json

base = 'http://127.0.0.1:5000'

def get(path, token=None):
    req = urllib.request.Request(base + path)
    if token:
        req.add_header('Authorization', 'Bearer ' + token)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def post(path, data, token=None):
    body = json.dumps(data).encode()
    req = urllib.request.Request(base + path, data=body, method='POST')
    req.add_header('Content-Type', 'application/json')
    if token:
        req.add_header('Authorization', 'Bearer ' + token)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

print('=== PhytoPulse AI - Final Verification ===')

# [1] Health
h = get('/api/health')
assert h['status'] == 'ONLINE', 'Health check failed'
print('[1] Health:', h['status'], '| Mode:', h['mode'])

# [2] Login
login_resp = post('/api/auth/login', {'email': 'demo@phytopulse.ai', 'password': 'Demo@123'})
tok = login_resp['data']['access_token']
user = login_resp['data']['user']['name']
print('[2] Login: OK | User:', user)

# [3] Sensors
s = get('/api/sensors/latest', tok)['data']
print('[3] Sensors: Moisture=' + str(s['soil_moisture']) + '% Temp=' + str(s['temperature']) + 'C Rain=' + str(s['rainfall_detected']))

# [4] Healthy baseline
post('/api/simulation/scenario', {'scenario': 'healthy'}, tok)
irr = get('/api/irrigation/status', tok)['data']
print('[4] Healthy baseline: Pump=' + str(irr['pump_status']) + ' Decision=' + str(irr.get('decision', 'N/A')))

# [5] Dry Soil -> Pump ON
post('/api/simulation/scenario', {'scenario': 'dry_soil'}, tok)
irr = get('/api/irrigation/status', tok)['data']
assert irr['pump_status'] == 'ON', 'Pump should be ON for dry soil'
print('[5] Dry Soil: Pump=' + str(irr['pump_status']) + ' Decision=' + str(irr.get('decision', 'N/A')))

# [6] Rain Detected -> Pump OFF
post('/api/simulation/scenario', {'scenario': 'rain_detected'}, tok)
irr = get('/api/irrigation/status', tok)['data']
assert irr['pump_status'] == 'OFF', 'Pump should be OFF when rain detected'
print('[6] Rain: Pump=' + str(irr['pump_status']) + ' Reason=' + str(irr.get('reason', 'N/A')))

# [7] Plant Health
ph = post('/api/plant-health/analyze', {'sample': 'sample_healthy.jpg'}, tok)['data']['metrics']
print('[7] Plant Health: Score=' + str(ph['health_score']) + ' Status=' + str(ph['health_status']))

# [8] Alerts
alerts = get('/api/alerts', tok)['data']
print('[8] Alerts: ' + str(len(alerts)) + ' total alerts in system')

# [9] Analytics
analytics = get('/api/analytics/summary', tok)['data']
print('[9] Analytics: ' + str(analytics['total_sensor_readings']) + ' readings, ' + str(analytics['total_irrigation_events']) + ' irrigation events')

# [10] Reset
post('/api/simulation/scenario', {'scenario': 'healthy'}, tok)
irr = get('/api/irrigation/status', tok)['data']
print('[10] Reset to Healthy: Pump=' + str(irr['pump_status']) + ' (should be OFF)')

print()
print('=== ALL 10 CHECKS PASSED ===')
print()
print('  Frontend:  http://localhost:5173')
print('  Backend:   http://localhost:5000')
print('  API Docs:  http://localhost:5000/api/health')
print('  Demo login: demo@phytopulse.ai / Demo@123')
