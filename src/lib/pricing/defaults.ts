import { PricingConfigurationSnapshot } from './types';

/**
 * DEVELOPMENT & BOOTSTRAP SAMPLE CONFIGURATION
 * 
 * IMPORTANT: These commercial rates and multiplier values are DEVELOPMENT SAMPLE DATA.
 * They MUST be reviewed, configured, and officially approved by PrimeCore management
 * before generating binding commercial proposals for customers.
 */
export const SAMPLE_PRICING_VERSION = '2026.10.01-SAMPLE';

export const DEFAULT_PRICING_CONFIG: PricingConfigurationSnapshot = {
  version: SAMPLE_PRICING_VERSION,
  description: 'SAMPLE BOOTSTRAP CONFIGURATION — Must be configured with real PrimeCore rates before production',
  maxDiscountPercentage: 20, // Default 20% policy cap
  spreadPercentage: 0.08, // ±8% indicative envelope
  services: [
    {
      key: 'cloud-migration',
      name: 'Cloud Infrastructure Migration',
      description: 'Migration of compute, storage, databases, and networking from on-premise or cloud to target cloud.',
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
      description: 'Automated CI/CD pipelines, GitOps workflows, automated testing gates, and release governance.',
      basePrice: 180000,
      minPrice: 100000,
      maxPrice: 1200000,
      active: true,
    },
    {
      key: 'kubernetes-platform',
      name: 'Kubernetes Platform Engineering (EKS/GKE/AKS)',
      description: 'Container orchestration, ingress controllers, autoscaling, service mesh, and secret management.',
      basePrice: 260000,
      minPrice: 140000,
      maxPrice: 1800000,
      active: true,
    },
    {
      key: 'disaster-recovery',
      name: 'Disaster Recovery & Business Continuity',
      description: 'Cross-region DR architecture, automated failover orchestrations, and RPO/RTO verification drills.',
      basePrice: 200000,
      minPrice: 110000,
      maxPrice: 1400000,
      active: true,
    },
    {
      key: 'cost-optimization',
      name: 'FinOps & Cloud Cost Optimization',
      description: 'Architectural cost audit, rightsizing, reservations, spot instances, and billing dashboard automation.',
      basePrice: 150000,
      minPrice: 80000,
      maxPrice: 900000,
      active: true,
    },
  ],
  multipliers: [
    // Target Environment Multipliers
    { category: 'environment', code: 'aws', label: 'Amazon Web Services (AWS)', multiplier: 1.0, description: 'Standard AWS cloud baseline', active: true },
    { category: 'environment', code: 'azure', label: 'Microsoft Azure', multiplier: 1.05, description: 'Azure enterprise cloud setup', active: true },
    { category: 'environment', code: 'gcp', label: 'Google Cloud Platform (GCP)', multiplier: 1.05, description: 'Google Cloud Platform baseline', active: true },
    { category: 'environment', code: 'hybrid', label: 'Hybrid / Multi-Cloud', multiplier: 1.30, description: 'Interconnected on-prem and cloud interconnects', active: true },
    { category: 'environment', code: 'on_premise', label: 'Private Cloud / On-Premise', multiplier: 1.15, description: 'VMware / OpenStack / Bare-metal target', active: true },

    // Workload Scale Multipliers
    { category: 'scale', code: '1_10', label: '1 – 10 Workloads / VMs', multiplier: 1.00, description: 'Small footprint workload', active: true },
    { category: 'scale', code: '11_25', label: '11 – 25 Workloads / VMs', multiplier: 1.25, description: 'Medium team workload', active: true },
    { category: 'scale', code: '26_50', label: '26 – 50 Workloads / VMs', multiplier: 1.60, description: 'Enterprise department scale (~40 VMs)', active: true },
    { category: 'scale', code: '51_100', label: '51 – 100 Workloads / VMs', multiplier: 2.10, description: 'Large enterprise fleet', active: true },
    { category: 'scale', code: '101_plus', label: '101+ Workloads / VMs', multiplier: 2.80, description: 'Hyperscale corporate datacenter footprint', active: true },

    // Complexity Multipliers
    { category: 'complexity', code: 'low', label: 'Low Complexity', multiplier: 0.85, description: 'Lift-and-shift, minimal database dependencies', active: true },
    { category: 'complexity', code: 'medium', label: 'Medium Complexity', multiplier: 1.00, description: 'Standard multi-tier apps with managed databases', active: true },
    { category: 'complexity', code: 'high', label: 'High Complexity', multiplier: 1.35, description: 'Complex network topologies, clustering, legacy dependencies', active: true },
    { category: 'complexity', code: 'enterprise', label: 'Enterprise Mission-Critical', multiplier: 1.75, description: 'Zero-downtime, strict compliance, multi-tenancy', active: true },

    // Timeline Multipliers
    { category: 'timeline', code: 'flexible', label: 'Flexible (> 12 weeks)', multiplier: 0.95, description: 'Paced migration without deadline pressure', active: true },
    { category: 'timeline', code: 'standard', label: 'Standard (8 – 12 weeks)', multiplier: 1.00, description: 'Standard professional services pacing (~2-3 months)', active: true },
    { category: 'timeline', code: 'accelerated', label: 'Accelerated (4 – 7 weeks)', multiplier: 1.20, description: 'Sprint delivery requiring dedicated squads', active: true },
    { category: 'timeline', code: 'urgent', label: 'Urgent (< 4 weeks)', multiplier: 1.45, description: 'Emergency / expedited timeline with overtime staffing', active: true },
  ],
  addOns: [
    { code: 'ha', name: 'High Availability Architecture (Multi-AZ)', description: 'Multi-AZ setup with automatic health checks and failovers', pricingType: 'FIXED', value: 40000, active: true },
    { code: 'dr', name: 'Disaster Recovery (Cross-Region RPO/RTO)', description: 'Secondary region automated pilot light / warm standby replication', pricingType: 'FIXED', value: 60000, active: true },
    { code: 'terraform', name: 'Infrastructure as Code (Terraform / OpenTofu)', description: 'Modularized, state-managed IaC covering all cloud resources', pricingType: 'FIXED', value: 30000, active: true },
    { code: 'cicd', name: 'Automated CI/CD Deployment Pipelines', description: 'Pipelines with automated linting, test, and deploy stages', pricingType: 'FIXED', value: 25000, active: true },
    { code: 'monitoring', name: 'Centralized Observability & Monitoring', description: 'Dashboards, metrics, and incident alert routes', pricingType: 'FIXED', value: 20000, active: true },
    { code: 'security_hardening', name: 'Security Hardening & CIS Benchmark Compliance', description: 'IAM least privilege, VPC flow logs, KMS encryption, WAF rules', pricingType: 'FIXED', value: 45000, active: true },
    { code: 'support_24_7', name: '24/7 Managed Infrastructure Support Setup', description: 'Initial operational onboarding, runbooks, and 24/7 rotation handover', pricingType: 'FIXED', value: 50000, active: true },
    { code: 'backup_automation', name: 'Automated Backup & Snapshot Policies', description: 'Cross-account/cross-region snapshot lifecycle policies and retention rules', pricingType: 'FIXED', value: 20000, active: true },
    { code: 'kubernetes', name: 'Container Orchestration & Microservices Migration', description: 'Dockerizing services, Helm charts, ingress controllers, cert-manager', pricingType: 'FIXED', value: 65000, active: true },
  ],
  benchmarks: [],
};
