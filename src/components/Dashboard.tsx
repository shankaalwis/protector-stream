import { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AnomalyChart from './AnomalyChart';
import AlertDetailCard from './AlertDetailCard';
import { 
  Shield, 
  AlertTriangle, 
  Monitor, 
  Activity, 
  Plus, 
  CheckCircle, 
  XCircle,
  Settings,
  LogOut,
  Zap,
  X,
  ShieldCheck,
  Edit,
  Home,
  Bell,
  Lock,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Send,
  MessageSquare,
  FileText,
  Download,
  Filter,
  Calendar,
  History
} from 'lucide-react';

interface Device {
  id: string;
  device_name: string;
  ip_address: string;
  mac_address: string;
  client_id: string;
  status: 'safe' | 'threat' | 'blocked';
  connected_since: string;
}

interface SecurityAlert {
  id: string;
  device_id: string;
  alert_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  status: 'unresolved' | 'resolved' | 'closed';
  ai_analysis_chat: Array<{role: string; content: string}>;
}

interface NetworkMetrics {
  total_devices: number;
  threats_detected: number;
  data_transferred_mb: number;
  network_activity: Array<{timestamp: string; data_rate: number}>;
}

type ReportType = 'incident-summary' | 'device-inventory' | 'network-health' | 'compliance';
type ReportFormat = 'csv' | 'json';
type ReportDateRange = '24h' | '7d' | '30d' | 'custom';

interface ReportConfig {
  reportType: ReportType;
  format: ReportFormat;
  dateRange: ReportDateRange;
  customStartDate: string;
  customEndDate: string;
  severities: SecurityAlert['severity'][];
  statuses: SecurityAlert['status'][];
  deviceStatuses: Device['status'][];
  includeAIInsights: boolean;
  includeDeviceMetadata: boolean;
  includeNetworkMetrics: boolean;
  includeRecommendations: boolean;
  includeTimeline: boolean;
}

interface ReportTemplate {
  id: ReportType;
  title: string;
  description: string;
  highlights: string[];
}

interface GeneratedReportMeta {
  fileName: string;
  timestamp: Date;
  summary: string;
}

type ReportBooleanKey = 'includeAIInsights' | 'includeDeviceMetadata' | 'includeNetworkMetrics' | 'includeRecommendations' | 'includeTimeline';

type Page = 'overview' | 'alerts' | 'devices' | 'reports' | 'settings';

interface EditDevice {
  id: string;
  device_name: string;
  ip_address: string;
  mac_address: string;
  client_id: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'incident-summary',
    title: 'Incident Summary',
    description: 'Export a detailed view of security alerts with contextual AI insights.',
    highlights: [
      'Filter by severity, status, and timeline requirements',
      'Blend device metadata with AI recommended actions',
      'Ideal for incident retrospectives and SOC handoffs'
    ]
  },
  {
    id: 'device-inventory',
    title: 'Device Inventory',
    description: 'Produce an asset-centric snapshot with risk posture at a glance.',
    highlights: [
      'Segment inventory by security posture and enrollment dates',
      'Surface unresolved alert counts per device automatically',
      'Great for asset lifecycle and onboarding reviews'
    ]
  },
  {
    id: 'network-health',
    title: 'Network Health',
    description: 'Summarize network activity baselines alongside threat observations.',
    highlights: [
      'Overlay traffic metrics with threat detection cadence',
      'Compare rolling windows to identify anomalies quickly',
      'Useful for executive briefings and availability reports'
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance Readiness',
    description: 'Track closure evidence and remediation guidance for audits.',
    highlights: [
      'Focus on resolved and closed incidents only',
      'Capture AI remediation guidance as supporting evidence',
      'Supports recurring governance and risk attestations'
    ]
  }
];

const severityOptions: SecurityAlert['severity'][] = ['critical', 'high', 'medium', 'low'];
const alertStatusOptions: SecurityAlert['status'][] = ['unresolved', 'resolved', 'closed'];
const deviceStatusOptions: Device['status'][] = ['safe', 'threat', 'blocked'];

const templateOverrides: Record<ReportType, Partial<ReportConfig>> = {
  'incident-summary': {},
  'device-inventory': {
    includeAIInsights: false,
    includeRecommendations: false,
    includeTimeline: false,
  },
  'network-health': {
    includeAIInsights: false,
    includeRecommendations: false,
    includeTimeline: true,
    includeNetworkMetrics: true,
  },
  'compliance': {
    severities: ['critical', 'high'] as SecurityAlert['severity'][],
    statuses: ['resolved', 'closed'] as SecurityAlert['status'][],
    includeAIInsights: true,
    includeRecommendations: true,
    includeTimeline: true,
  },
};

const defaultReportConfig: ReportConfig = {
  reportType: 'incident-summary',
  format: 'csv',
  dateRange: '7d',
  customStartDate: '',
  customEndDate: '',
  severities: [...severityOptions],
  statuses: [...alertStatusOptions],
  deviceStatuses: [...deviceStatusOptions],
  includeAIInsights: true,
  includeDeviceMetadata: true,
  includeNetworkMetrics: true,
  includeRecommendations: true,
  includeTimeline: true,
};

const dateRangeOptions: Array<{ id: ReportDateRange; label: string; description: string }> = [
  { id: '24h', label: 'Last 24 Hours', description: 'Focused view for real-time investigations' },
  { id: '7d', label: 'Last 7 Days', description: 'Weekly cadence to correlate alerts and coverage' },
  { id: '30d', label: 'Last 30 Days', description: 'Monthly review across compliance and reporting cycles' },
  { id: 'custom', label: 'Custom Range', description: 'Define a bespoke window for targeted analysis' },
];

const formatOptions: Array<{ id: ReportFormat; label: string; description: string }> = [
  { id: 'csv', label: 'CSV', description: 'Spreadsheet-ready export with column headers' },
  { id: 'json', label: 'JSON', description: 'Structured payload for automation and APIs' },
];

const severityRank: Record<SecurityAlert['severity'], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const booleanOptionConfigs: Array<{ key: ReportBooleanKey; label: string; description: string }> = [
  { key: 'includeAIInsights', label: 'AI Insights', description: 'Attach assistant-generated summaries to applicable alerts.' },
  { key: 'includeRecommendations', label: 'Recommended Actions', description: 'Include remediation steps extracted from AI guidance.' },
  { key: 'includeDeviceMetadata', label: 'Device Metadata', description: 'Add device identifiers, IP addressing, and enrollment context.' },
  { key: 'includeTimeline', label: 'Timeline Columns', description: 'Surface exact timestamps and relative timing for each record.' },
  { key: 'includeNetworkMetrics', label: 'Network Metrics', description: 'Augment rows with network throughput and density calculations.' },
];

export const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState<Page>('overview');
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    total_devices: 0,
    threats_detected: 0,
    data_transferred_mb: 0,
    network_activity: []
  });
  const [newDevice, setNewDevice] = useState({ name: '', ip: '', mac: '', client_id: '' });
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<EditDevice | null>(null);
  const [showEditDevice, setShowEditDevice] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig>(defaultReportConfig);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportHistory, setReportHistory] = useState<GeneratedReportMeta[]>([]);
  
  // New state for expandable AI analysis sections
  const [expandedSections, setExpandedSections] = useState<{[alertId: string]: {causes: boolean; actions: boolean}}>({});
  
  // Alert-specific chat state
  const [alertChatVisible, setAlertChatVisible] = useState<{[alertId: string]: boolean}>({});
  const [alertChatMessages, setAlertChatMessages] = useState<{[alertId: string]: Array<{role: 'user' | 'assistant'; content: string; timestamp: Date}>}>({});
  const [alertChatInputs, setAlertChatInputs] = useState<{[alertId: string]: string}>({});
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const devicesById = useMemo(() => {
    const map = new Map<string, Device>();
    devices.forEach((device) => {
      map.set(device.id, device);
    });
    return map;
  }, [devices]);

  const dateWindow = useMemo(() => {
    const now = new Date();

    if (reportConfig.dateRange === 'custom') {
      if (!reportConfig.customStartDate || !reportConfig.customEndDate) {
        return { start: null as Date | null, end: null as Date | null, label: 'Custom range pending' };
      }

      const rawStart = new Date(reportConfig.customStartDate);
      const rawEnd = new Date(reportConfig.customEndDate);
      const start = rawStart <= rawEnd ? rawStart : rawEnd;
      const end = rawEnd >= rawStart ? rawEnd : rawStart;

      return {
        start,
        end,
        label: `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`
      };
    }

    const start = new Date(now);
    switch (reportConfig.dateRange) {
      case '24h':
        start.setHours(start.getHours() - 24);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      default:
        break;
    }

    const option = dateRangeOptions.find((item) => item.id === reportConfig.dateRange);

    return {
      start,
      end: now,
      label: option ? option.label : 'Custom range'
    };
  }, [reportConfig.dateRange, reportConfig.customStartDate, reportConfig.customEndDate]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (!reportConfig.severities.includes(alert.severity)) {
        return false;
      }

      if (!reportConfig.statuses.includes(alert.status)) {
        return false;
      }

      const device = devicesById.get(alert.device_id);
      if (device && !reportConfig.deviceStatuses.includes(device.status)) {
        return false;
      }

      const alertTimestamp = new Date(alert.timestamp);
      if (dateWindow.start && alertTimestamp < dateWindow.start) {
        return false;
      }

      if (dateWindow.end && alertTimestamp > dateWindow.end) {
        return false;
      }

      return true;
    });
  }, [alerts, reportConfig.severities, reportConfig.statuses, reportConfig.deviceStatuses, devicesById, dateWindow]);

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      if (!reportConfig.deviceStatuses.includes(device.status)) {
        return false;
      }

      if (!device.connected_since) {
        return true;
      }

      const connectedAt = new Date(device.connected_since);
      if (dateWindow.start && connectedAt < dateWindow.start) {
        return false;
      }

      if (dateWindow.end && connectedAt > dateWindow.end) {
        return false;
      }

      return true;
    });
  }, [devices, reportConfig.deviceStatuses, dateWindow]);

  const filteredNetworkActivity = useMemo(() => {
    return metrics.network_activity.filter((activity) => {
      const activityTime = new Date(activity.timestamp);
      if (dateWindow.start && activityTime < dateWindow.start) {
        return false;
      }

      if (dateWindow.end && activityTime > dateWindow.end) {
        return false;
      }

      return true;
    });
  }, [metrics.network_activity, dateWindow]);

  const applyTemplateDefaults = (templateId: ReportType) => {
    setReportConfig((prevConfig) => {
      const overrides = templateOverrides[templateId] ?? {};

      const next: ReportConfig = {
        ...defaultReportConfig,
        reportType: templateId,
        format: overrides.format ?? prevConfig.format,
        dateRange: overrides.dateRange ?? prevConfig.dateRange,
        customStartDate: prevConfig.customStartDate,
        customEndDate: prevConfig.customEndDate,
        severities: overrides.severities ? [...overrides.severities] : [...defaultReportConfig.severities],
        statuses: overrides.statuses ? [...overrides.statuses] : [...defaultReportConfig.statuses],
        deviceStatuses: overrides.deviceStatuses ? [...overrides.deviceStatuses] : [...defaultReportConfig.deviceStatuses],
        includeAIInsights: overrides.includeAIInsights ?? defaultReportConfig.includeAIInsights,
        includeDeviceMetadata: overrides.includeDeviceMetadata ?? defaultReportConfig.includeDeviceMetadata,
        includeNetworkMetrics: overrides.includeNetworkMetrics ?? defaultReportConfig.includeNetworkMetrics,
        includeRecommendations: overrides.includeRecommendations ?? defaultReportConfig.includeRecommendations,
        includeTimeline: overrides.includeTimeline ?? defaultReportConfig.includeTimeline,
      };

      if (overrides.deviceStatuses) {
        next.deviceStatuses = [...overrides.deviceStatuses];
      }

      if (next.dateRange !== 'custom') {
        next.customStartDate = '';
        next.customEndDate = '';
      }

      return next;
    });
  };

  const toggleSeverity = (severity: SecurityAlert['severity']) => {
    setReportConfig((prev) => {
      const exists = prev.severities.includes(severity);
      const severities = exists
        ? prev.severities.filter((value) => value !== severity)
        : [...prev.severities, severity];
      return { ...prev, severities };
    });
  };

  const toggleStatus = (status: SecurityAlert['status']) => {
    setReportConfig((prev) => {
      const exists = prev.statuses.includes(status);
      const statuses = exists
        ? prev.statuses.filter((value) => value !== status)
        : [...prev.statuses, status];
      return { ...prev, statuses };
    });
  };

  const toggleDeviceStatus = (status: Device['status']) => {
    setReportConfig((prev) => {
      const exists = prev.deviceStatuses.includes(status);
      const deviceStatuses = exists
        ? prev.deviceStatuses.filter((value) => value !== status)
        : [...prev.deviceStatuses, status];
      return { ...prev, deviceStatuses };
    });
  };

  const toggleBooleanOption = (key: ReportBooleanKey) => {
    setReportConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateReportFormat = (format: ReportFormat) => {
    setReportConfig((prev) => ({ ...prev, format }));
  };

  const updateReportDateRange = (range: ReportDateRange) => {
    setReportConfig((prev) => {
      const updates = range === 'custom'
        ? {}
        : { customStartDate: '', customEndDate: '' };
      return { ...prev, dateRange: range, ...updates };
    });
  };

  const handleCustomDateChange = (field: 'customStartDate' | 'customEndDate', value: string) => {
    setReportConfig((prev) => ({ ...prev, [field]: value }));
  };

  const getHighestSeverity = (alertList: SecurityAlert[]): SecurityAlert['severity'] | null => {
    if (!alertList.length) {
      return null;
    }

    return alertList.reduce<SecurityAlert['severity'] | null>((current, alert) => {
      if (!current) {
        return alert.severity;
      }

      return severityRank[alert.severity] > severityRank[current] ? alert.severity : current;
    }, null);
  };

  const extractAiInsightSegments = (chat: SecurityAlert['ai_analysis_chat']) => {
    if (!chat || chat.length === 0) {
      return {
        summary: 'No AI insights captured for this alert yet.',
        actions: 'No recommended actions recorded.',
      };
    }

    const assistantMessage = [...chat].reverse().find((message) => message.role === 'assistant');

    if (!assistantMessage || !assistantMessage.content) {
      return {
        summary: 'No AI insights captured for this alert yet.',
        actions: 'No recommended actions recorded.',
      };
    }

    const content = assistantMessage.content.trim();
    const actionsMatch = content.match(/(?:Recommended Actions?|Remediation Steps?):?([\s\S]*)/i);
    const summary = actionsMatch ? content.slice(0, actionsMatch.index).trim() : content;
    const actions = actionsMatch ? actionsMatch[1].trim() : 'No recommended actions recorded.';

    return {
      summary: summary || 'No AI insights captured for this alert yet.',
      actions: actions || 'No recommended actions recorded.',
    };
  };

  const validateReportConfiguration = (): string | null => {
    if (!reportConfig.deviceStatuses.length) {
      return 'Select at least one device status to include.';
    }

    if (['incident-summary', 'compliance'].includes(reportConfig.reportType) && !reportConfig.severities.length) {
      return 'Choose at least one alert severity.';
    }

    if (['incident-summary', 'compliance'].includes(reportConfig.reportType) && !reportConfig.statuses.length) {
      return 'Choose at least one alert status.';
    }

    if (reportConfig.dateRange === 'custom') {
      if (!reportConfig.customStartDate || !reportConfig.customEndDate) {
        return 'Provide both start and end dates for the custom range.';
      }

      const start = new Date(reportConfig.customStartDate);
      const end = new Date(reportConfig.customEndDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return 'One of the provided dates is invalid.';
      }

      if (start > end) {
        return 'The custom range start date must be before the end date.';
      }
    }

    return null;
  };

  const createIncidentRow = (alert: SecurityAlert) => {
    const device = devicesById.get(alert.device_id);
    const detectedAt = new Date(alert.timestamp);
    const insights = extractAiInsightSegments(alert.ai_analysis_chat);

    const row: Record<string, unknown> = {
      alert_id: alert.id,
      alert_type: alert.alert_type,
      severity: alert.severity,
      status: alert.status,
      description: cleanAlertDescription(alert.description),
    };

    if (reportConfig.includeTimeline) {
      row.detected_at = format(detectedAt, 'yyyy-MM-dd HH:mm:ss');
      row.relative_time = formatDistanceToNow(detectedAt, { addSuffix: true });
    }

    if (reportConfig.includeDeviceMetadata) {
      row.device_name = device?.device_name ?? 'Unknown device';
      row.device_status = device?.status ?? 'unavailable';
      row.ip_address = device?.ip_address ?? 'N/A';
      row.mac_address = device?.mac_address ?? 'N/A';
    }

    if (reportConfig.includeAIInsights) {
      row.ai_summary = insights.summary;
    }

    if (reportConfig.includeRecommendations) {
      row.recommended_actions = insights.actions;
    }

    return row;
  };

  const buildIncidentSummaryRows = () => {
    return filteredAlerts.map((alert) => createIncidentRow(alert));
  };

  const buildComplianceRows = () => {
    return filteredAlerts.map((alert) => ({
      ...createIncidentRow(alert),
      compliance_ready: ['resolved', 'closed'].includes(alert.status) ? 'Ready' : 'Pending',
    }));
  };

  const buildDeviceInventoryRows = () => {
    return filteredDevices.map((device) => {
      const relatedAlerts = filteredAlerts.filter((alert) => alert.device_id === device.id);
      const openAlerts = relatedAlerts.filter((alert) => alert.status === 'unresolved').length;
      const highestSeverity = getHighestSeverity(relatedAlerts);

      const row: Record<string, unknown> = {
        device_id: device.id,
        device_name: device.device_name,
        device_status: device.status,
        total_alerts: relatedAlerts.length,
        open_alerts: openAlerts,
      };

      if (highestSeverity) {
        row.highest_alert_severity = highestSeverity;
      }

      if (reportConfig.includeTimeline) {
        row.connected_since = device.connected_since
          ? format(new Date(device.connected_since), 'yyyy-MM-dd')
          : 'Not captured';

        if (relatedAlerts.length) {
          const latestAlert = relatedAlerts.reduce((latest, candidate) => (
            new Date(candidate.timestamp) > new Date(latest.timestamp) ? candidate : latest
          ), relatedAlerts[0]);

          row.last_alert_at = format(new Date(latestAlert.timestamp), 'yyyy-MM-dd HH:mm:ss');
        }
      }

      if (reportConfig.includeDeviceMetadata) {
        row.ip_address = device.ip_address;
        row.mac_address = device.mac_address || 'N/A';
        row.client_id = device.client_id;
      }

      if (reportConfig.includeAIInsights) {
        const aiAlert = [...relatedAlerts].reverse().find((candidate) => candidate.ai_analysis_chat?.length);
        if (aiAlert) {
          const insights = extractAiInsightSegments(aiAlert.ai_analysis_chat);
          row.latest_ai_summary = insights.summary;
        } else {
          row.latest_ai_summary = 'No AI insights captured for this device.';
        }
      }

      return row;
    });
  };

  const buildNetworkHealthRows = () => {
    return filteredNetworkActivity.map((activity) => {
      const sampleTime = new Date(activity.timestamp);
      const correlatedAlerts = filteredAlerts.filter((alert) => {
        const alertTime = new Date(alert.timestamp);
        return Math.abs(alertTime.getTime() - sampleTime.getTime()) <= 60 * 60 * 1000;
      });

      const row: Record<string, unknown> = {
        observed_at: format(sampleTime, 'yyyy-MM-dd HH:mm'),
        data_rate_mb: activity.data_rate,
        correlated_alerts: correlatedAlerts.length,
      };

      const highestSeverity = getHighestSeverity(correlatedAlerts);
      if (highestSeverity) {
        row.highest_correlated_severity = highestSeverity;
      }

      if (reportConfig.includeTimeline) {
        row.relative_time = formatDistanceToNow(sampleTime, { addSuffix: true });
      }

      if (reportConfig.includeNetworkMetrics) {
        const totalAlerts = filteredAlerts.length || 1;
        row.alert_density_pct = Number(((correlatedAlerts.length / totalAlerts) * 100).toFixed(2));
      }

      return row;
    });
  };

  const buildReportRows = () => {
    switch (reportConfig.reportType) {
      case 'incident-summary':
        return buildIncidentSummaryRows();
      case 'device-inventory':
        return buildDeviceInventoryRows();
      case 'network-health':
        return buildNetworkHealthRows();
      case 'compliance':
        return buildComplianceRows();
      default:
        return [] as Record<string, unknown>[];
    }
  };

  const escapeCsvValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      value = value.join('; ');
    } else if (typeof value === 'object') {
      value = JSON.stringify(value);
    }

    const stringValue = String(value).replace(/"/g, '""');
    const requiresQuoting =
      stringValue.includes(',') ||
      stringValue.includes("\"") ||
      stringValue.indexOf('\n') !== -1 ||
      stringValue.indexOf('\r') !== -1;

    return requiresQuoting ? `"${stringValue}"` : stringValue;
  };

  const convertRowsToCsv = (rows: Record<string, unknown>[]) => {
    if (!rows.length) {
      return '';
    }

    const headerSet = new Set<string>();
    rows.forEach((row) => {
      Object.keys(row).forEach((key) => headerSet.add(key));
    });
    const headers = Array.from(headerSet);

    const lines = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
    ];

    return lines.join('\n');
  };

  const createFiltersSnapshot = () => ({
    reportType: reportConfig.reportType,
    format: reportConfig.format,
    dateRange: reportConfig.dateRange,
    start: dateWindow.start ? dateWindow.start.toISOString() : null,
    end: dateWindow.end ? dateWindow.end.toISOString() : null,
    severities: reportConfig.severities,
    statuses: reportConfig.statuses,
    deviceStatuses: reportConfig.deviceStatuses,
    includeAIInsights: reportConfig.includeAIInsights,
    includeDeviceMetadata: reportConfig.includeDeviceMetadata,
    includeNetworkMetrics: reportConfig.includeNetworkMetrics,
    includeRecommendations: reportConfig.includeRecommendations,
    includeTimeline: reportConfig.includeTimeline,
  });

  const buildReportSummary = (rowsCount: number) => ({
    rows: rowsCount,
    alertsMatched: filteredAlerts.length,
    devicesMatched: filteredDevices.length,
    activitySamples: filteredNetworkActivity.length,
    highestSeverity: getHighestSeverity(filteredAlerts),
  });

  const createHistorySummary = (rowsCount: number) => {
    const template = reportTemplates.find((item) => item.id === reportConfig.reportType);
    const label = template?.title ?? reportConfig.reportType;
    return `${label} - ${rowsCount} rows - ${reportConfig.format.toUpperCase()} - ${dateWindow.label}`;
  };

  const handleDownloadReport = () => {
    const validationMessage = validateReportConfiguration();
    if (validationMessage) {
      toast({
        title: 'Update filters before exporting',
        description: validationMessage,
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingReport(true);

    try {
      const rows = buildReportRows();

      if (!rows.length) {
        toast({
          title: 'No records matched',
          description: 'Adjust your filters or time range and try again.',
          variant: 'destructive',
        });
        return;
      }

      const template = reportTemplates.find((item) => item.id === reportConfig.reportType);
      const summary = buildReportSummary(rows.length);
      const filters = createFiltersSnapshot();

      let content = '';
      let mimeType = '';

      if (reportConfig.format === 'json') {
        content = JSON.stringify({
          generatedAt: new Date().toISOString(),
          template,
          filters,
          summary,
          records: rows,
        }, null, 2);
        mimeType = 'application/json';
      } else {
        content = convertRowsToCsv(rows);
        mimeType = 'text/csv;charset=utf-8;';
      }

      if (!content.trim()) {
        toast({
          title: 'Report was empty',
          description: 'No data was available for the selected configuration.',
          variant: 'destructive',
        });
        return;
      }

      const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
      const safeName = (template?.title ?? reportConfig.reportType)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const fileName = `${safeName || 'report'}-${timestamp}.${reportConfig.format}`;

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const historyEntry: GeneratedReportMeta = {
        fileName,
        timestamp: new Date(),
        summary: createHistorySummary(rows.length),
      };

      setReportHistory((prev) => [historyEntry, ...prev].slice(0, 6));

      toast({
        title: 'Report ready',
        description: `Downloaded ${fileName} with ${rows.length} rows.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Report generation failed',
        description: error instanceof Error ? error.message : 'Unexpected error while building report.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDevices();
      fetchAlerts();
      fetchMetrics();
      
      // Set up real-time subscriptions
      const devicesChannel = supabase
        .channel('devices-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'devices'
        }, () => {
          fetchDevices();
        })
        .subscribe();

      const alertsChannel = supabase
        .channel('alerts-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'security_alerts'
        }, () => {
          fetchAlerts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(devicesChannel);
        supabase.removeChannel(alertsChannel);
      };
    }
  }, [user]);

  const fetchDevices = async () => {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setDevices(data as Device[]);
    }
  };

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('security_alerts')
      .select(`
        *,
        devices!inner(device_name, user_id)
      `)
      .order('timestamp', { ascending: false });
    
    if (!error && data) {
      const formattedAlerts = data.map(alert => ({
        ...alert,
        ai_analysis_chat: (alert.ai_analysis_chat as Array<{role: string; content: string}>) || []
      }));
      setAlerts(formattedAlerts as SecurityAlert[]);
    }
  };

  const fetchMetrics = async () => {
    const { data, error } = await supabase
      .from('network_metrics')
      .select('*')
      .single();
    
    if (!error && data) {
      setMetrics({
        total_devices: data.total_devices || 0,
        threats_detected: data.threats_detected || 0,
        data_transferred_mb: data.data_transferred_mb || 0,
        network_activity: (data.network_activity as Array<{timestamp: string; data_rate: number}>) || []
      });
    }
  };

  const addDevice = async () => {
    if (!newDevice.name || !newDevice.ip) {
      toast({
        title: "Error",
        description: "Please fill in device name and IP address",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('devices')
      .insert({
        user_id: user?.id,
        device_name: newDevice.name,
        ip_address: newDevice.ip,
        mac_address: newDevice.mac,
        client_id: newDevice.client_id || `${newDevice.name}-${Date.now()}`
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Device added successfully"
      });
      setNewDevice({ name: '', ip: '', mac: '', client_id: '' });
      setShowAddDevice(false);
    }
  };

  const updateDeviceStatus = async (deviceId: string, status: string) => {
    const { error } = await supabase
      .from('devices')
      .update({ status })
      .eq('id', deviceId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Device ${status} successfully`
      });
    }
  };

  const getAIAnalysis = async (alertId: string) => {
    console.log('AI Analysis button clicked for alert:', alertId);
    console.log('Current alertChatVisible state:', alertChatVisible);
    
    // Toggle the chat visibility for this specific alert
    const wasVisible = alertChatVisible[alertId];
    setAlertChatVisible(prev => {
      const newState = {
        ...prev,
        [alertId]: !prev[alertId]
      };
      console.log('New alertChatVisible state:', newState);
      return newState;
    });

    // If chat is becoming visible and we haven't called AI analysis yet, call it
    if (!wasVisible) {
      const currentAlert = alerts.find(alert => alert.id === alertId);
      
      // Only call AI analysis if we don't have analysis data yet
      if (!currentAlert?.ai_analysis_chat || currentAlert.ai_analysis_chat.length === 0) {
        try {
          console.log('Calling AI analysis function...');
          const response = await supabase.functions.invoke('ai-analysis', {
            body: { alertId }
          });
          
          if (response.error) {
            throw new Error(response.error.message);
          }
          
          // Refresh alerts data to get the updated AI analysis
          await fetchAlerts();
          
          toast({
            title: "AI Analysis",
            description: "Analysis completed and saved"
          });
        } catch (error) {
          console.error('AI Analysis error:', error);
          toast({
            title: "Error",
            description: "Failed to get AI analysis",
            variant: "destructive"
          });
        }
      }
    }
  };

  const closeAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('security_alerts')
      .update({ status: 'closed' })
      .eq('id', alertId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Update local state to remove the closed alert
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
      toast({
        title: "Success",
        description: "Alert closed successfully"
      });
    }
  };

  // Alert-specific chat functionality
  const sendAlertMessage = async (alertId: string) => {
    const currentInput = alertChatInputs[alertId]?.trim();
    if (!currentInput) return;
    
    const userMessage = {
      role: 'user' as const,
      content: currentInput,
      timestamp: new Date()
    };
    
    // Add user message
    setAlertChatMessages(prev => ({
      ...prev,
      [alertId]: [...(prev[alertId] || []), userMessage]
    }));
    
    // Clear input
    setAlertChatInputs(prev => ({
      ...prev,
      [alertId]: ''
    }));
    
    try {
      // Call AI analysis function with user query for conversational mode
      console.log('Calling AI analysis function with user query:', currentInput);
      const response = await supabase.functions.invoke('ai-analysis', {
        body: { 
          alertId,
          userQuery: currentInput 
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      // Add AI response
      const aiMessage = {
        role: 'assistant' as const,
        content: response.data?.analysis || 'Unable to generate response at this time.',
        timestamp: new Date()
      };
      
      setAlertChatMessages(prev => ({
        ...prev,
        [alertId]: [...(prev[alertId] || []), aiMessage]
      }));

      // Refresh alerts data to get the updated conversation history
      await fetchAlerts();
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to the AI assistant."
      });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date()
      };
      
      setAlertChatMessages(prev => ({
        ...prev,
        [alertId]: [...(prev[alertId] || []), errorMessage]
      }));
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAlertKeyPress = (e: React.KeyboardEvent, alertId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAlertMessage(alertId);
    }
  };

  const updateDevice = async () => {
    if (!editingDevice || !editingDevice.device_name || !editingDevice.ip_address) {
      toast({
        title: "Error",
        description: "Please fill in device name and IP address",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('devices')
      .update({
        device_name: editingDevice.device_name,
        ip_address: editingDevice.ip_address,
        mac_address: editingDevice.mac_address,
        client_id: editingDevice.client_id
      })
      .eq('id', editingDevice.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Device updated successfully"
      });
      setEditingDevice(null);
      setShowEditDevice(false);
    }
  };

  const openEditDevice = (device: Device) => {
    setEditingDevice({
      id: device.id,
      device_name: device.device_name,
      ip_address: device.ip_address,
      mac_address: device.mac_address || '',
      client_id: device.client_id
    });
    setShowEditDevice(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'status-triggered';
      case 'high': return 'status-triggered';
      case 'medium': return 'status-threat';
      case 'low': return 'status-safe';
      default: return 'status-badge';
    }
  };

  const cleanAlertDescription = (description: string) => {
    // Remove any mention of "Splunk" or similar detection system references
    return description
      .replace(/security alert detected by splunk/gi, 'Security alert detected')
      .replace(/detected by splunk/gi, 'detected')
      .replace(/splunk security alert/gi, 'Security alert')
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'threat': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'blocked': return <Lock className="h-4 w-4 text-danger" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Banner-like header for Security Overview */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(var(--banner-blue))] bg-gradient-to-r from-[hsl(var(--banner-blue))]/15 via-[hsl(var(--banner-blue))]/8 to-transparent p-6 shadow-professional-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--banner-blue))]/10 to-transparent"></div>
        <div className="relative text-center space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-6 w-6 text-[hsl(var(--banner-blue))]" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--banner-blue))] to-[hsl(var(--banner-blue-light))] bg-clip-text text-transparent">
              Security Overview
            </h1>
            <Shield className="h-6 w-6 text-[hsl(var(--banner-blue))]" />
          </div>
          <p className="text-lg font-medium text-foreground/80">Monitor your network security in real-time</p>
          <div className="flex items-center justify-center space-x-2 pt-2">
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[hsl(var(--banner-blue))] to-transparent rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Metrics Cards with Dark Sky Blue Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-professional group hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-br from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-light))]/10 animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-subheading text-[hsl(var(--dark-sky-blue))]">Total Devices</CardTitle>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--dark-sky-blue))]/20 to-[hsl(var(--dark-sky-blue-light))]/15 group-hover:from-[hsl(var(--dark-sky-blue))]/30 group-hover:to-[hsl(var(--dark-sky-blue-light))]/25 transition-all duration-300 group-hover:rotate-12">
              <Monitor className="h-6 w-6 text-[hsl(var(--dark-sky-blue))] group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--dark-sky-blue))] group-hover:text-[hsl(var(--dark-sky-blue-light))] transition-colors duration-300">{devices.length}</div>
            <p className="text-sm text-muted-foreground mt-2">Connected devices</p>
          </CardContent>
        </Card>
        
        <Card className="card-professional group hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-br from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-muted))]/10 animate-fade-in [animation-delay:100ms]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-subheading text-[hsl(var(--dark-sky-blue))]">Active Threats</CardTitle>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--dark-sky-blue))]/20 to-[hsl(var(--dark-sky-blue-light))]/15 group-hover:from-[hsl(var(--dark-sky-blue))]/30 group-hover:to-[hsl(var(--dark-sky-blue-light))]/25 transition-all duration-300 group-hover:rotate-12">
              <AlertTriangle className="h-6 w-6 text-[hsl(var(--dark-sky-blue))] group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--dark-sky-blue))] group-hover:text-[hsl(var(--dark-sky-blue-light))] transition-colors duration-300">
              {alerts.filter(a => a.status === 'unresolved').length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Unresolved alerts</p>
          </CardContent>
        </Card>
        
        <Card className="card-professional group hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-br from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-lighter))]/10 animate-fade-in [animation-delay:200ms]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-subheading text-[hsl(var(--dark-sky-blue))]">Data Transfer</CardTitle>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--dark-sky-blue))]/20 to-[hsl(var(--dark-sky-blue-light))]/15 group-hover:from-[hsl(var(--dark-sky-blue))]/30 group-hover:to-[hsl(var(--dark-sky-blue-light))]/25 transition-all duration-300 group-hover:rotate-12">
              <Activity className="h-6 w-6 text-[hsl(var(--dark-sky-blue))] group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--dark-sky-blue))] group-hover:text-[hsl(var(--dark-sky-blue-light))] transition-colors duration-300">{metrics.data_transferred_mb}</div>
            <p className="text-sm text-muted-foreground mt-2">MB transferred</p>
          </CardContent>
        </Card>
        
        <Card className="card-professional group hover:scale-105 hover:-translate-y-1 transition-all duration-300 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-br from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-dark))]/10 animate-fade-in [animation-delay:300ms]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-subheading text-[hsl(var(--dark-sky-blue))]">Network Status</CardTitle>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[hsl(var(--dark-sky-blue))]/20 to-[hsl(var(--dark-sky-blue-light))]/15 group-hover:from-[hsl(var(--dark-sky-blue))]/30 group-hover:to-[hsl(var(--dark-sky-blue-light))]/25 transition-all duration-300 group-hover:rotate-12">
              <Zap className="h-6 w-6 text-[hsl(var(--dark-sky-blue))] group-hover:scale-110 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[hsl(var(--dark-sky-blue))] group-hover:text-[hsl(var(--dark-sky-blue-light))] transition-colors duration-300">Active</div>
            <p className="text-sm text-muted-foreground mt-2">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Anomaly Detection Chart */}
      <div className="animate-fade-in [animation-delay:500ms]">
        <AnomalyChart />
      </div>

      {/* Enhanced Recent Security Alerts Section with Dark Sky Blue */}
      <Card className="card-professional border-[hsl(var(--dark-sky-blue))]/60 shadow-2xl animate-fade-in [animation-delay:400ms]">
        <CardHeader className="spacing-generous bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/30 via-[hsl(var(--dark-sky-blue-light))]/10 to-transparent border-b border-[hsl(var(--dark-sky-blue))]/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-heading flex items-center">
              <Bell className="h-6 w-6 text-[hsl(var(--dark-sky-blue))] mr-3 animate-pulse" />
              <span className="bg-gradient-to-r from-[hsl(var(--dark-sky-blue))] to-[hsl(var(--dark-sky-blue-light))] bg-clip-text text-transparent">Recent Security Alerts</span>
            </CardTitle>
            <Button 
              className="btn-primary bg-gradient-to-r from-[hsl(var(--dark-sky-blue))] to-[hsl(var(--dark-sky-blue-light))] hover:from-[hsl(var(--dark-sky-blue-dark))] hover:to-[hsl(var(--dark-sky-blue))] border border-[hsl(var(--dark-sky-blue))]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => setCurrentPage('alerts')}
            >
              View All Alerts
            </Button>
          </div>
        </CardHeader>
        <CardContent className="spacing-generous">
          <div className="space-y-4">
            {alerts.slice(0, 5).length > 0 ? (
              alerts.slice(0, 5).map((alert) => {
                const alertDevice = devices.find(d => d.id === alert.device_id);
                return (
                  <div key={alert.id} className="card-professional p-6 hover:shadow-2xl transition-all duration-300 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/20 via-[hsl(var(--dark-sky-blue-light))]/5 to-transparent hover:from-[hsl(var(--dark-sky-blue-subtle))]/30 hover:border-[hsl(var(--dark-sky-blue-light))]/60 animate-fade-in hover:scale-[1.02]">
                     <div className="flex items-start justify-between">
                       <div className="flex items-start space-x-4 flex-1">
                         <div className={`${getSeverityColor(alert.severity)} rounded-full p-1 animate-pulse`}>
                           <AlertTriangle className="h-4 w-4" />
                         </div>
                         <div className="flex-1">
                           <div className="flex items-center space-x-3 mb-2">
                             <span className={`${getSeverityColor(alert.severity)} text-xs font-semibold`}>
                               {alert.severity.toUpperCase()}
                             </span>
                             <span className="font-semibold text-[hsl(var(--dark-sky-blue))] group-hover:text-[hsl(var(--dark-sky-blue-light))] transition-colors">{alert.alert_type}</span>
                           </div>
                           <p className="text-sm text-muted-foreground mb-2">
                             Security incident on <span className="font-medium text-[hsl(var(--dark-sky-blue))]">{alertDevice?.device_name || 'Unknown Device'}</span>
                           </p>
                           <p className="text-sm text-foreground">{cleanAlertDescription(alert.description)}</p>
                         </div>
                       </div>
                       <div className="flex flex-col items-end space-y-2 ml-4">
                         <span className="text-xs font-medium text-[hsl(var(--dark-sky-blue))]">
                           {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                         </span>
                         <span className="text-xs text-muted-foreground">
                           {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                         </span>
                         <Button 
                           className="btn-primary bg-gradient-to-r from-[hsl(var(--dark-sky-blue))] to-[hsl(var(--dark-sky-blue-light))] hover:from-[hsl(var(--dark-sky-blue-dark))] hover:to-[hsl(var(--dark-sky-blue))] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                           size="sm"
                           onClick={() => setCurrentPage('alerts')}
                         >
                           Investigate
                         </Button>
                       </div>
                     </div>
                   </div>
                );
              })
            ) : (
               <div className="text-center py-12 animate-fade-in">
                 <CheckCircle className="h-16 w-16 text-[hsl(var(--dark-sky-blue))] mx-auto mb-4 animate-pulse" />
                 <h3 className="text-subheading mb-2 text-[hsl(var(--dark-sky-blue))] font-bold">All Clear!</h3>
                 <p className="text-muted-foreground">No security alerts detected. Your network is secure.</p>
               </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlerts = () => {
    console.log('Rendering alerts, total alerts:', alerts.length);
    console.log('Alerts data:', alerts);
    
    return (
    <div className="space-y-8">
      {/* Banner-like header */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(var(--banner-blue))] bg-gradient-to-r from-[hsl(var(--banner-blue))]/15 via-[hsl(var(--banner-blue))]/8 to-transparent p-6 shadow-professional-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--banner-blue))]/10 to-transparent"></div>
        <div className="relative text-center space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-[hsl(var(--banner-blue))]" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--banner-blue))] to-[hsl(var(--banner-blue-light))] bg-clip-text text-transparent">
              Security Alerts
            </h1>
            <AlertTriangle className="h-6 w-6 text-[hsl(var(--banner-blue))]" />
          </div>
          <p className="text-lg font-medium text-foreground/80">Monitor and respond to security threats</p>
          <div className="flex items-center justify-center space-x-2 pt-2">
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[hsl(var(--banner-blue))] to-transparent rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {alerts.filter(alert => alert.status !== 'closed').map((alert) => {
          const alertDevice = devices.find(d => d.id === alert.device_id);
          console.log('Rendering alert:', alert.id, 'Chat visible:', alertChatVisible[alert.id]);
          return (
            <AlertDetailCard
              key={alert.id}
              alert={alert}
              device={alertDevice}
              chatMessages={alertChatMessages[alert.id] || []}
              chatInput={alertChatInputs[alert.id] || ''}
              onChatInputChange={(value) => setAlertChatInputs(prev => ({
                ...prev,
                [alert.id]: value
              }))}
              onSendMessage={() => sendAlertMessage(alert.id)}
              onKeyPress={(e) => handleAlertKeyPress(e, alert.id)}
              onCloseAlert={() => closeAlert(alert.id)}
              onBlockDevice={() => alertDevice && updateDeviceStatus(alertDevice.id, 'blocked')}
              onUnblockDevice={() => alertDevice && updateDeviceStatus(alertDevice.id, 'safe')}
              isAnalysisVisible={alertChatVisible[alert.id] || false}
              onToggleAnalysis={() => getAIAnalysis(alert.id)}
            />
          );
        })}
      </div>
    </div>
    );
  };

  const renderDevices = () => (
    <div className="space-y-8">
      {/* Banner-like header for Devices */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(var(--banner-blue))] bg-gradient-to-r from-[hsl(var(--banner-blue))]/15 via-[hsl(var(--banner-blue))]/8 to-transparent p-6 shadow-professional-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--banner-blue))]/10 to-transparent"></div>
        <div className="relative">
          <div className="flex justify-between items-center">
            <div className="text-center space-y-3 flex-1">
              <div className="flex items-center justify-center space-x-3">
                <Monitor className="h-6 w-6 text-[hsl(var(--banner-blue))]" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--banner-blue))] to-[hsl(var(--banner-blue-light))] bg-clip-text text-transparent">
                  My Devices
                </h1>
                <Monitor className="h-6 w-6 text-[hsl(var(--banner-blue))]" />
              </div>
              <p className="text-lg font-medium text-foreground/80">Manage and monitor all connected devices</p>
              <div className="flex items-center justify-center space-x-2 pt-2">
                <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[hsl(var(--banner-blue))] to-transparent rounded-full"></div>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddDevice(true)}
              className="btn-primary border border-primary/20 shadow-professional"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Device
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Add Device Form */}
      {showAddDevice && (
        <Card className="border-2 border-[hsl(var(--ocean-blue))]/50 shadow-2xl bg-gradient-to-r from-[hsl(var(--ice-blue))]/20 to-[hsl(var(--cerulean-blue))]/10 animate-scale-in">
          <CardHeader className="border-b border-[hsl(var(--azure-blue))]/40 bg-gradient-to-r from-[hsl(var(--ice-blue))]/30 to-[hsl(var(--cerulean-blue))]/15">
            <CardTitle className="text-xl font-bold text-[hsl(var(--deep-blue))] flex items-center gap-3">
              <Plus className="w-6 h-6 text-[hsl(var(--ocean-blue))] animate-pulse" />
              <span className="bg-gradient-to-r from-[hsl(var(--deep-blue))] to-[hsl(var(--electric-blue))] bg-clip-text text-transparent">Add New Device</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="animate-fade-in [animation-delay:100ms]">
                <Label htmlFor="deviceName" className="text-base font-semibold text-[hsl(var(--deep-blue))]">Device Name</Label>
                <Input
                  id="deviceName"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="Enter device name"
                  className="mt-2 border-[hsl(var(--azure-blue))]/40 focus:border-[hsl(var(--electric-blue))] bg-gradient-to-r from-[hsl(var(--ice-blue))]/15 to-transparent"
                />
              </div>
              <div className="animate-fade-in [animation-delay:200ms]">
                <Label htmlFor="ipAddress" className="text-base font-semibold text-[hsl(var(--deep-blue))]">IP Address</Label>
                <Input
                  id="ipAddress"
                  value={newDevice.ip}
                  onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })}
                  placeholder="192.168.1.1"
                  className="mt-2 border-[hsl(var(--azure-blue))]/40 focus:border-[hsl(var(--electric-blue))] bg-gradient-to-r from-[hsl(var(--ice-blue))]/15 to-transparent"
                />
              </div>
              <div className="animate-fade-in [animation-delay:300ms]">
                <Label htmlFor="clientId" className="text-base font-semibold text-[hsl(var(--deep-blue))]">Client ID (Optional)</Label>
                <Input
                  id="clientId"
                  value={newDevice.client_id}
                  onChange={(e) => setNewDevice({ ...newDevice, client_id: e.target.value })}
                  placeholder="device_123 (for IoT devices)"
                  className="mt-2 border-[hsl(var(--azure-blue))]/40 focus:border-[hsl(var(--electric-blue))] bg-gradient-to-r from-[hsl(var(--ice-blue))]/15 to-transparent"
                />
              </div>
              <div className="animate-fade-in [animation-delay:400ms]">
                <Label htmlFor="macAddress" className="text-base font-semibold text-[hsl(var(--deep-blue))]">MAC Address (Optional)</Label>
                <Input
                  id="macAddress"
                  value={newDevice.mac}
                  onChange={(e) => setNewDevice({ ...newDevice, mac: e.target.value })}
                  placeholder="00:00:00:00:00:00"
                  className="mt-2 border-[hsl(var(--azure-blue))]/40 focus:border-[hsl(var(--electric-blue))] bg-gradient-to-r from-[hsl(var(--ice-blue))]/15 to-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6 pt-4 border-t border-[hsl(var(--azure-blue))]/30 animate-fade-in [animation-delay:500ms]">
              <Button 
                onClick={addDevice}
                className="btn-primary bg-gradient-to-r from-[hsl(var(--ocean-blue))] to-[hsl(var(--electric-blue))] hover:from-[hsl(var(--deep-blue))] hover:to-[hsl(var(--azure-blue))] border border-[hsl(var(--ocean-blue))]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Add Device
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddDevice(false)}
                className="border border-[hsl(var(--azure-blue))]/60 bg-gradient-to-r from-[hsl(var(--ice-blue))]/20 to-[hsl(var(--cerulean-blue))]/10 text-[hsl(var(--ocean-blue))] hover:bg-gradient-to-r hover:from-[hsl(var(--azure-blue))]/25 hover:to-[hsl(var(--cerulean-blue))]/20 transition-all duration-300 hover:scale-105"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
        <div className="grid gap-6">
        {devices.map((device) => (
          <Card key={device.id} className="border-2 border-[hsl(var(--dark-sky-blue))]/40 shadow-2xl hover:shadow-[0_25px_50px_-12px_hsl(var(--dark-sky-blue-light))]/25 transition-all duration-500 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/15 to-[hsl(var(--dark-sky-blue-light))]/5 hover:from-[hsl(var(--dark-sky-blue-subtle))]/25 animate-fade-in hover:scale-[1.02]">
            <CardHeader className="border-b border-[hsl(var(--dark-sky-blue))]/30 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/20 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-[hsl(var(--dark-sky-blue))]/20 to-[hsl(var(--dark-sky-blue-light))]/10">
                    {getStatusIcon(device.status)}
                  </div>
                  <CardTitle className="text-xl font-semibold text-[hsl(var(--dark-sky-blue))] group-hover:text-[hsl(var(--dark-sky-blue-light))] transition-colors">{device.device_name}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${
                      device.status === 'safe' ? 'border-[hsl(var(--dark-sky-blue))]/60 bg-[hsl(var(--dark-sky-blue-subtle))]/30 text-[hsl(var(--dark-sky-blue))]' :
                      device.status === 'threat' ? 'border-warning/40 bg-warning/10 text-warning' :
                      'border-danger/40 bg-danger/10 text-danger'
                    } font-semibold animate-pulse`}
                  >
                    {device.status.toUpperCase()}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-muted-foreground border border-[hsl(var(--dark-sky-blue))]/40 px-3 py-1 rounded-lg bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/30 to-[hsl(var(--dark-sky-blue-light))]/20">
                  Connected: {new Date(device.connected_since).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/25 to-[hsl(var(--dark-sky-blue-light))]/10 border border-[hsl(var(--dark-sky-blue))]/40 rounded-lg">
                  <span className="font-semibold text-[hsl(var(--dark-sky-blue))]">IP Address:</span>
                  <p className="text-[hsl(var(--dark-sky-blue))] font-mono mt-1 font-medium">{device.ip_address}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/25 to-[hsl(var(--dark-sky-blue-light))]/10 border border-[hsl(var(--dark-sky-blue))]/40 rounded-lg">
                  <span className="font-semibold text-[hsl(var(--dark-sky-blue))]">MAC Address:</span>
                  <p className="text-[hsl(var(--dark-sky-blue))] font-mono mt-1 font-medium">{device.mac_address || 'N/A'}</p>
                </div>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-[hsl(var(--dark-sky-blue))]/30">
                <Button 
                  size="sm" 
                  variant="destructive"
                  className="border border-destructive/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => updateDeviceStatus(device.id, 'blocked')}
                  disabled={device.status === 'blocked'}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Block
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border border-[hsl(var(--dark-sky-blue))]/60 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-light))]/10 text-[hsl(var(--dark-sky-blue))] hover:bg-gradient-to-r hover:from-[hsl(var(--dark-sky-blue))]/20 hover:to-[hsl(var(--dark-sky-blue-light))]/15 transition-all duration-300 hover:scale-105"
                  onClick={() => updateDeviceStatus(device.id, 'safe')}
                  disabled={device.status === 'safe'}
                >
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  Unblock
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="border border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-r from-[hsl(var(--dark-sky-blue))]/15 to-[hsl(var(--dark-sky-blue-light))]/10 text-[hsl(var(--dark-sky-blue))] hover:bg-gradient-to-r hover:from-[hsl(var(--dark-sky-blue))]/25 hover:to-[hsl(var(--dark-sky-blue-light))]/20 transition-all duration-300 hover:scale-105"
                  onClick={() => openEditDevice(device)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );


  const renderReports = () => {
    const currentTemplate = reportTemplates.find((item) => item.id === reportConfig.reportType);
    const formatOption = formatOptions.find((option) => option.id === reportConfig.format);
    const severityBreakdown = severityOptions.map((severity) => ({
      severity,
      count: filteredAlerts.filter((alert) => alert.severity === severity).length,
    }));
    const statusBreakdown = alertStatusOptions.map((status) => ({
      status,
      count: filteredAlerts.filter((alert) => alert.status === status).length,
    }));
    const deviceBreakdown = deviceStatusOptions.map((status) => ({
      status,
      count: filteredDevices.filter((device) => device.status === status).length,
    }));
    const previewAlerts = filteredAlerts.slice(0, 3);
    const impactedDevices = new Set(filteredAlerts.map((alert) => alert.device_id));

    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(var(--banner-blue))] bg-gradient-to-r from-[hsl(var(--banner-blue))]/15 via-[hsl(var(--banner-blue))]/8 to-transparent p-6 shadow-professional-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--banner-blue))]/10 to-transparent" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-[hsl(var(--banner-blue))]" />
                <h2 className="text-3xl font-bold text-[hsl(var(--banner-blue))]">Downloadable Reports</h2>
              </div>
              <p className="text-foreground/80 text-sm md:text-base max-w-2xl">
                {currentTemplate?.description ?? 'Tailor a report using alert, device, and network filters before exporting.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-white/70 text-foreground">
                  {formatOption?.label ?? reportConfig.format.toUpperCase()} format
                </Badge>
                <Badge variant="outline" className="bg-white/40 text-foreground">
                  {filteredAlerts.length} alerts - {impactedDevices.size} devices - {filteredNetworkActivity.length} activity points
                </Badge>
                <Badge variant="outline" className="bg-white/40 text-foreground">
                  Window: {dateWindow.label}
                </Badge>
              </div>
            </div>
            <Button
              size="lg"
              className="self-start md:self-center shadow-professional-lg"
              onClick={handleDownloadReport}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Preparing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="space-y-6">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Report Templates
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Pick a starting configuration and adjust filters to match your use case.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportTemplates.map((template) => {
                  const isActive = template.id === reportConfig.reportType;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => applyTemplateDefaults(template.id)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${isActive ? 'border-primary bg-primary/5 shadow-professional-md' : 'border-border hover:border-primary/40 hover:bg-primary/5'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-base text-foreground">{template.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        </div>
                        {isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                        )}
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {template.highlights.map((highlight) => (
                          <div key={highlight} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary mt-0.5" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Downloads
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Snapshot of the most recently exported report configurations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportHistory.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No reports exported yet. Your downloads will appear here for quick reference.
                  </div>
                ) : (
                  reportHistory.map((entry) => (
                    <div key={`${entry.fileName}-${entry.timestamp.getTime()}`} className="rounded-lg border border-border/60 p-3 hover:border-primary/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-foreground truncate pr-2">{entry.fileName}</span>
                        <Badge variant="outline">
                          {format(entry.timestamp, 'MMM d, yyyy HH:mm')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{entry.summary}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Conditions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Combine alert, device, and timeline filters to shape the export.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      Severity
                      <Badge variant="outline">{reportConfig.severities.length} selected</Badge>
                    </Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {severityOptions.map((severity) => {
                      const active = reportConfig.severities.includes(severity);
                      const severityData = severityBreakdown.find((item) => item.severity === severity);
                      return (
                        <Button
                          key={severity}
                          type="button"
                          variant={active ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleSeverity(severity)}
                          className="capitalize"
                        >
                          {severity}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {severityData?.count ?? 0}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      Alert Status
                      <Badge variant="outline">{reportConfig.statuses.length} selected</Badge>
                    </Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alertStatusOptions.map((status) => {
                      const active = reportConfig.statuses.includes(status);
                      const statusData = statusBreakdown.find((item) => item.status === status);
                      return (
                        <Button
                          key={status}
                          type="button"
                          variant={active ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleStatus(status)}
                          className="capitalize"
                        >
                          {status}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {statusData?.count ?? 0}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      Device Posture
                      <Badge variant="outline">{reportConfig.deviceStatuses.length} selected</Badge>
                    </Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {deviceStatusOptions.map((status) => {
                      const active = reportConfig.deviceStatuses.includes(status);
                      const deviceData = deviceBreakdown.find((item) => item.status === status);
                      return (
                        <Button
                          key={status}
                          type="button"
                          variant={active ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleDeviceStatus(status)}
                          className="capitalize"
                        >
                          {status}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {deviceData?.count ?? 0}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date Range
                    </Label>
                    <span className="text-xs text-muted-foreground">{dateWindow.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dateRangeOptions.map((option) => {
                      const active = reportConfig.dateRange === option.id;
                      return (
                        <Button
                          key={option.id}
                          type="button"
                          variant={active ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateReportDateRange(option.id)}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                  {reportConfig.dateRange === 'custom' && (
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="customStartDate" className="text-xs text-muted-foreground">
                          Start date
                        </Label>
                        <Input
                          id="customStartDate"
                          type="date"
                          value={reportConfig.customStartDate}
                          onChange={(event) => handleCustomDateChange('customStartDate', event.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="customEndDate" className="text-xs text-muted-foreground">
                          End date
                        </Label>
                        <Input
                          id="customEndDate"
                          type="date"
                          value={reportConfig.customEndDate}
                          onChange={(event) => handleCustomDateChange('customEndDate', event.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Format & Options
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Pick an export format and choose which contextual columns to keep.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">File Format</Label>
                  <div className="flex flex-wrap gap-2">
                    {formatOptions.map((option) => {
                      const active = reportConfig.format === option.id;
                      return (
                        <Button
                          key={option.id}
                          type="button"
                          variant={active ? 'default' : 'outline'}
                          onClick={() => updateReportFormat(option.id)}
                          className="capitalize"
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {booleanOptionConfigs.map((option) => {
                    const active = reportConfig[option.key];
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => toggleBooleanOption(option.key)}
                        className={`rounded-xl border p-3 text-left transition-colors ${active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">{option.label}</span>
                          <Badge variant={active ? 'default' : 'outline'}>{active ? 'Included' : 'Skipped'}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Preview Snapshot
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Understand how many records will export and review a quick sample.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border/60 p-4 bg-background/80">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Alerts Matched</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{filteredAlerts.length}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-4 bg-background/80">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Impacted Devices</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{impactedDevices.size}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 p-4 bg-background/80">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Network Samples</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{filteredNetworkActivity.length}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Severity distribution</p>
                  <div className="flex flex-wrap gap-2">
                    {severityBreakdown.map((item) => (
                      <Badge key={item.severity} variant="outline" className="capitalize">
                        {item.severity}: {item.count}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sample alerts</p>
                  <div className="space-y-3">
                    {previewAlerts.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                        No alerts matched the current filters. Adjust conditions to populate the export.
                      </div>
                    ) : (
                      previewAlerts.map((alert) => {
                        const device = devicesById.get(alert.device_id);
                        return (
                          <div key={alert.id} className="rounded-lg border border-border/60 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <Badge className={`capitalize ${getSeverityColor(alert.severity)}`}>
                                  {alert.severity}
                                </Badge>
                                <span className="text-sm font-medium text-foreground">
                                  {cleanAlertDescription(alert.description)}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Device: {device?.device_name ?? 'Unknown'} - Status: {device?.status ?? 'unavailable'} - {alert.status}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-8">
      {/* Banner-like header for Settings */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(var(--banner-blue))] bg-gradient-to-r from-[hsl(var(--banner-blue))]/15 via-[hsl(var(--banner-blue))]/8 to-transparent p-6 shadow-professional-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--banner-blue))]/10 to-transparent"></div>
        <div className="relative text-center space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <Settings className="h-6 w-6 text-[hsl(var(--banner-blue))]" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--banner-blue))] to-[hsl(var(--banner-blue-light))] bg-clip-text text-transparent">
              Settings
            </h1>
            <Settings className="h-6 w-6 text-[hsl(var(--banner-blue))]" />
          </div>
          <p className="text-lg font-medium text-foreground/80">Manage your account and device preferences</p>
          <div className="flex items-center justify-center space-x-2 pt-2">
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-[hsl(var(--banner-blue))] to-transparent rounded-full"></div>
          </div>
        </div>
      </div>
      
      <Card className="border-2 border-[hsl(var(--dark-sky-blue))]/40 shadow-2xl bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/15 to-transparent animate-fade-in">
        <CardHeader className="border-b border-[hsl(var(--dark-sky-blue))]/30 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/25 to-[hsl(var(--dark-sky-blue-light))]/10">
          <CardTitle className="text-xl font-bold text-[hsl(var(--dark-sky-blue))] flex items-center gap-3">
            <Settings className="w-6 h-6 text-[hsl(var(--dark-sky-blue))] animate-pulse" />
            <span className="bg-gradient-to-r from-[hsl(var(--dark-sky-blue))] to-[hsl(var(--dark-sky-blue-light))] bg-clip-text text-transparent">Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="animate-fade-in [animation-delay:100ms]">
              <Label className="text-base font-semibold text-[hsl(var(--dark-sky-blue))]">Email</Label>
              <Input 
                value={user?.email || ''} 
                disabled 
                className="mt-2 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-light))]/10 text-[hsl(var(--dark-sky-blue))] font-medium"
              />
            </div>
            <div className="animate-fade-in [animation-delay:200ms]">
              <Label className="text-base font-semibold text-[hsl(var(--dark-sky-blue))]">User ID</Label>
              <Input 
                value={user?.id || ''} 
                disabled 
                className="mt-2 border-[hsl(var(--dark-sky-blue))]/40 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/20 to-[hsl(var(--dark-sky-blue-light))]/10 text-[hsl(var(--dark-sky-blue))] font-medium font-mono text-sm"
              />
            </div>
            <div className="pt-4 border-t border-[hsl(var(--dark-sky-blue))]/30 animate-fade-in [animation-delay:300ms]">
              <Button 
                onClick={signOut}
                variant="destructive"
                className="w-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      
      {/* Enhanced Registered Devices Section */}
      <Card className="border-2 border-[hsl(var(--dark-sky-blue))]/40 shadow-2xl bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/15 to-transparent animate-fade-in">
        <CardHeader className="border-b border-[hsl(var(--dark-sky-blue))]/30 bg-gradient-to-r from-[hsl(var(--dark-sky-blue-subtle))]/25 to-[hsl(var(--dark-sky-blue-light))]/10">
          <CardTitle className="text-xl font-bold text-[hsl(var(--dark-sky-blue))] flex items-center gap-3">
            <Monitor className="w-6 h-6 text-[hsl(var(--dark-sky-blue))] animate-pulse" />
            <span className="bg-gradient-to-r from-[hsl(var(--dark-sky-blue))] to-[hsl(var(--dark-sky-blue-light))] bg-clip-text text-transparent">Registered Devices</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border-2 border-border/30 rounded-xl bg-background/50 hover:shadow-professional transition-all duration-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-semibold text-foreground text-lg">{device.device_name}</span>
                    {getStatusIcon(device.status)}
                    <Badge 
                      className={`${
                        device.status === 'safe' ? 'border-success/40 bg-success/10 text-success' :
                        device.status === 'threat' ? 'border-warning/40 bg-warning/10 text-warning' :
                        'border-danger/40 bg-danger/10 text-danger'
                      } font-semibold border`}
                    >
                      {device.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-foreground/70 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span>IP:</span>
                      <span className="font-mono text-foreground">{device.ip_address}</span>
                    </div>
                    {device.mac_address && (
                      <div className="flex items-center space-x-2">
                        <span>MAC:</span>
                        <span className="font-mono text-foreground">{device.mac_address}</span>
                      </div>
                    )}
                    {device.client_id && (
                      <div className="flex items-center space-x-2">
                        <span>Client ID:</span>
                        <span className="font-mono text-foreground">{device.client_id}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border border-border/40"
                    onClick={() => openEditDevice(device)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Device
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="border border-destructive/20"
                    onClick={async () => {
                      const { error } = await supabase
                        .from('devices')
                        .delete()
                        .eq('id', device.id);
                      
                      if (error) {
                        toast({
                          title: "Error",
                          description: error.message,
                          variant: "destructive"
                        });
                      } else {
                        toast({
                          title: "Success",
                          description: "Device removed successfully"
                        });
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Device Modal */}
      {showEditDevice && editingDevice && (
        <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Edit Device</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditDevice(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="editDeviceName">Device Name</Label>
                    <Input
                      id="editDeviceName"
                      value={editingDevice.device_name}
                      onChange={(e) => setEditingDevice({ ...editingDevice, device_name: e.target.value })}
                      placeholder="Enter device name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editIpAddress">IP Address</Label>
                    <Input
                      id="editIpAddress"
                      value={editingDevice.ip_address}
                      onChange={(e) => setEditingDevice({ ...editingDevice, ip_address: e.target.value })}
                      placeholder="192.168.1.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMacAddress">MAC Address (Optional)</Label>
                    <Input
                      id="editMacAddress"
                      value={editingDevice.mac_address}
                      onChange={(e) => setEditingDevice({ ...editingDevice, mac_address: e.target.value })}
                      placeholder="00:11:22:33:44:55"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editClientId">Client ID</Label>
                    <Input
                      id="editClientId"
                      value={editingDevice.client_id}
                      onChange={(e) => setEditingDevice({ ...editingDevice, client_id: e.target.value })}
                      placeholder="device_123 (for IoT devices)"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setShowEditDevice(false)}>
                    Cancel
                  </Button>
                  <Button onClick={updateDevice}>
                    Update Device
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Navigation Header */}
      <nav className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="h-8 w-8 text-primary mr-3" />
                <span className="text-xl font-bold text-foreground">SecureNet Dashboard</span>
              </div>
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Home },
                  { id: 'alerts', label: 'Alerts', icon: Bell },
                  { id: 'devices', label: 'Devices', icon: Monitor },
                  { id: 'reports', label: 'Reports', icon: FileText },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCurrentPage(id as Page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      currentPage === id
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
                <Link
                  to="/siem-dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>SIEM Dashboard</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Welcome, {user?.email}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'overview' && renderOverview()}
        {currentPage === 'alerts' && renderAlerts()}
        {currentPage === 'devices' && renderDevices()}
        {currentPage === 'reports' && renderReports()}
        {currentPage === 'settings' && renderSettings()}
      </main>
    </div>
  );
};

export default Dashboard;
