import {
  Case,
  EvidenceFile,
  ExtractionJob,
  ExtractedEntity,
  QualityReviewItem,
  ResolutionCandidate,
  GraphData
} from './types';

export const INITIAL_CASES: Case[] = [
  {
    id: 1001,
    caseDescription: 'Customer reported an unauthorized card transaction.',
    caseCategory: 'Fraud',
    assignedOfficers: 'Anita Rao, David Thomas',
    status: 'ACTIVE_INVESTIGATION',
    dateAdded: '2026-08-25T09:30:00',
    dateModified: '2026-08-29T11:15:00',
    addedBy: 'system.admin',
    modifiedBy: 'anita.rao'
  },
  {
    id: 1002,
    caseDescription: 'Address verification documents require review.',
    caseCategory: 'KYC',
    assignedOfficers: 'Meera Nair',
    status: 'UNDER_REVIEW',
    dateAdded: '2026-08-26T07:45:00',
    dateModified: '2026-08-30T13:20:00',
    addedBy: 'case.intake',
    modifiedBy: 'meera.nair'
  },
  {
    id: 1003,
    caseDescription: 'Duplicate payment dispute resolved with the customer.',
    caseCategory: 'Payment Dispute',
    assignedOfficers: 'David Thomas',
    status: 'RESOLVED',
    dateAdded: '2026-08-20T12:10:00',
    dateModified: '2026-08-28T15:40:00',
    addedBy: 'support.agent',
    modifiedBy: 'david.thomas'
  },
  {
    id: 1004,
    caseDescription: 'Potential account takeover flagged by monitoring.',
    caseCategory: 'Fraud',
    assignedOfficers: 'Anita Rao',
    status: 'CRITICAL_REVIEW',
    dateAdded: '2026-08-31T18:05:00',
    dateModified: '2026-09-01T05:25:00',
    addedBy: 'fraud.monitor',
    modifiedBy: 'anita.rao'
  }
];

export const MOCK_EVIDENCE_FILES: Record<number, EvidenceFile[]> = {
  1001: [
    {
      id: 'ev-1001-01',
      caseId: 1001,
      fileName: 'unauthorized_tx_report_signed.pdf',
      fileType: 'PDF',
      fileSizeBytes: 2458120,
      uploadStatus: 'EXTRACTED',
      uploadedAt: '2026-08-25T10:14:00Z',
      uploadedBy: 'anita.rao',
      sha256Hash: '9f83acde912bfa4e76819dca12b0059348eecab93821094ba45fe001a1829e12',
      extractedEntityCount: 14,
      mimeType: 'application/pdf',
      previewSnippet: 'Customer statement: "On August 24, an unauthorized POS charge of $4,850.00 was logged at Terminal ID 8849-POS at Zurich Gateway... Cardholder Anita Rao confirms card remained in physical possession while suspicious login from IP 198.51.100.42 and Android Device IDFA-8812a occurred."'
    },
    {
      id: 'ev-1001-02',
      caseId: 1001,
      fileName: 'gateway_telemetry_dump.json',
      fileType: 'JSON',
      fileSizeBytes: 1840900,
      uploadStatus: 'EXTRACTED',
      uploadedAt: '2026-08-26T14:32:00Z',
      uploadedBy: 'system.sensor',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      extractedEntityCount: 22,
      mimeType: 'application/json',
      previewSnippet: 'Session records: {"session_id":"sess_982710","source_ip":"198.51.100.42","user_agent":"Mozilla/5.0 Android 14 SM-S918B","imei":"354892019482012","mac":"00:1A:2B:3C:4D:5E","routed_vpn":"NordSec-Exit-04"}'
    },
    {
      id: 'ev-1001-03',
      caseId: 1001,
      fileName: 'device_sensor_packet.pcap',
      fileType: 'PCAP',
      fileSizeBytes: 8912400,
      uploadStatus: 'EXTRACTED',
      uploadedAt: '2026-08-27T08:15:00Z',
      uploadedBy: 'david.thomas',
      sha256Hash: 'c4a22b740529d8b80918c7739502901928374920192847291039847291048201',
      extractedEntityCount: 18,
      mimeType: 'application/vnd.tcpdump.pcap',
      previewSnippet: 'Network forensic trace capture: Synchronous TLS handshakes between device identifier IMEI-354892019482012 and cryptocurrency exchange gateway api.apexsettle.io, wallet 0x71C...b29F'
    },
    {
      id: 'ev-1001-04',
      caseId: 1001,
      fileName: 'cardholder_affidavit_scanned.pdf',
      fileType: 'PDF',
      fileSizeBytes: 1540000,
      uploadStatus: 'UPLOADED',
      uploadedAt: '2026-08-29T11:00:00Z',
      uploadedBy: 'anita.rao',
      sha256Hash: '7a12b48912cde4890123feaa8192384910293847582910293847582910293847',
      extractedEntityCount: 0,
      mimeType: 'application/pdf',
      previewSnippet: 'Affidavit of Non-Involvement sworn by cardholder under penalty of perjury. Notarized in London, UK.'
    }
  ],
  1004: [
    {
      id: 'ev-1004-01',
      caseId: 1004,
      fileName: 'sim_swap_carrier_subpoena.pdf',
      fileType: 'PDF',
      fileSizeBytes: 3120000,
      uploadStatus: 'EXTRACTED',
      uploadedAt: '2026-08-31T19:00:00Z',
      uploadedBy: 'anita.rao',
      sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      extractedEntityCount: 19,
      mimeType: 'application/pdf',
      previewSnippet: 'Carrier Subpoena Return: Phone number +1-555-019-4829 reassigned to IMSI 310410192837482 at 2026-08-31 03:12:00. Prior device iPhone 14 Pro disconnected.'
    }
  ]
};

export const MOCK_EXTRACTION_JOBS: Record<number, any[]> = {
  1001: [
    {
      id: 'JOB-EX-8821',
      caseId: 1001,
      evidenceId: 'ev-1001-01',
      evidenceName: 'unauthorized_tx_report_signed.pdf',
      status: 'COMPLETED',
      progressPercent: 100,
      startTime: '2026-08-25T10:15:00Z',
      completionTime: '2026-08-25T10:17:42Z',
      modelUsed: 'NER-GraphExtract-v4.2 (ZeroShot + Ontological Linking)',
      entitiesFound: 14
    },
    {
      id: 'JOB-EX-8822',
      caseId: 1001,
      evidenceId: 'ev-1001-02',
      evidenceName: 'gateway_telemetry_dump.json',
      status: 'COMPLETED',
      progressPercent: 100,
      startTime: '2026-08-26T14:35:00Z',
      completionTime: '2026-08-26T14:38:10Z',
      modelUsed: 'TelemetryParser-DeviceID-v2.1',
      entitiesFound: 22
    },
    {
      id: 'JOB-EX-8823',
      caseId: 1001,
      evidenceId: 'ev-1001-03',
      evidenceName: 'device_sensor_packet.pcap',
      status: 'COMPLETED',
      progressPercent: 100,
      startTime: '2026-08-27T08:16:00Z',
      completionTime: '2026-08-27T08:21:30Z',
      modelUsed: 'NetFlow-EntityMiner-v3',
      entitiesFound: 18
    },
    {
      id: 'JOB-EX-8824',
      caseId: 1001,
      evidenceId: 'ev-1001-04',
      evidenceName: 'cardholder_affidavit_scanned.pdf',
      status: 'PROCESSING',
      progressPercent: 68,
      startTime: '2026-09-03T17:45:00Z',
      modelUsed: 'VisionOCR-DocumentNER-v4',
      entitiesFound: 6
    }
  ]
};

export const MOCK_EXTRACTED_ENTITIES: Record<number, ExtractedEntity[]> = {
  1001: [
    {
      id: 'ent-101',
      caseId: 1001,
      entityType: 'PERSON',
      entityValue: 'Anita Rao',
      confidence: 0.985,
      sourceEvidence: 'unauthorized_tx_report_signed.pdf',
      pageLocation: 'Page 1, Paragraph 2',
      attributes: {
        full_name: 'Anita Rao',
        role: 'Victim / Primary Cardholder',
        citizenship: 'United Kingdom',
        date_of_birth: '1984-06-14'
      },
      reviewStatus: 'APPROVED',
      resolutionStatus: 'CONFIRMED',
      resolvedToIdentityId: 'ID-CONSOL-001'
    },
    {
      id: 'ent-102',
      caseId: 1001,
      entityType: 'ORGANIZATION',
      entityValue: 'Apex Settle International Ltd',
      confidence: 0.962,
      sourceEvidence: 'gateway_telemetry_dump.json',
      pageLocation: 'Record #481',
      attributes: {
        organization_name: 'Apex Settle International Ltd',
        registration_number: 'CH-8921-98',
        jurisdiction: 'Switzerland'
      },
      reviewStatus: 'APPROVED',
      resolutionStatus: 'UNRESOLVED'
    },
    {
      id: 'ent-103',
      caseId: 1001,
      entityType: 'DEVICE_IDENTIFIER',
      entityValue: 'IMEI-354892019482012',
      confidence: 0.994,
      sourceEvidence: 'gateway_telemetry_dump.json',
      pageLocation: 'Record #102',
      attributes: {
        identifier_type: 'IMEI',
        identifier_value: '354892019482012',
        device_model: 'Samsung Galaxy S23 Ultra',
        carrier: 'Swisscom Mobile'
      },
      reviewStatus: 'APPROVED',
      resolutionStatus: 'PROPOSED',
      resolvedToIdentityId: 'ID-SUSPECT-X9'
    },
    {
      id: 'ent-104',
      caseId: 1001,
      entityType: 'IP_ADDRESS',
      entityValue: '198.51.100.42',
      confidence: 0.971,
      sourceEvidence: 'gateway_telemetry_dump.json',
      pageLocation: 'Record #104',
      attributes: {
        ip_address: '198.51.100.42',
        ip_version: 4,
        asn: 'AS13335 Cloudflare Managed Gateway',
        geo_country: 'Germany'
      },
      reviewStatus: 'APPROVED',
      resolutionStatus: 'PROPOSED',
      resolvedToIdentityId: 'ID-SUSPECT-X9'
    },
    {
      id: 'ent-105',
      caseId: 1001,
      entityType: 'TRANSACTION',
      entityValue: 'TX-89201-FRAUD',
      confidence: 0.998,
      sourceEvidence: 'unauthorized_tx_report_signed.pdf',
      pageLocation: 'Page 2, Table Line 4',
      attributes: {
        transaction_id: 'TX-89201-FRAUD',
        amount: 4850.00,
        currency: 'USD',
        transaction_date: '2026-08-24T22:18:40Z',
        merchant: 'Zurich Luxury Vault POS'
      },
      reviewStatus: 'APPROVED',
      resolutionStatus: 'UNRESOLVED'
    },
    {
      id: 'ent-106',
      caseId: 1001,
      entityType: 'WALLET_ADDRESS',
      entityValue: '0x71C...b29F',
      confidence: 0.953,
      sourceEvidence: 'device_sensor_packet.pcap',
      pageLocation: 'Packet Frame 1842',
      attributes: {
        wallet_address: '0x71C434547942eBB41C5209320bC4f8101412b29F',
        blockchain: 'Ethereum',
        balance_eth: 14.82,
        first_funded: '2026-07-12'
      },
      reviewStatus: 'APPROVED',
      resolutionStatus: 'PROPOSED',
      resolvedToIdentityId: 'ID-SUSPECT-X9'
    },
    {
      id: 'ent-107',
      caseId: 1001,
      entityType: 'PHONE_NUMBER',
      entityValue: '+41-79-402-9182',
      confidence: 0.938,
      sourceEvidence: 'gateway_telemetry_dump.json',
      pageLocation: 'Record #219',
      attributes: {
        number: '+41-79-402-9182',
        country_code: '+41',
        line_type: 'Mobile Virtual Network'
      },
      reviewStatus: 'APPROVED',
      resolutionStatus: 'PROPOSED',
      resolvedToIdentityId: 'ID-SUSPECT-X9'
    },
    {
      id: 'ent-108',
      caseId: 1001,
      entityType: 'ACCOUNT',
      entityValue: 'ACCT-VISA-9941',
      confidence: 0.99,
      sourceEvidence: 'unauthorized_tx_report_signed.pdf',
      pageLocation: 'Page 1, Box A',
      attributes: {
        account_number: '************9941',
        account_type: 'Credit Card (Infinite)',
        issuing_bank: 'National Reserve Bank'
      },
      reviewStatus: 'APPROVED',
      resolutionStatus: 'UNRESOLVED'
    },
    {
      id: 'ent-109',
      caseId: 1001,
      entityType: 'LOCATION',
      entityValue: 'Zurich Airport POS 8849',
      confidence: 0.92,
      sourceEvidence: 'unauthorized_tx_report_signed.pdf',
      pageLocation: 'Page 2, Box C',
      attributes: {
        location_name: 'Zurich Airport POS 8849',
        address: 'Flughafenstrasse, 8058 Zürich, Switzerland'
      },
      reviewStatus: 'APPROVED',
      resolutionStatus: 'UNRESOLVED'
    },
    {
      id: 'ent-110',
      caseId: 1001,
      entityType: 'DEVICE',
      entityValue: 'Samsung Galaxy S23 Ultra (Shadow Device)',
      confidence: 0.941,
      sourceEvidence: 'gateway_telemetry_dump.json',
      pageLocation: 'Record #102',
      attributes: {
        device_name: 'Samsung Galaxy S23 Ultra',
        device_type: 'Mobile Phone',
        source_device_id: 'SRC-DEV-S23-99'
      },
      reviewStatus: 'APPROVED',
      resolutionStatus: 'PROPOSED'
    },
    {
      id: 'ent-111',
      caseId: 1001,
      entityType: 'USERNAME',
      entityValue: 'darkshadow_trader',
      confidence: 0.884,
      sourceEvidence: 'device_sensor_packet.pcap',
      pageLocation: 'Packet Frame 1845',
      attributes: {
        username: 'darkshadow_trader',
        platform: 'Telegram / Apex P2P Channel'
      },
      reviewStatus: 'PENDING',
      resolutionStatus: 'PROPOSED'
    },
    {
      id: 'ent-112',
      caseId: 1001,
      entityType: 'DOCUMENT',
      entityValue: 'Cardholder Dispute Notice REF-4410',
      confidence: 0.99,
      sourceEvidence: 'unauthorized_tx_report_signed.pdf',
      pageLocation: 'Header Ref',
      attributes: {
        document_number: 'REF-4410',
        document_date: '2026-08-25'
      },
      reviewStatus: 'APPROVED',
      resolutionStatus: 'UNRESOLVED'
    }
  ]
};

export const MOCK_QUALITY_REVIEWS: Record<number, QualityReviewItem[]> = {
  1001: [
    {
      id: 'qr-1001-01',
      caseId: 1001,
      entityId: 'ent-101',
      entityType: 'PERSON',
      entityValue: 'Anita Rao',
      sourceDocument: 'unauthorized_tx_report_signed.pdf',
      pageReference: 'Page 1, Paragraph 2',
      sourceSnippet: '...The complainant, Mrs. Anita Rao, holding account ************9941, stated she was present in London on 2026-08-24 while transaction occurred in Zurich...',
      confidence: 0.985,
      status: 'APPROVED',
      reviewerComment: 'Identity confirmed against government passport records and bank signatory database.',
      reviewedBy: 'anita.rao',
      reviewedAt: '2026-08-26T09:12:00Z',
      attributes: { full_name: 'Anita Rao', role: 'Victim' }
    },
    {
      id: 'qr-1001-02',
      caseId: 1001,
      entityId: 'ent-103',
      entityType: 'DEVICE_IDENTIFIER',
      entityValue: 'IMEI-354892019482012',
      sourceDocument: 'gateway_telemetry_dump.json',
      pageReference: 'Record #102',
      sourceSnippet: '{"event":"pos_auth_trigger","imei":"354892019482012","imsi":"228019283746","sim_status":"active","risk_score":94}',
      confidence: 0.994,
      status: 'APPROVED',
      reviewerComment: 'High-confidence device hardware identifier extracted from Zurich terminal log. Matched to secondary suspect cluster.',
      reviewedBy: 'david.thomas',
      reviewedAt: '2026-08-27T11:40:00Z',
      attributes: { identifier_type: 'IMEI', identifier_value: '354892019482012' }
    },
    {
      id: 'qr-1001-03',
      caseId: 1001,
      entityId: 'ent-111',
      entityType: 'USERNAME',
      entityValue: 'darkshadow_trader',
      sourceDocument: 'device_sensor_packet.pcap',
      pageReference: 'Packet Frame 1845',
      sourceSnippet: '...HTTP GET /v2/p2p/order?handle=darkshadow_trader&auth_key=k_89218bc... Host: api.apexsettle.io...',
      confidence: 0.884,
      status: 'PENDING',
      reviewerComment: 'Handle observed in P2P escrow transaction seconds after fraudulent POS debit. Needs verification if owner is broker or mule.',
      attributes: { username: 'darkshadow_trader', platform: 'Telegram / Apex P2P' }
    },
    {
      id: 'qr-1001-04',
      caseId: 1001,
      entityId: 'ent-104',
      entityType: 'IP_ADDRESS',
      entityValue: '198.51.100.42',
      sourceDocument: 'gateway_telemetry_dump.json',
      pageReference: 'Record #104',
      sourceSnippet: '...remote_ip: "198.51.100.42", reverse_dns: "node-frankfurt.m247.com", proxy_detected: true...',
      confidence: 0.971,
      status: 'FLAGGED',
      reviewerComment: 'Identified as known commercial VPN exit node in Frankfurt. Flagged for traffic correlation with Swiss cellular mast data.',
      reviewedBy: 'anita.rao',
      reviewedAt: '2026-08-28T16:05:00Z',
      attributes: { ip_address: '198.51.100.42', proxy_type: 'VPN' }
    }
  ]
};

export const MOCK_RESOLUTION_CANDIDATES: Record<number, any[]> = {
  1001: [
    {
      id: 'res-cand-01',
      caseId: 1001,
      identityName: 'IDENTITY :: SUSPECT_CROSS_DEVICE_X9',
      targetIdentityId: 'ID-SUSPECT-X9',
      sourceEntities: [
        {
          id: 'ent-103',
          caseId: 1001,
          entityType: 'DEVICE_IDENTIFIER',
          entityValue: 'IMEI-354892019482012',
          confidence: 0.994,
          sourceEvidence: 'gateway_telemetry_dump.json',
          attributes: { identifier_type: 'IMEI', device: 'Samsung S23 Ultra', os: 'Android 14' },
          reviewStatus: 'APPROVED'
        },
        {
          id: 'ent-107',
          caseId: 1001,
          entityType: 'PHONE_NUMBER',
          entityValue: '+41-79-402-9182',
          confidence: 0.938,
          sourceEvidence: 'gateway_telemetry_dump.json',
          attributes: { number: '+41-79-402-9182', carrier: 'Swisscom Mobile' },
          reviewStatus: 'APPROVED'
        },
        {
          id: 'ent-104',
          caseId: 1001,
          entityType: 'IP_ADDRESS',
          entityValue: '198.51.100.42',
          confidence: 0.971,
          sourceEvidence: 'gateway_telemetry_dump.json',
          attributes: { ip: '198.51.100.42', gateway: 'Zurich-VPN-Exit' },
          reviewStatus: 'APPROVED'
        },
        {
          id: 'ent-106',
          caseId: 1001,
          entityType: 'WALLET_ADDRESS',
          entityValue: '0x71C...b29F',
          confidence: 0.953,
          sourceEvidence: 'device_sensor_packet.pcap',
          attributes: { wallet: '0x71C434547942eBB41C5209320bC4f8101412b29F', chain: 'ETH' },
          reviewStatus: 'APPROVED'
        }
      ],
      matchingAttributes: [
        {
          attributeName: 'Hardware Fingerprint & SIM Co-occurrence',
          valueA: 'IMEI-354892019482012 (Zurich Terminal)',
          valueB: 'IMSI linked to +41-79-402-9182',
          isExactMatch: true,
          weight: 0.40
        },
        {
          attributeName: 'Synchronous Session Timestamp Window (Δt < 1.4s)',
          valueA: '2026-08-24 22:18:39.120',
          valueB: '2026-08-24 22:18:40.540',
          isExactMatch: true,
          weight: 0.30
        },
        {
          attributeName: 'TLS Client Hello Ja3 Fingerprint',
          valueA: 'a0e9f5d64349fb13191bc781f81f42e1',
          valueB: 'a0e9f5d64349fb13191bc781f81f42e1',
          isExactMatch: true,
          weight: 0.20
        },
        {
          attributeName: 'Cryptographic Nonce Reuse in P2P Escrow',
          valueA: 'Signer 0x71C...b29F',
          valueB: 'Telegram user darkshadow_trader',
          isExactMatch: false,
          weight: 0.10
        }
      ],
      conflictingAttributes: [
        {
          attributeName: 'Carrier Tower Location vs IP GeoIP',
          valueA: 'Tower: Zurich Enge Mast #4',
          valueB: 'GeoIP: Frankfurt Server Farm (VPN Node)',
          severity: 'LOW'
        }
      ],
      confidenceScore: 0.964,
      resolutionMethod: 'Graph Convolutional Multi-Entity Resolver (GNN-ER-v3) + Deterministic Hardware Linkage',
      resolutionStatus: 'PROPOSED',
      rationale: 'Hardware IMEI, phone MSISDN, and wallet signature show 96.4% cross-device correlation across network dump and POS logs within 1.4 second delta. Confirms single rogue entity operating unauthorized device.',
      devicesObserved: [
        'Samsung Galaxy S23 Ultra (IMEI 354892019482012)',
        'M247 Frankfurt VPN Tunnel Endpoint',
        'Zurich POS Gateway Terminal #8849'
      ]
    },
    {
      id: 'res-cand-02',
      caseId: 1001,
      identityName: 'IDENTITY :: ANITA_RAO_PRIMARY',
      targetIdentityId: 'ID-CONSOL-001',
      sourceEntities: [
        {
          id: 'ent-101',
          caseId: 1001,
          entityType: 'PERSON',
          entityValue: 'Anita Rao',
          confidence: 0.985,
          sourceEvidence: 'unauthorized_tx_report_signed.pdf',
          attributes: { full_name: 'Anita Rao', dob: '1984-06-14' },
          reviewStatus: 'APPROVED'
        },
        {
          id: 'ent-108',
          caseId: 1001,
          entityType: 'ACCOUNT',
          entityValue: 'ACCT-VISA-9941',
          confidence: 0.99,
          sourceEvidence: 'unauthorized_tx_report_signed.pdf',
          attributes: { card: '************9941', status: 'Blocked' },
          reviewStatus: 'APPROVED'
        }
      ],
      matchingAttributes: [
        {
          attributeName: 'Full Legal Name & Verified KYC Hash',
          valueA: 'Anita Rao',
          valueB: 'Anita Rao (Passport GB-891024)',
          isExactMatch: true,
          weight: 0.60
        },
        {
          attributeName: 'Primary Card Account Association',
          valueA: 'ACCT-VISA-9941',
          valueB: 'Signatory on File',
          isExactMatch: true,
          weight: 0.40
        }
      ],
      confidenceScore: 0.992,
      resolutionMethod: 'Deterministic Core-Banking KYC Resolver',
      resolutionStatus: 'CONFIRMED',
      rationale: 'Legitimate account holder identity verified through dual-factor customer onboarding records.',
      devicesObserved: ['iPhone 14 Pro (Cardholder Genuine Device - London, UK)']
    }
  ]
};

export const MOCK_GRAPH_DATA: Record<number, GraphData> = {
  1001: {
    nodes: [
      {
        id: 'node-identity-suspect',
        label: 'IDENTITY: Suspect X-9',
        type: 'IDENTITY',
        val: 28,
        color: '#a855f7',
        confidence: 0.964,
        isIdentity: true,
        attributes: {
          canonical_name: 'Consolidated Actor Shadow-99',
          resolution_status: 'PROPOSED',
          risk_level: 'CRITICAL',
          cluster_size: 6
        },
        sourceEvidence: 'gateway_telemetry_dump.json + device_sensor_packet.pcap'
      },
      {
        id: 'node-victim-anita',
        label: 'Anita Rao (Victim)',
        type: 'PERSON',
        val: 22,
        color: '#06b6d4',
        confidence: 0.985,
        attributes: {
          full_name: 'Anita Rao',
          role: 'Cardholder',
          location: 'London, UK'
        },
        sourceEvidence: 'unauthorized_tx_report_signed.pdf'
      },
      {
        id: 'node-device-imei',
        label: 'IMEI-354892019482012',
        type: 'DEVICE_IDENTIFIER',
        val: 18,
        color: '#8b5cf6',
        confidence: 0.994,
        attributes: {
          identifier_type: 'IMEI',
          model: 'Samsung Galaxy S23 Ultra',
          carrier: 'Swisscom'
        },
        sourceEvidence: 'gateway_telemetry_dump.json'
      },
      {
        id: 'node-device-hardware',
        label: 'Samsung S23 Ultra (Device)',
        type: 'DEVICE',
        val: 16,
        color: '#6366f1',
        confidence: 0.941,
        attributes: {
          device_name: 'Samsung Galaxy S23 Ultra',
          device_type: 'Mobile Phone',
          state: 'Observed at Zurich POS'
        },
        sourceEvidence: 'gateway_telemetry_dump.json'
      },
      {
        id: 'node-ip-germany',
        label: '198.51.100.42 (IP)',
        type: 'IP_ADDRESS',
        val: 16,
        color: '#f97316',
        confidence: 0.971,
        attributes: {
          ip_address: '198.51.100.42',
          asn: 'Cloudflare / M247 VPN Node',
          geo: 'Frankfurt, Germany'
        },
        sourceEvidence: 'gateway_telemetry_dump.json'
      },
      {
        id: 'node-phone-swiss',
        label: '+41-79-402-9182',
        type: 'PHONE_NUMBER',
        val: 15,
        color: '#10b981',
        confidence: 0.938,
        attributes: {
          number: '+41-79-402-9182',
          network: 'Swisscom Mobile MVNO'
        },
        sourceEvidence: 'gateway_telemetry_dump.json'
      },
      {
        id: 'node-tx-fraud',
        label: 'TX $4,850 (Fraudulent)',
        type: 'TRANSACTION',
        val: 20,
        color: '#eab308',
        confidence: 0.998,
        attributes: {
          transaction_id: 'TX-89201-FRAUD',
          amount: 4850.00,
          currency: 'USD',
          timestamp: '2026-08-24 22:18:40 UTC'
        },
        sourceEvidence: 'unauthorized_tx_report_signed.pdf'
      },
      {
        id: 'node-account-card',
        label: 'VISA ************9941',
        type: 'ACCOUNT',
        val: 18,
        color: '#14b8a6',
        confidence: 0.99,
        attributes: {
          account_type: 'Infinite Card',
          issuing_bank: 'National Reserve Bank'
        },
        sourceEvidence: 'unauthorized_tx_report_signed.pdf'
      },
      {
        id: 'node-crypto-wallet',
        label: 'Wallet 0x71C...b29F',
        type: 'WALLET_ADDRESS',
        val: 17,
        color: '#ec4899',
        confidence: 0.953,
        attributes: {
          wallet_address: '0x71C434547942eBB41C5209320bC4f8101412b29F',
          blockchain: 'Ethereum',
          balance: '14.82 ETH'
        },
        sourceEvidence: 'device_sensor_packet.pcap'
      },
      {
        id: 'node-org-apex',
        label: 'Apex Settle International',
        type: 'ORGANIZATION',
        val: 19,
        color: '#3b82f6',
        confidence: 0.962,
        attributes: {
          organization_name: 'Apex Settle International Ltd',
          headquarters: 'Zurich, Switzerland'
        },
        sourceEvidence: 'gateway_telemetry_dump.json'
      },
      {
        id: 'node-loc-zurich',
        label: 'Zurich Airport POS 8849',
        type: 'LOCATION',
        val: 15,
        color: '#84cc16',
        confidence: 0.92,
        attributes: {
          location_name: 'Zurich Airport POS 8849',
          country: 'Switzerland'
        },
        sourceEvidence: 'unauthorized_tx_report_signed.pdf'
      },
      {
        id: 'node-doc-report',
        label: 'Unauthorized TX Report',
        type: 'DOCUMENT',
        val: 14,
        color: '#64748b',
        confidence: 0.99,
        attributes: {
          document_number: 'REF-4410',
          type: 'Police / Fraud Intake'
        },
        sourceEvidence: 'unauthorized_tx_report_signed.pdf'
      },
      {
        id: 'node-user-darkshadow',
        label: 'user: darkshadow_trader',
        type: 'USERNAME',
        val: 15,
        color: '#f43f5e',
        confidence: 0.884,
        attributes: {
          username: 'darkshadow_trader',
          platform: 'Apex P2P Escrow'
        },
        sourceEvidence: 'device_sensor_packet.pcap'
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-device-imei',
        target: 'node-identity-suspect',
        relationshipName: 'RESOLVED_TO',
        label: 'RESOLVED_TO',
        confidence: 0.964,
        evidenceBacked: true,
        sourceEvidence: 'gateway_telemetry_dump.json',
        attributes: {
          confidence_score: 0.964,
          resolution_method: 'GNN-ER-v3 Hardware Linkage',
          resolution_status: 'PROPOSED'
        }
      },
      {
        id: 'edge-2',
        source: 'node-phone-swiss',
        target: 'node-identity-suspect',
        relationshipName: 'RESOLVED_TO',
        label: 'RESOLVED_TO',
        confidence: 0.938,
        evidenceBacked: true,
        sourceEvidence: 'gateway_telemetry_dump.json',
        attributes: {
          confidence_score: 0.938,
          resolution_method: 'SIM-IMSI Telemetry Match',
          resolution_status: 'PROPOSED'
        }
      },
      {
        id: 'edge-3',
        source: 'node-ip-germany',
        target: 'node-identity-suspect',
        relationshipName: 'RESOLVED_TO',
        label: 'RESOLVED_TO',
        confidence: 0.971,
        evidenceBacked: true,
        sourceEvidence: 'gateway_telemetry_dump.json',
        attributes: {
          confidence_score: 0.971,
          resolution_method: 'Session Token Correlation',
          resolution_status: 'PROPOSED'
        }
      },
      {
        id: 'edge-4',
        source: 'node-device-imei',
        target: 'node-device-hardware',
        relationshipName: 'OBSERVED_ON',
        label: 'OBSERVED_ON',
        confidence: 0.99,
        evidenceBacked: true,
        sourceEvidence: 'gateway_telemetry_dump.json',
        attributes: {
          first_seen_at: '2026-08-24T22:15:00Z',
          last_seen_at: '2026-08-24T22:18:40Z'
        }
      },
      {
        id: 'edge-5',
        source: 'node-identity-suspect',
        target: 'node-user-darkshadow',
        relationshipName: 'USED_IDENTIFIER',
        label: 'USED_IDENTIFIER',
        confidence: 0.884,
        evidenceBacked: true,
        sourceEvidence: 'device_sensor_packet.pcap',
        attributes: {
          valid_from: '2026-08-24T22:17:00Z',
          confidence_score: 0.884
        }
      },
      {
        id: 'edge-6',
        source: 'node-user-darkshadow',
        target: 'node-crypto-wallet',
        relationshipName: 'OWNS',
        label: 'OWNS',
        confidence: 0.953,
        evidenceBacked: true,
        sourceEvidence: 'device_sensor_packet.pcap',
        attributes: {
          ownership_percentage: 1.0,
          start_date: '2026-07-12'
        }
      },
      {
        id: 'edge-7',
        source: 'node-tx-fraud',
        target: 'node-crypto-wallet',
        relationshipName: 'TRANSFERRED_TO',
        label: 'TRANSFERRED_TO',
        confidence: 0.962,
        evidenceBacked: true,
        sourceEvidence: 'device_sensor_packet.pcap',
        attributes: {
          amount: 4850.00,
          currency: 'USD (Converted to 1.84 ETH)',
          transfer_date: '2026-08-24T22:18:42Z'
        }
      },
      {
        id: 'edge-8',
        source: 'node-victim-anita',
        target: 'node-account-card',
        relationshipName: 'OWNS',
        label: 'OWNS',
        confidence: 0.998,
        evidenceBacked: true,
        sourceEvidence: 'unauthorized_tx_report_signed.pdf',
        attributes: {
          ownership_percentage: 1.0,
          role: 'Primary Account Holder'
        }
      },
      {
        id: 'edge-9',
        source: 'node-tx-fraud',
        target: 'node-account-card',
        relationshipName: 'PART_OF',
        label: 'DEBITED_FROM',
        confidence: 0.998,
        evidenceBacked: true,
        sourceEvidence: 'unauthorized_tx_report_signed.pdf',
        attributes: {
          amount: 4850.00,
          currency: 'USD'
        }
      },
      {
        id: 'edge-10',
        source: 'node-tx-fraud',
        target: 'node-loc-zurich',
        relationshipName: 'OCCURRED_AT',
        label: 'OCCURRED_AT',
        confidence: 0.94,
        evidenceBacked: true,
        sourceEvidence: 'unauthorized_tx_report_signed.pdf',
        attributes: {
          occurrence_date: '2026-08-24T22:18:40Z'
        }
      },
      {
        id: 'edge-11',
        source: 'node-crypto-wallet',
        target: 'node-org-apex',
        relationshipName: 'ASSOCIATED_WITH',
        label: 'ASSOCIATED_WITH',
        confidence: 0.962,
        evidenceBacked: true,
        sourceEvidence: 'gateway_telemetry_dump.json',
        attributes: {
          association_type: 'P2P Liquidity Pool Gateway'
        }
      },
      {
        id: 'edge-12',
        source: 'node-victim-anita',
        target: 'node-doc-report',
        relationshipName: 'MENTIONED_IN',
        label: 'MENTIONED_IN',
        confidence: 0.995,
        evidenceBacked: true,
        sourceEvidence: 'unauthorized_tx_report_signed.pdf',
        attributes: {
          page_number: 1,
          mention_text: 'Complainant Mrs. Anita Rao'
        }
      },
      {
        id: 'edge-13',
        source: 'node-identity-suspect',
        target: 'node-victim-anita',
        relationshipName: 'CONTRADICTS',
        label: 'CONTRADICTS_CLAIM',
        confidence: 0.982,
        evidenceBacked: true,
        sourceEvidence: 'unauthorized_tx_report_signed.pdf vs gateway_telemetry_dump.json',
        attributes: {
          contradiction_type: 'Physical Proximity vs Remote Device Use',
          review_status: 'FLAGGED_FOR_INVESTIGATION'
        }
      },
      {
        id: 'edge-14',
        source: 'node-device-imei',
        target: 'node-ip-germany',
        relationshipName: 'CO_OCCURRED_WITH',
        label: 'CO_OCCURRED_WITH',
        confidence: 0.975,
        evidenceBacked: true,
        sourceEvidence: 'gateway_telemetry_dump.json',
        attributes: {
          co_occurrence_count: 14,
          window_seconds: 5
        }
      }
    ]
  }
};
