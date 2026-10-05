const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return { salt, hash: derivedKey.toString('hex') };
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.log('Production environment detected. Seeding sample data is prohibited.');
    process.exit(0);
  }

  console.log('Seeding system configuration for development...');

  const services = [
    {
      key: 'cloud-migration',
      name: 'Cloud Infrastructure Migration',
      description: 'Migration of compute, storage, databases, and networking to target cloud.',
      basePrice: 300000,
      minPrice: 150000,
      maxPrice: 2500000,
      active: true,
    },
    {
      key: 'cloud-architecture',
      name: 'Well-Architected Cloud Foundation',
      description: 'Landing zone setup, VPC topology, IAM hardening, and security baselining.',
      basePrice: 220000,
      minPrice: 120000,
      maxPrice: 1500000,
      active: true,
    },
    {
      key: 'devops-automation',
      name: 'DevOps & CI/CD Platform Modernization',
      description: 'Automated CI/CD pipelines, GitOps workflows, automated testing gates.',
      basePrice: 180000,
      minPrice: 100000,
      maxPrice: 1200000,
      active: true,
    },
    {
      key: 'kubernetes-platform',
      name: 'Kubernetes Platform Engineering',
      description: 'Production container orchestration, ingress controllers, autoscaling, service mesh.',
      basePrice: 260000,
      minPrice: 140000,
      maxPrice: 1800000,
      active: true,
    },
    {
      key: 'disaster-recovery',
      name: 'Disaster Recovery & Business Continuity',
      description: 'Cross-region DR architecture, automated failover orchestrations, and drills.',
      basePrice: 200000,
      minPrice: 110000,
      maxPrice: 1400000,
      active: true,
    },
    {
      key: 'cost-optimization',
      name: 'FinOps & Cloud Cost Optimization',
      description: 'Cost audit, rightsizing, reservations, spot instances, and billing dashboard automation.',
      basePrice: 150000,
      minPrice: 80000,
      maxPrice: 900000,
      active: true,
    },
  ];

  const multipliers = [
    { category: 'environment', code: 'aws', label: 'Amazon Web Services (AWS)', multiplier: 1.0, active: true },
    { category: 'environment', code: 'azure', label: 'Microsoft Azure', multiplier: 1.05, active: true },
    { category: 'environment', code: 'gcp', label: 'Google Cloud Platform (GCP)', multiplier: 1.05, active: true },
    { category: 'environment', code: 'hybrid', label: 'Hybrid / Multi-Cloud', multiplier: 1.30, active: true },
    { category: 'environment', code: 'on_premise', label: 'Private Cloud / On-Premise', multiplier: 1.15, active: true },

    { category: 'scale', code: '1_10', label: '1 – 10 Workloads / VMs', multiplier: 1.00, active: true },
    { category: 'scale', code: '11_25', label: '11 – 25 Workloads / VMs', multiplier: 1.25, active: true },
    { category: 'scale', code: '26_50', label: '26 – 50 Workloads / VMs', multiplier: 1.60, active: true },
    { category: 'scale', code: '51_100', label: '51 – 100 Workloads / VMs', multiplier: 2.10, active: true },
    { category: 'scale', code: '101_plus', label: '101+ Workloads / VMs', multiplier: 2.80, active: true },

    { category: 'complexity', code: 'low', label: 'Low Complexity', multiplier: 0.85, active: true },
    { category: 'complexity', code: 'medium', label: 'Medium Complexity', multiplier: 1.00, active: true },
    { category: 'complexity', code: 'high', label: 'High Complexity', multiplier: 1.35, active: true },
    { category: 'complexity', code: 'enterprise', label: 'Enterprise Mission-Critical', multiplier: 1.75, active: true },

    { category: 'timeline', code: 'flexible', label: 'Flexible (> 12 weeks)', multiplier: 0.95, active: true },
    { category: 'timeline', code: 'standard', label: 'Standard (8 – 12 weeks)', multiplier: 1.00, active: true },
    { category: 'timeline', code: 'accelerated', label: 'Accelerated (4 – 7 weeks)', multiplier: 1.20, active: true },
    { category: 'timeline', code: 'urgent', label: 'Urgent (< 4 weeks)', multiplier: 1.45, active: true },
  ];

  const addOns = [
    { code: 'ha', name: 'High Availability Architecture (Multi-AZ)', description: 'Multi-AZ redundant deployment', pricingType: 'FIXED', value: 40000, active: true },
    { code: 'dr', name: 'Disaster Recovery (Cross-Region RPO/RTO)', description: 'Automated failover replication', pricingType: 'FIXED', value: 60000, active: true },
    { code: 'terraform', name: 'Infrastructure as Code (Terraform)', description: 'Modularized, state-managed IaC', pricingType: 'FIXED', value: 30000, active: true },
    { code: 'cicd', name: 'Automated CI/CD Pipelines', description: 'GitHub Actions / GitLab CI pipelines', pricingType: 'FIXED', value: 25000, active: true },
    { code: 'monitoring', name: 'Centralized Observability & Monitoring', description: 'Metrics, dashboards, alert routes', pricingType: 'FIXED', value: 20000, active: true },
    { code: 'security_hardening', name: 'Security Hardening & CIS Benchmarks', description: 'IAM, KMS, VPC flow logs, WAF', pricingType: 'FIXED', value: 45000, active: true },
    { code: 'support_24_7', name: '24/7 Managed Support Setup', description: 'Operational onboarding and handover', pricingType: 'FIXED', value: 50000, active: true },
    { code: 'backup_automation', name: 'Automated Backup Policies', description: 'Snapshot lifecycle policies', pricingType: 'FIXED', value: 20000, active: true },
    { code: 'kubernetes', name: 'Kubernetes Platform Setup', description: 'Cluster provisioning, Helm charts', pricingType: 'FIXED', value: 65000, active: true },
  ];

  // Upsert Services
  for (const s of services) {
    await prisma.service.upsert({ where: { key: s.key }, update: s, create: s });
  }

  // Upsert Multipliers
  for (const m of multipliers) {
    await prisma.pricingMultiplier.upsert({ where: { code: m.code }, update: m, create: m });
  }

  // Upsert AddOns
  for (const a of addOns) {
    await prisma.addOn.upsert({ where: { code: a.code }, update: a, create: a });
  }

  // Active Pricing Version Snapshot
  const snapshotJson = JSON.stringify({
    version: '2026.10.01',
    description: 'Initial System Pricing Snapshot',
    maxDiscountPercentage: 20,
    spreadPercentage: 0.08,
    currency: 'INR',
    services,
    multipliers,
    addOns,
    benchmarks: [],
  });

  await prisma.pricingVersion.upsert({
    where: { version: '2026.10.01' },
    update: {
      status: 'ACTIVE',
      isActive: true,
      maxDiscountPercentage: 20,
      currency: 'INR',
      configSnapshot: snapshotJson,
    },
    create: {
      version: '2026.10.01',
      description: 'Initial System Pricing Snapshot',
      status: 'ACTIVE',
      isActive: true,
      maxDiscountPercentage: 20,
      currency: 'INR',
      configSnapshot: snapshotJson,
    },
  });

  console.log('System configuration initialized with pricing version 2026.10.01 (0 estimates, 0 leads).');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
