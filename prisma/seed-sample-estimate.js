const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.estimate.findFirst({
    where: { estimateNumber: 'PC-2026-0001' },
  });
  if (existing) {
    console.log('Sample estimate already exists.');
    return;
  }

  const activeVersion = await prisma.pricingVersion.findFirst({
    where: { isActive: true },
  });

  if (!activeVersion) {
    console.log('No active pricing version found.');
    return;
  }

  const rawRequirement =
    'The customer currently has around 40 servers on-premise and wants to migrate them to AWS. They need high availability, automated backups, disaster recovery, monitoring, Terraform and CI/CD. They want the migration completed within two months.';

  const structuredRequirement = {
    summary: 'Cloud Infrastructure Migration to AWS for ~40 workloads with enterprise resilience and automated deployment tooling.',
    serviceKeys: { value: ['cloud-migration'], source: 'EXPLICIT', confidence: 'HIGH' },
    primaryServiceKey: { value: 'cloud-migration', source: 'EXPLICIT', confidence: 'HIGH' },
    currentEnvironment: { value: 'On-Premise Datacenter', source: 'EXPLICIT', confidence: 'HIGH' },
    targetEnvironment: { value: 'Amazon Web Services (AWS)', source: 'EXPLICIT', confidence: 'HIGH' },
    environmentCode: { value: 'aws', source: 'EXPLICIT', confidence: 'HIGH' },
    workloadCount: { value: 40, source: 'EXPLICIT', confidence: 'HIGH' },
    applicationCount: { value: null, source: 'NOT_PROVIDED', confidence: 'LOW' },
    scaleCode: { value: '26_50', source: 'EXPLICIT', confidence: 'HIGH' },
    storageEstimate: { value: null, source: 'NOT_PROVIDED', confidence: 'NONE' },
    databaseDetails: { value: null, source: 'NOT_PROVIDED', confidence: 'NONE' },
    complexity: { value: 'high', source: 'INFERRED', confidence: 'HIGH' },
    complexityCode: { value: 'high', source: 'INFERRED', confidence: 'HIGH' },
    timeline: { value: '~2 months (8 weeks)', source: 'EXPLICIT', confidence: 'HIGH' },
    timelineCode: { value: 'standard', source: 'EXPLICIT', confidence: 'HIGH' },
    detectedAddOnCodes: { value: ['ha', 'dr', 'terraform', 'cicd', 'monitoring'], source: 'EXPLICIT', confidence: 'HIGH' },
    technicalRequirements: [
      'Multi-AZ High Availability Architecture',
      'Cross-Region Disaster Recovery & Automated Failover',
      'Modular Infrastructure as Code (Terraform)',
      'Automated CI/CD Deployment Pipelines',
      'Centralized Observability & Metric Monitoring',
    ],
    assumptions: [
      'All 40 source workloads are migration-ready with supported OS versions.',
      'No major core application refactoring or custom software rewrite included in baseline.',
      'Client will provide dedicated administrative IAM access and scheduled cutover maintenance windows.',
      'Cloud provider infrastructure consumption fees billed directly to client account.',
      'Final milestone delivery plan subject to a formal 3-day technical discovery assessment.',
    ],
    unknowns: [
      {
        field: 'Database Architecture & Complexity',
        description: 'Database engines, clustering, data volumes, and permissible replication latency are unspecified.',
        affectsPricing: true,
        isCritical: true,
        suggestedQuestion: 'What database engines, current sizes, and clustering models are in scope for migration?',
      },
      {
        field: 'Disaster Recovery RPO & RTO Targets',
        description: 'DR recovery point (RPO) and recovery time (RTO) objectives are undefined. This significantly affects infrastructure redundancy design and tooling costs.',
        affectsPricing: true,
        isCritical: true,
        suggestedQuestion: 'What are the required Recovery Time Objective (RTO) and Recovery Point Objective (RPO) in case of a disaster?',
      },
    ],
  };

  const calculationBreakdown = [
    'Base Service Fee (Cloud Infrastructure Migration): ₹3,00,000',
    'Target Environment Factor (Amazon Web Services (AWS)): ×1',
    'Workload Scale Factor (26 – 50 Workloads / VMs): ×1.6',
    'Complexity Factor (High Complexity): ×1.35',
    'Timeline Urgency Factor (Standard (8 – 12 weeks)): ×1',
    'Scaled Infrastructure Base: ₹6,48,000',
    'Add-Ons Total (5 selected): +₹1,75,000',
    '  • High Availability Architecture (Multi-AZ): +₹40,000',
    '  • Disaster Recovery (Cross-Region RPO/RTO): +₹60,000',
    '  • Infrastructure as Code (Terraform / OpenTofu): +₹30,000',
    '  • Automated CI/CD Deployment Pipelines: +₹25,000',
    '  • Centralized Observability & Monitoring: +₹20,000',
    'Subtotal: ₹8,23,000',
    'Commercial Discount Applied: -₹82,300 (10%)',
    'Final Calculated: ₹7,40,700',
  ];

  const benchmarkComparison = {
    benchmarkFound: true,
    benchmarkLow: 500000,
    benchmarkHigh: 700000,
    currency: 'INR',
    region: 'India',
    sourceName: 'Indian Cloud Consulting Market Survey (Indicative)',
    confidence: 'High',
    varianceVsRecommended: '6% above standard benchmark upper bound (Premium tier with full DR/IaC)',
  };

  const estimate = await prisma.estimate.create({
    data: {
      estimateNumber: 'PC-2026-0001',
      customerName: 'Vikram Sharma',
      companyName: 'AcroPulse Technologies',
      email: 'vikram.s@acropulse.tech',
      phone: '+91 98201 54321',
      website: 'https://acropulse.tech',
      rawRequirement,
      structuredRequirement: JSON.stringify(structuredRequirement),
      pricingVersionId: activeVersion.id,
      pricingSnapshot: activeVersion.configSnapshot,
      status: 'GENERATED',
      calculatedBasePrice: 648000,
      calculatedAddOnsTotal: 175000,
      calculatedSubtotal: 823000,
      discountPercentage: 10,
      discountAmount: 82300,
      finalPrice: 740700,
      indicativeLow: 681444,
      indicativeHigh: 799956,
      timelineWeeksMin: 7,
      timelineWeeksMax: 11,
      assumptions: JSON.stringify(structuredRequirement.assumptions),
      unknowns: JSON.stringify(structuredRequirement.unknowns),
      calculationBreakdown: JSON.stringify(calculationBreakdown),
      benchmarkComparison: JSON.stringify(benchmarkComparison),
      internalNotes: 'Client is an enterprise healthcare SaaS evaluating AWS migration. Highly sensitive to RTO/RPO downtime.',
      createdBy: 'PrimeCore Estimator',
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'ESTIMATE',
      entityId: estimate.id,
      action: 'CREATE',
      performedBy: 'PrimeCore Estimator',
      newValue: JSON.stringify({
        estimateNumber: 'PC-2026-0001',
        customer: 'Vikram Sharma',
        company: 'AcroPulse Technologies',
        finalPrice: 740700,
      }),
      reason: 'Sample benchmark seed estimate for 40-server AWS migration',
    },
  });

  console.log('Sample estimate PC-2026-0001 seeded successfully.');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
