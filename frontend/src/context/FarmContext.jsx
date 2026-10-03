import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sensorAPI, irrigationAPI, alertAPI, farmAPI, simulationAPI } from '../services/api';

const FarmContext = createContext(null);

export const FarmProvider = ({ children }) => {
  const [farmId, setFarmId] = useState(1);
  const [farm, setFarm] = useState({
    id: 1,
    farm_name: 'Green Valley Smart Farm',
    location: 'Mysuru, Karnataka, India',
    crop_type: 'Tomato (Solanum lycopersicum)',
    area: '2.5 acres',
  });

  const [sensorData, setSensorData] = useState({
    soil_moisture: 55.0,
    temperature: 27.0,
    humidity: 68.0,
    rainfall_detected: false,
    moisture_status: 'Optimal',
    temperature_status: 'Optimal',
    humidity_status: 'Optimal',
    rain_status: 'No Rain',
    moisture_threshold: 35.0,
  });

  const [irrigation, setIrrigation] = useState({
    pump_status: 'OFF',
    auto_irrigation: true,
    decision: 'STANDBY',
    priority: 'LOW',
    reason: 'Soil moisture sufficient.',
    recommended_duration: 0,
    water_saved_liters: 680,
  });

  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [simulation, setSimulation] = useState({
    is_running: true,
    scenario: 'healthy',
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const fetchSensor = useCallback(async () => {
    try {
      const res = await sensorAPI.getLatest(farmId);
      if (res.success && res.data) {
        setSensorData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch sensor:', err);
    }
  }, [farmId]);

  const fetchIrrigation = useCallback(async () => {
    try {
      const res = await irrigationAPI.getStatus(farmId);
      if (res.success && res.data) {
        setIrrigation(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch irrigation:', err);
    }
  }, [farmId]);

  const fetchAlertsCount = useCallback(async () => {
    try {
      const res = await alertAPI.getAlerts(farmId, { unread_only: 'true', limit: 1 });
      if (res.success && res.data) {
        setUnreadAlerts(res.data.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch alerts count:', err);
    }
  }, [farmId]);

  const fetchSimulation = useCallback(async () => {
    try {
      const res = await simulationAPI.getStatus();
      if (res.success && res.data) {
        setSimulation({
          is_running: res.data.is_running,
          scenario: res.data.current_state?.scenario || 'custom',
        });
      }
    } catch (err) {
      console.error('Failed to fetch simulation status:', err);
    }
  }, []);

  const fetchFarm = useCallback(async () => {
    try {
      const res = await farmAPI.getFarm(farmId);
      if (res.success && res.data) {
        setFarm(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch farm info:', err);
    }
  }, [farmId]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchSensor(),
      fetchIrrigation(),
      fetchAlertsCount(),
      fetchSimulation(),
    ]);
  }, [fetchSensor, fetchIrrigation, fetchAlertsCount, fetchSimulation]);

  // Initial and periodic refresh
  useEffect(() => {
    fetchFarm();
    refreshAll();

    const interval = setInterval(() => {
      refreshAll();
    }, 3500);

    return () => clearInterval(interval);
  }, [farmId, refreshAll, fetchFarm]);

  const applyScenario = async (scenarioName) => {
    try {
      const res = await simulationAPI.setScenario(scenarioName);
      if (res.success) {
        setSimulation({
          is_running: true,
          scenario: scenarioName,
        });
        showToast(`Applied Scenario: ${scenarioName.replace('_', ' ').toUpperCase()}`, 'success');
        await refreshAll();
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Failed to apply scenario', 'error');
      return false;
    }
  };

  return (
    <FarmContext.Provider
      value={{
        farmId,
        setFarmId,
        farm,
        sensorData,
        irrigation,
        unreadAlerts,
        simulation,
        toast,
        showToast,
        refreshAll,
        applyScenario,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
