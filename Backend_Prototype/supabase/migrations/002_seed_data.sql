-- =====================================================
-- SEED DATA for Backend Prototype Testing
-- Sample data for demonstration and testing purposes
-- =====================================================

-- Note: This assumes a test user with ID '9e41ec3a-367d-4104-8631-99fffa82fd07'
-- In production, user IDs come from Supabase Auth

-- Insert sample devices
INSERT INTO public.devices (id, user_id, device_name, ip_address, mac_address, client_id, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', '9e41ec3a-367d-4104-8631-99fffa82fd07', 'Smart Lock', '192.168.1.100', '00:1A:2B:3C:4D:5E', 'mqtt-lock-001', 'safe'),
  ('22222222-2222-2222-2222-222222222222', '9e41ec3a-367d-4104-8631-99fffa82fd07', 'Security Camera', '192.168.1.101', '00:1A:2B:3C:4D:5F', 'mqtt-camera-001', 'safe'),
  ('33333333-3333-3333-3333-333333333333', '9e41ec3a-367d-4104-8631-99fffa82fd07', 'Smart Thermostat', '192.168.1.102', '00:1A:2B:3C:4D:60', 'mqtt-thermo-001', 'threat')
ON CONFLICT (id) DO NOTHING;

-- Insert sample security alerts
INSERT INTO public.security_alerts (id, device_id, alert_type, description, severity, status)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Unauthorized Access Attempt', 'Multiple failed authentication attempts detected', 'high', 'unresolved'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Unusual Network Activity', 'Device communicating with unknown external IP', 'medium', 'resolved'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Firmware Tampering', 'Device firmware checksum mismatch detected', 'critical', 'unresolved')
ON CONFLICT (id) DO NOTHING;

-- Insert sample anomaly alerts
INSERT INTO public.anomaly_alerts (user_id, timestamp, client_id, packet_count, anomaly_score, is_anomaly)
VALUES
  ('9e41ec3a-367d-4104-8631-99fffa82fd07', NOW() - INTERVAL '1 hour', 'mqtt-lock-001', 150, 0.25, false),
  ('9e41ec3a-367d-4104-8631-99fffa82fd07', NOW() - INTERVAL '30 minutes', 'mqtt-camera-001', 1200, 0.85, true),
  ('9e41ec3a-367d-4104-8631-99fffa82fd07', NOW() - INTERVAL '10 minutes', 'mqtt-thermo-001', 350, 0.45, false);

-- Insert sample dashboard metrics
INSERT INTO public.dashboard_metrics (user_id, metric_key, metric_value)
VALUES
  ('9e41ec3a-367d-4104-8631-99fffa82fd07', 'top_targeted_clients', 
   '{"data": [{"targeted_client": "mqtt-lock-001", "failure_count": 45}, {"targeted_client": "mqtt-camera-001", "failure_count": 12}], "timestamp": 1234567890}'::JSONB),
  ('9e41ec3a-367d-4104-8631-99fffa82fd07', 'top_busiest_topics',
   '{"data": [{"topic_name": "home/lock/status", "message_count": 1250}, {"topic_name": "home/camera/feed", "message_count": 890}], "timestamp": 1234567890}'::JSONB),
  ('9e41ec3a-367d-4104-8631-99fffa82fd07', 'Dashboard Data: Message Throughput (New)',
   '{"history": [{"time": 1234567890, "value": 10}, {"time": 1234567920, "value": 15}, {"time": 1234567950, "value": 12}]}'::JSONB)
ON CONFLICT (metric_key, user_id) DO NOTHING;

-- Insert sample network metrics
INSERT INTO public.network_metrics (user_id, total_devices, threats_detected, data_transferred_mb)
VALUES
  ('9e41ec3a-367d-4104-8631-99fffa82fd07', 3, 2, 1250)
ON CONFLICT DO NOTHING;

-- Note: OTP codes are not seeded as they are ephemeral and expire quickly
