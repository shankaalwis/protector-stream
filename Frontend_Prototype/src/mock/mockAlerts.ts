export interface Alert {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  timestamp: string;
  source: string;
  status: "active" | "resolved" | "investigating";
}

const alertTypes = [
  "Intrusion Attempt",
  "Malware Detected",
  "DDoS Attack",
  "Unauthorized Access",
  "Data Breach Attempt",
  "Suspicious Activity",
  "Port Scan Detected",
  "Brute Force Attack",
];

const sources = [
  "Firewall",
  "IDS/IPS",
  "Endpoint Security",
  "Network Monitor",
  "SIEM",
  "Anti-Malware",
  "Access Control",
];

// Generate mock alerts
const generateMockAlerts = (): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const hoursAgo = Math.floor(Math.random() * 72);
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    const severities: Array<"critical" | "high" | "medium" | "low"> = [
      "critical",
      "high",
      "medium",
      "low",
    ];
    const statuses: Array<"active" | "resolved" | "investigating"> = [
      "active",
      "resolved",
      "investigating",
    ];

    const severity = severities[Math.floor(Math.random() * severities.length)];
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    alerts.push({
      id: `alert-${i + 1}`,
      type,
      severity,
      message: `${type} detected from IP 192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      timestamp: timestamp.toISOString(),
      source,
      status,
    });
  }

  return alerts.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const mockAlerts = generateMockAlerts();

export const getMockAlerts = async (
  severity?: string,
  status?: string
): Promise<Alert[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockAlerts];

  if (severity) {
    filtered = filtered.filter((alert) => alert.severity === severity);
  }

  if (status) {
    filtered = filtered.filter((alert) => alert.status === status);
  }

  return filtered;
};

export const getMockAlertById = async (id: string): Promise<Alert | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockAlerts.find((alert) => alert.id === id) || null;
};
