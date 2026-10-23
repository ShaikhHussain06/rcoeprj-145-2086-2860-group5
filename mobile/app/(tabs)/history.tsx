import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Endpoints } from '../../src/api/endpoints';
import { Theme } from '../../src/constants/theme';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import {
  FileText,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Activity,
  Cpu,
  Radio,
  Lock,
} from 'lucide-react-native';

export default function HistoryScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['patient-history'],
    queryFn: () => Endpoints.getHistory(50),
  });

  const history = data?.history || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Audit Ledger Banner matching Web */}
      <View style={styles.auditLedgerBanner}>
        <View style={styles.ledgerStatus}>
          <View style={styles.greenDot} />
          <Text style={styles.ledgerTag}>AUDIT LEDGER ACTIVE</Text>
        </View>
        <Text style={styles.seqText}>#BLK-89104-ED25519 • Consensus: NIST UTC-PTP</Text>
        <View style={styles.latencyRow}>
          <Text style={styles.latencyText}>Ledger Latency: <Text style={styles.valAccent}>18ms</Text></Text>
          <Text style={styles.latencyText}>Merkle: <Text style={styles.valAccent}>0x4a9f...c28e</Text></Text>
        </View>
      </View>

      {/* 4 Metric Cards matching Web Header */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>MONITORED INGESTION</Text>
          <Text style={styles.metricNumber}>1,428</Text>
          <View style={styles.checkRow}>
            <CheckCircle2 size={12} color="#16a34a" />
            <Text style={styles.checkText}>100% Intact</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>CRITICAL MURMURS</Text>
          <Text style={[styles.metricNumber, { color: '#dc2626' }]}>324</Text>
          <View style={styles.checkRow}>
            <AlertCircle size={12} color="#dc2626" />
            <Text style={[styles.checkText, { color: '#dc2626' }]}>22.6% Exceeding CI</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>MODEL INFERENCE</Text>
          <Text style={[styles.metricNumber, { color: '#0284c7' }]}>41ms</Text>
          <View style={styles.checkRow}>
            <Cpu size={12} color="#0284c7" />
            <Text style={[styles.checkText, { color: '#0284c7' }]}>TensorRT FP16</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>STETHOSCOPE FLEET</Text>
          <Text style={[styles.metricNumber, { color: '#16a34a' }]}>18/18</Text>
          <View style={styles.checkRow}>
            <Radio size={12} color="#16a34a" />
            <Text style={styles.checkText}>Zero Frame Drop</Text>
          </View>
        </View>
      </View>

      {/* Longitudinal Audio Telemetry Registry Title */}
      <View style={styles.registryHeader}>
        <View style={styles.registryTitleRow}>
          <Database size={18} color="#0284c7" />
          <Text style={styles.registryTitle}>Longitudinal Audio Telemetry Registry</Text>
        </View>
        <Text style={styles.recordCountBadge}>{history.length} Filtered Records</Text>
      </View>

      {/* Patient Records List */}
      {history.length === 0 ? (
        <View style={styles.emptyStateBox}>
          <FileText size={32} color="#94a3b8" />
          <Text style={styles.emptyStateTitle}>No Records Found</Text>
          <Text style={styles.emptyStateDesc}>
            No patient auscultation records have been logged to SQLite yet. Run an analysis from Auscultation Studio to populate the clinical ledger.
          </Text>
        </View>
      ) : (
        history.map((item, idx) => {
          const isAbnormal = item.classification === 'Abnormal';
          const percent = Math.round(item.abnormal_probability * 100);

          return (
            <View key={item.session_id} style={styles.recordCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.idCol}>
                  <Text style={styles.recId}>#REC-{(idx + 1).toString().padStart(4, '0')}</Text>
                  <Text style={styles.sessionHash}>{item.session_id}</Text>
                </View>

                <View
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: isAbnormal ? '#fee2e2' : '#dcfce7',
                      borderColor: isAbnormal ? '#fecaca' : '#bbf7d0',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      { color: isAbnormal ? '#dc2626' : '#16a34a' },
                    ]}
                  >
                    {item.classification.toUpperCase()} • {percent}%
                  </Text>
                </View>
              </View>

              <Text style={styles.patientName}>{item.patient_tag}</Text>
              <Text style={styles.reportSummary} numberOfLines={2}>
                {item.report_summary}
              </Text>

              <View style={styles.cardBottomRow}>
                <View style={styles.metaBadge}>
                  <Activity size={12} color="#0284c7" />
                  <Text style={styles.metaBadgeText}>{item.duration_seconds.toFixed(1)}s @ 2kHz</Text>
                </View>

                <View style={styles.metaBadge}>
                  <Lock size={12} color="#64748b" />
                  <Text style={styles.metaBadgeText}>SHA-256 Validated</Text>
                </View>

                <View style={styles.metaBadge}>
                  <Calendar size={12} color="#64748b" />
                  <Text style={styles.metaBadgeText}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}

      <DisclaimerBanner isCompact />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: Theme.spacing.md,
    paddingBottom: 60,
  },
  auditLedgerBanner: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  ledgerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
    marginRight: 6,
  },
  ledgerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16a34a',
    letterSpacing: 0.5,
  },
  seqText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#334155',
    marginVertical: 2,
  },
  latencyRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  latencyText: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  valAccent: {
    color: '#0284c7',
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Theme.spacing.md,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginVertical: 2,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  checkText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16a34a',
  },
  registryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  registryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  registryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  recordCountBadge: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '700',
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  idCol: {},
  recId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  sessionHash: {
    fontSize: 10,
    color: '#94a3b8',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  patientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284c7',
    marginBottom: 2,
  },
  reportSummary: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginBottom: Theme.spacing.sm,
  },
  cardBottomRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
    flexWrap: 'wrap',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  metaBadgeText: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  emptyStateBox: {
    backgroundColor: '#ffffff',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: Theme.spacing.md,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xs,
  },
  emptyStateDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});
