export interface NetworkMetrics {
  timestamp: string;
  bandwidth: number;
  latency: number;
  packetLoss: number;
  activeConnections: number;
}

export interface DeviceHealth {
  deviceId: string;
  deviceName: string;
  status: "online" | "offline" | "warning";
  cpu: number;
  memory: number;
  uptime: number;
}

// Generate mock network metrics
const generateNetworkMetrics = (): NetworkMetrics[] => {
  const metrics: NetworkMetrics[] = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    metrics.push({
      timestamp: timestamp.toISOString(),
      bandwidth: Math.floor(Math.random() * 900) + 100,
      latency: Math.floor(Math.random() * 50) + 10,
      packetLoss: Math.random() * 2,
      activeConnections: Math.floor(Math.random() * 500) + 100,
    });
  }

  return metrics.reverse();
};

// Generate mock device health
const generateDeviceHealth = (): DeviceHealth[] => {
  const devices = [
    "Main Router",
    "Switch-01",
    "Switch-02",
    "Firewall",
    "Server-01",
    "Server-02",
    "NAS Storage",
    "Backup Server",
  ];

  return devices.map((name, index) => ({
    deviceId: `device-${index + 1}`,
    deviceName: name,
    status: Math.random() > 0.1 ? "online" : Math.random() > 0.5 ? "warning" : "offline",
    cpu: Math.floor(Math.random() * 80) + 10,
    memory: Math.floor(Math.random() * 70) + 20,
    uptime: Math.floor(Math.random() * 30) + 1,
  }));
};

export const mockNetworkMetrics = generateNetworkMetrics();
export const mockDeviceHealth = generateDeviceHealth();

export const getMockMetrics = async (): Promise<{
  network: NetworkMetrics[];
  devices: DeviceHealth[];
}> => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    network: mockNetworkMetrics,
    devices: mockDeviceHealth,
  };
};
