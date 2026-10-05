import { StructuredRequirement, MissingInformationItem } from './types';

/**
 * Heuristic Requirement Analyzer
 * 
 * High-precision rule-based parser used as a reliable fallback or offline engine.
 * Distinguishes explicit facts from inferences and identifies critical unknowns.
 */
export function analyzeWithHeuristics(rawText: string): StructuredRequirement {
  const lower = rawText.toLowerCase();

  // 1. Detect Environment
  let targetEnv = 'AWS';
  let envCode: 'aws' | 'azure' | 'gcp' | 'hybrid' | 'on_premise' = 'aws';
  let envSource: 'EXPLICIT' | 'INFERRED' = 'INFERRED';
  let envConfidence: 'HIGH' | 'MEDIUM' = 'MEDIUM';

  if (lower.includes('aws') || lower.includes('amazon web services')) {
    targetEnv = 'Amazon Web Services (AWS)';
    envCode = 'aws';
    envSource = 'EXPLICIT';
    envConfidence = 'HIGH';
  } else if (lower.includes('azure') || lower.includes('microsoft azure')) {
    targetEnv = 'Microsoft Azure';
    envCode = 'azure';
    envSource = 'EXPLICIT';
    envConfidence = 'HIGH';
  } else if (lower.includes('gcp') || lower.includes('google cloud')) {
    targetEnv = 'Google Cloud Platform (GCP)';
    envCode = 'gcp';
    envSource = 'EXPLICIT';
    envConfidence = 'HIGH';
  } else if (lower.includes('hybrid') || lower.includes('multi-cloud')) {
    targetEnv = 'Hybrid / Multi-Cloud';
    envCode = 'hybrid';
    envSource = 'EXPLICIT';
    envConfidence = 'HIGH';
  }

  // Current environment
  let currentEnv = 'Not explicitly stated';
  let currentEnvSource: 'EXPLICIT' | 'NOT_PROVIDED' = 'NOT_PROVIDED';
  if (lower.includes('on-prem') || lower.includes('on premise') || lower.includes('datacenter') || lower.includes('physical server')) {
    currentEnv = 'On-Premise Datacenter';
    currentEnvSource = 'EXPLICIT';
  } else if (lower.includes('colo') || lower.includes('colocation')) {
    currentEnv = 'Colocation Facility';
    currentEnvSource = 'EXPLICIT';
  }

  // 2. Workload / Server Count Extraction
  let workloadCount: number | null = null;
  let workloadSource: 'EXPLICIT' | 'NOT_PROVIDED' = 'NOT_PROVIDED';
  let workloadConfidence: 'HIGH' | 'LOW' = 'LOW';

  const serverMatch = rawText.match(/(\d+)\s*(?:physical\s*)?(?:servers?|vms?|instances?|nodes?|workloads?|machines?)/i);
  if (serverMatch && serverMatch[1]) {
    workloadCount = parseInt(serverMatch[1], 10);
    workloadSource = 'EXPLICIT';
    workloadConfidence = 'HIGH';
  }

  // Workload scale category
  let scaleCode: '1_10' | '11_25' | '26_50' | '51_100' | '101_plus' = '26_50';
  if (workloadCount !== null) {
    if (workloadCount <= 10) scaleCode = '1_10';
    else if (workloadCount <= 25) scaleCode = '11_25';
    else if (workloadCount <= 50) scaleCode = '26_50';
    else if (workloadCount <= 100) scaleCode = '51_100';
    else scaleCode = '101_plus';
  }

  // 3. Application Count
  let applicationCount: number | null = null;
  let appSource: 'EXPLICIT' | 'NOT_PROVIDED' = 'NOT_PROVIDED';
  const appMatch = rawText.match(/(\d+)\s*(?:applications?|apps?|services?|microservices?)/i);
  if (appMatch && appMatch[1]) {
    applicationCount = parseInt(appMatch[1], 10);
    appSource = 'EXPLICIT';
  }

  // 4. Detected Technical Requirements & Add-ons
  const detectedAddOns: string[] = [];
  const techRequirements: string[] = [];

  if (lower.includes('ha') || lower.includes('high availability') || lower.includes('redundant') || lower.includes('multi-az')) {
    detectedAddOns.push('ha');
    techRequirements.push('Multi-AZ High Availability Architecture');
  }

  if (lower.includes('dr') || lower.includes('disaster recovery') || lower.includes('failover') || lower.includes('business continuity')) {
    detectedAddOns.push('dr');
    techRequirements.push('Cross-Region Disaster Recovery & Automated Failover');
  }

  if (lower.includes('terraform') || lower.includes('opentofu') || lower.includes('iac') || lower.includes('infrastructure as code')) {
    detectedAddOns.push('terraform');
    techRequirements.push('Modular Infrastructure as Code (Terraform)');
  }

  if (lower.includes('ci/cd') || lower.includes('cicd') || lower.includes('pipeline') || lower.includes('automated deployment') || lower.includes('github actions') || lower.includes('gitlab')) {
    detectedAddOns.push('cicd');
    techRequirements.push('Automated CI/CD Deployment Pipelines');
  }

  if (lower.includes('monitoring') || lower.includes('grafana') || lower.includes('prometheus') || lower.includes('observability') || lower.includes('cloudwatch')) {
    detectedAddOns.push('monitoring');
    techRequirements.push('Centralized Observability & Metric Monitoring');
  }

  if (lower.includes('24/7') || lower.includes('support') || lower.includes('managed support') || lower.includes('sla')) {
    detectedAddOns.push('support_24_7');
    techRequirements.push('24/7 Managed Infrastructure Support Setup');
  }

  if (lower.includes('backup') || lower.includes('snapshot')) {
    detectedAddOns.push('backup_automation');
    techRequirements.push('Automated Cross-Region Backup Policies');
  }

  if (lower.includes('k8s') || lower.includes('kubernetes') || lower.includes('eks') || lower.includes('gke') || lower.includes('container')) {
    detectedAddOns.push('kubernetes');
    techRequirements.push('Container Orchestration & Kubernetes Platform Setup');
  }

  if (lower.includes('security') || lower.includes('hardening') || lower.includes('compliance') || lower.includes('cis') || lower.includes('soc2') || lower.includes('hipaa') || lower.includes('iso')) {
    detectedAddOns.push('security_hardening');
    techRequirements.push('Enterprise Security Hardening & CIS Benchmarks');
  }

  // 5. Service Detection
  let primaryServiceKey = 'cloud-migration';
  const serviceKeys: string[] = ['cloud-migration'];
  if (lower.includes('migrate') || lower.includes('migration') || lower.includes('move to')) {
    primaryServiceKey = 'cloud-migration';
  } else if (lower.includes('kubernetes') && !lower.includes('migration')) {
    primaryServiceKey = 'kubernetes-platform';
    serviceKeys[0] = 'kubernetes-platform';
  } else if (lower.includes('devops') || lower.includes('ci/cd')) {
    if (!lower.includes('migration')) {
      primaryServiceKey = 'devops-automation';
      serviceKeys[0] = 'devops-automation';
    }
  }

  // 6. Complexity Evaluation
  let complexity: 'low' | 'medium' | 'high' | 'enterprise' = 'medium';
  if (
    (workloadCount && workloadCount > 50) ||
    (detectedAddOns.length >= 4 && lower.includes('dr')) ||
    lower.includes('enterprise') ||
    lower.includes('zero downtime')
  ) {
    complexity = 'high';
  } else if (workloadCount && workloadCount > 100) {
    complexity = 'enterprise';
  } else if (workloadCount && workloadCount <= 10 && detectedAddOns.length <= 1) {
    complexity = 'low';
  }

  // 7. Timeline Extraction
  let timeline = 'Standard (8 – 12 weeks)';
  let timelineCode: 'flexible' | 'standard' | 'accelerated' | 'urgent' = 'standard';
  let timelineSource: 'EXPLICIT' | 'INFERRED' = 'INFERRED';

  if (lower.includes('2 months') || lower.includes('two months') || lower.includes('8 weeks') || lower.includes('60 days')) {
    timeline = '~2 months (8 weeks)';
    timelineCode = 'standard';
    timelineSource = 'EXPLICIT';
  } else if (lower.includes('1 month') || lower.includes('one month') || lower.includes('4 weeks') || lower.includes('urgent') || lower.includes('asap')) {
    timeline = '~1 month (Accelerated)';
    timelineCode = 'accelerated';
    timelineSource = 'EXPLICIT';
  } else if (lower.includes('2 weeks') || lower.includes('two weeks')) {
    timeline = '~2 weeks (Urgent)';
    timelineCode = 'urgent';
    timelineSource = 'EXPLICIT';
  } else if (lower.includes('flexible') || lower.includes('no hurry')) {
    timeline = 'Flexible (> 12 weeks)';
    timelineCode = 'flexible';
    timelineSource = 'EXPLICIT';
  }

  // 8. Missing Information / Unknowns Detection (Prompt Section 9)
  const unknowns: MissingInformationItem[] = [];

  // Database unknown?
  if (!lower.includes('database') && !lower.includes('rds') && !lower.includes('mysql') && !lower.includes('postgres') && !lower.includes('oracle') && !lower.includes('sql server')) {
    unknowns.push({
      field: 'Database Architecture & Complexity',
      description: 'Database engines, clustering, data volumes, and permissible replication latency are unspecified.',
      affectsPricing: true,
      isCritical: true,
      suggestedQuestion: 'What database engines, current sizes, and clustering models are in scope for migration?',
    });
  }

  // DR RPO / RTO unknown?
  if (detectedAddOns.includes('dr') && !lower.includes('rpo') && !lower.includes('rto')) {
    unknowns.push({
      field: 'Disaster Recovery RPO & RTO Targets',
      description: 'DR recovery point (RPO) and recovery time (RTO) objectives are undefined. This significantly affects infrastructure redundancy design and tooling costs.',
      affectsPricing: true,
      isCritical: true,
      suggestedQuestion: 'What are the required Recovery Time Objective (RTO) and Recovery Point Objective (RPO) in case of a disaster?',
    });
  }

  // Compliance / Governance unknown?
  if (!lower.includes('compliance') && !lower.includes('hipaa') && !lower.includes('soc') && !lower.includes('pci') && !lower.includes('iso')) {
    unknowns.push({
      field: 'Regulatory Compliance & Governance Standards',
      description: 'No regulatory compliance framework (e.g., SOC 2, ISO 27001, HIPAA, PCI-DSS) was specified.',
      affectsPricing: true,
      isCritical: false,
      suggestedQuestion: 'Are there specific regulatory compliance frameworks or data residency laws that the architecture must satisfy?',
    });
  }

  // 24/7 Support SLA unknown?
  if (detectedAddOns.includes('support_24_7') && !lower.includes('sla')) {
    unknowns.push({
      field: 'Managed Support SLAs & Response Times',
      description: 'Desired incident response time SLAs (e.g. 15-min P1 response vs 1-hour response) are unspecified.',
      affectsPricing: true,
      isCritical: false,
      suggestedQuestion: 'What incident response times and severity tiers are required for the post-migration managed support contract?',
    });
  }

  // Application dependencies / refactoring unknown?
  unknowns.push({
    field: 'Application Dependencies & Modernization Readiness',
    description: 'Level of legacy software dependencies and whether re-platforming or code adjustments are required.',
    affectsPricing: true,
    isCritical: true,
    suggestedQuestion: 'Are existing application runtimes and operating systems directly compatible with modern cloud virtual machines or containers without code refactoring?',
  });

  // 9. Standard Technical Assumptions
  const assumptions = [
    'All source workloads and databases are migration-ready with supported OS versions.',
    'No core application refactoring or custom software rewrite is included in the base migration scope.',
    'PrimeCore team will be granted appropriate administrative cloud IAM access and maintenance windows.',
    'Cloud provider consumption fees (compute, egress, storage) will be billed directly to the client account.',
    'Final detailed architecture and execution milestones are subject to a formal technical discovery assessment.',
  ];

  return {
    summary: `Identified requirement for ${targetEnv} ${primaryServiceKey.replace('-', ' ')} with approx. ${workloadCount ?? 'unspecified'} workloads across ${techRequirements.length} specialized technical specifications.`,
    serviceKeys: {
      value: serviceKeys,
      source: 'EXPLICIT',
      confidence: 'HIGH',
    },
    primaryServiceKey: {
      value: primaryServiceKey,
      source: 'EXPLICIT',
      confidence: 'HIGH',
    },
    currentEnvironment: {
      value: currentEnv,
      source: currentEnvSource,
      confidence: currentEnvSource === 'EXPLICIT' ? 'HIGH' : 'MEDIUM',
    },
    targetEnvironment: {
      value: targetEnv,
      source: envSource,
      confidence: envConfidence,
    },
    environmentCode: {
      value: envCode,
      source: envSource,
      confidence: envConfidence,
    },
    workloadCount: {
      value: workloadCount,
      source: workloadSource,
      confidence: workloadConfidence,
    },
    applicationCount: {
      value: applicationCount,
      source: appSource,
      confidence: appSource === 'EXPLICIT' ? 'HIGH' : 'LOW',
    },
    scaleCode: {
      value: scaleCode,
      source: workloadCount !== null ? 'EXPLICIT' : 'DEFAULT',
      confidence: workloadCount !== null ? 'HIGH' : 'MEDIUM',
    },
    storageEstimate: {
      value: null,
      source: 'NOT_PROVIDED',
      confidence: 'NONE',
    },
    databaseDetails: {
      value: null,
      source: 'NOT_PROVIDED',
      confidence: 'NONE',
    },
    complexity: {
      value: complexity,
      source: 'INFERRED',
      confidence: 'HIGH',
    },
    complexityCode: {
      value: complexity,
      source: 'INFERRED',
      confidence: 'HIGH',
    },
    timeline: {
      value: timeline,
      source: timelineSource,
      confidence: timelineSource === 'EXPLICIT' ? 'HIGH' : 'MEDIUM',
    },
    timelineCode: {
      value: timelineCode,
      source: timelineSource,
      confidence: timelineSource === 'EXPLICIT' ? 'HIGH' : 'MEDIUM',
    },
    detectedAddOnCodes: {
      value: detectedAddOns,
      source: detectedAddOns.length > 0 ? 'EXPLICIT' : 'DEFAULT',
      confidence: 'HIGH',
    },
    technicalRequirements: techRequirements,
    securityRequirements: lower.includes('security')
      ? ['CIS Benchmark Hardening', 'IAM Least Privilege']
      : ['Standard Cloud Security Baseline'],
    availabilityRequirements: detectedAddOns.includes('ha')
      ? ['Multi-AZ redundant deployment with automated load balancers']
      : ['Single region deployment'],
    drRequirements: detectedAddOns.includes('dr')
      ? ['Cross-Region replication and pilot-light DR environment']
      : ['Standard snapshot retention'],
    devopsRequirements: detectedAddOns.includes('cicd')
      ? ['Automated CI/CD pipelines', 'IaC Terraform templates']
      : ['Manual or standard script deployments'],
    supportRequirements: detectedAddOns.includes('support_24_7')
      ? ['24/7 Managed Infrastructure Operations Handover']
      : ['Post-migration 14-day warranty support'],
    assumptions,
    unknowns,
  };
}
