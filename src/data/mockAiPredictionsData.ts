// Mock data for AI Prediction Analytics
export interface AiPrediction {
  id: string;
  title: string;
  type: 'revenue' | 'occupancy' | 'maintenance' | 'energy' | 'tenant_churn' | 'market_trend';
  confidence: number;
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
  prediction: string;
  currentValue: number;
  predictedValue: number;
  change: number;
  accuracy: number;
  lastUpdated: string;
  status: 'active' | 'monitoring' | 'alert';
}

export interface AiAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  timestamp: string;
  prediction_id?: string;
  actionRequired: boolean;
  estimatedImpact: string;
  recommendations: string[];
}

export interface PredictiveMetric {
  name: string;
  current: number;
  predicted: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  timeframe: string;
}

export interface MarketInsight {
  category: string;
  insight: string;
  impact: string;
  confidence: number;
  source: string;
}

// AI Predictions Mock Data
export const aiPredictions: AiPrediction[] = [
  {
    id: "pred-1",
    title: "Revenue Forecast - Q4",
    type: "revenue",
    confidence: 94,
    timeframe: "Next 3 months",
    impact: "high",
    prediction: "Revenue expected to increase by 12.5% driven by new tenant acquisitions and rental rate optimizations",
    currentValue: 2450000,
    predictedValue: 2756250,
    change: 12.5,
    accuracy: 91,
    lastUpdated: "2024-09-26T10:30:00Z",
    status: "active"
  },
  {
    id: "pred-2",
    title: "Occupancy Rate Projection",
    type: "occupancy",
    confidence: 87,
    timeframe: "Next 6 months",
    impact: "medium",
    prediction: "Occupancy rate will stabilize at 92% with seasonal fluctuations in Q1",
    currentValue: 88.5,
    predictedValue: 92.0,
    change: 3.9,
    accuracy: 89,
    lastUpdated: "2024-09-26T09:15:00Z",
    status: "monitoring"
  },
  {
    id: "pred-3",
    title: "Maintenance Cost Optimization",
    type: "maintenance",
    confidence: 91,
    timeframe: "Next 12 months",
    impact: "high",
    prediction: "Preventive maintenance implementation will reduce costs by 18% and improve asset lifespan",
    currentValue: 485000,
    predictedValue: 397700,
    change: -18.0,
    accuracy: 86,
    lastUpdated: "2024-09-26T11:45:00Z",
    status: "active"
  },
  {
    id: "pred-4",
    title: "Energy Consumption Forecast",
    type: "energy",
    confidence: 83,
    timeframe: "Next 4 months",
    impact: "medium",
    prediction: "Smart systems deployment will reduce energy consumption by 15% through AI-driven optimization",
    currentValue: 125000,
    predictedValue: 106250,
    change: -15.0,
    accuracy: 84,
    lastUpdated: "2024-09-26T08:20:00Z",
    status: "active"
  },
  {
    id: "pred-5",
    title: "Tenant Churn Risk Analysis",
    type: "tenant_churn",
    confidence: 78,
    timeframe: "Next 6 months",
    impact: "high",
    prediction: "3 high-value tenants at risk of non-renewal based on satisfaction scores and market trends",
    currentValue: 5.2,
    predictedValue: 8.7,
    change: 67.3,
    accuracy: 82,
    lastUpdated: "2024-09-26T12:10:00Z",
    status: "alert"
  },
  {
    id: "pred-6",
    title: "Market Rental Rate Trends",
    type: "market_trend",
    confidence: 89,
    timeframe: "Next 8 months",
    impact: "high",
    prediction: "Commercial rental rates in the area expected to rise by 8.5% due to supply constraints",
    currentValue: 450,
    predictedValue: 488,
    change: 8.4,
    accuracy: 87,
    lastUpdated: "2024-09-26T07:45:00Z",
    status: "monitoring"
  },
  {
    id: "pred-7",
    title: "Portfolio Expansion Opportunity",
    type: "market_trend",
    confidence: 92,
    timeframe: "Next 18 months",
    impact: "high",
    prediction: "Adjacent property acquisition window optimal with 15% below-market pricing opportunity",
    currentValue: 5200000,
    predictedValue: 6240000,
    change: 20.0,
    accuracy: 88,
    lastUpdated: "2024-09-26T13:20:00Z",
    status: "active"
  },
  {
    id: "pred-8",
    title: "Smart Building ROI Analysis",
    type: "revenue",
    confidence: 85,
    timeframe: "Next 24 months",
    impact: "high",
    prediction: "IoT infrastructure investment will generate 3.2x ROI through operational efficiency and premium pricing",
    currentValue: 1850000,
    predictedValue: 2405000,
    change: 30.0,
    accuracy: 83,
    lastUpdated: "2024-09-26T14:15:00Z",
    status: "active"
  },
  {
    id: "pred-9",
    title: "Lease Renewal Optimization",
    type: "revenue",
    confidence: 90,
    timeframe: "Next 9 months",
    impact: "medium",
    prediction: "AI-driven lease negotiation strategy will improve renewal rates by 23% and increase average lease value",
    currentValue: 1250000,
    predictedValue: 1537500,
    change: 23.0,
    accuracy: 87,
    lastUpdated: "2024-09-26T15:30:00Z",
    status: "monitoring"
  },
  {
    id: "pred-10",
    title: "ESG Compliance Impact",
    type: "market_trend",
    confidence: 88,
    timeframe: "Next 15 months",
    impact: "high",
    prediction: "Green certification will unlock 25% premium pricing and attract ESG-focused tenants",
    currentValue: 380,
    predictedValue: 475,
    change: 25.0,
    accuracy: 85,
    lastUpdated: "2024-09-26T16:45:00Z",
    status: "active"
  },
  {
    id: "pred-11",
    title: "Workforce Pattern Analytics",
    type: "occupancy",
    confidence: 81,
    timeframe: "Next 12 months",
    impact: "medium",
    prediction: "Hybrid work patterns will stabilize at 70% office utilization, optimizing space allocation",
    currentValue: 65.5,
    predictedValue: 70.2,
    change: 7.2,
    accuracy: 79,
    lastUpdated: "2024-09-26T17:10:00Z",
    status: "monitoring"
  },
  {
    id: "pred-12",
    title: "Predictive Security Analytics",
    type: "maintenance",
    confidence: 86,
    timeframe: "Next 8 months",
    impact: "medium",
    prediction: "AI security systems will reduce incidents by 40% and optimize guard deployment efficiency",
    currentValue: 125000,
    predictedValue: 75000,
    change: -40.0,
    accuracy: 84,
    lastUpdated: "2024-09-26T18:25:00Z",
    status: "active"
  }
];

// AI Alerts Mock Data
export const aiAlerts: AiAlert[] = [
  {
    id: "alert-1",
    title: "Critical Tenant Churn Risk Detected",
    description: "AI model detected high probability of tenant non-renewal for Suite 1204 (TechCorp Inc.)",
    severity: "critical",
    category: "Tenant Management",
    timestamp: "2024-09-26T10:15:00Z",
    prediction_id: "pred-5",
    actionRequired: true,
    estimatedImpact: "₹2.4M annual revenue loss",
    recommendations: [
      "Schedule immediate tenant satisfaction review meeting",
      "Offer lease renewal incentives (5-7% discount)",
      "Address outstanding maintenance requests within 48 hours",
      "Conduct competitive market analysis for retention strategy"
    ]
  },
  {
    id: "alert-2",
    title: "Equipment Failure Prediction",
    description: "HVAC System #3 showing anomalous patterns indicating potential failure within 2 weeks",
    severity: "warning",
    category: "Maintenance",
    timestamp: "2024-09-26T09:30:00Z",
    actionRequired: true,
    estimatedImpact: "₹350K repair cost if failure occurs",
    recommendations: [
      "Schedule immediate inspection by certified HVAC technician",
      "Prepare backup system activation protocols",
      "Order replacement parts for common failure points",
      "Notify affected tenants of potential service interruption"
    ]
  },
  {
    id: "alert-3",
    title: "Energy Usage Anomaly",
    description: "Building B showing 23% increase in energy consumption compared to historical patterns",
    severity: "warning",
    category: "Energy Management",
    timestamp: "2024-09-26T08:45:00Z",
    actionRequired: false,
    estimatedImpact: "₹45K additional monthly cost",
    recommendations: [
      "Investigate potential equipment malfunction",
      "Review tenant usage patterns for anomalies",
      "Schedule energy audit for Building B",
      "Check for unauthorized electrical connections"
    ]
  },
  {
    id: "alert-4",
    title: "Market Opportunity Identified",
    description: "AI analysis suggests optimal timing for rental rate adjustment in Commercial Wing",
    severity: "info",
    category: "Revenue Optimization",
    timestamp: "2024-09-26T07:20:00Z",
    actionRequired: false,
    estimatedImpact: "₹280K potential annual revenue increase",
    recommendations: [
      "Review current lease agreements for renewal opportunities",
      "Conduct competitive market rate analysis",
      "Prepare rental increase justification documentation",
      "Plan tenant communication strategy for rate adjustments"
    ]
  },
  {
    id: "alert-5",
    title: "Occupancy Optimization Alert",
    description: "AI recommends space reconfiguration in Floor 12 to maximize occupancy potential",
    severity: "info",
    category: "Space Management",
    timestamp: "2024-09-26T06:55:00Z",
    actionRequired: false,
    estimatedImpact: "15% increase in leasable area efficiency",
    recommendations: [
      "Conduct space utilization survey",
      "Engage architect for reconfiguration feasibility study",
      "Estimate renovation costs vs. revenue potential",
      "Plan phased implementation to minimize tenant disruption"
    ]
  },
  {
    id: "alert-6",
    title: "Cyber Security Threat Detection",
    description: "Unusual network activity detected in Building Management System - potential security breach",
    severity: "critical",
    category: "Security",
    timestamp: "2024-09-26T19:45:00Z",
    actionRequired: true,
    estimatedImpact: "Data breach risk - potential ₹1.2M compliance penalties",
    recommendations: [
      "Immediately isolate affected network segments",
      "Activate incident response team",
      "Conduct forensic analysis of security logs",
      "Notify regulatory authorities within 72 hours"
    ]
  },
  {
    id: "alert-7",
    title: "Competitive Market Shift",
    description: "Major competitor launched aggressive pricing strategy - 15% below market rates in target demographic",
    severity: "warning",
    category: "Market Intelligence",
    timestamp: "2024-09-26T18:30:00Z",
    actionRequired: true,
    estimatedImpact: "Potential 20% decrease in new tenant acquisition",
    recommendations: [
      "Analyze competitor's value proposition and service offerings",
      "Develop counter-strategy with enhanced amenities package",
      "Consider strategic pricing adjustments for new leases",
      "Accelerate smart building initiatives for differentiation"
    ]
  },
  {
    id: "alert-8",
    title: "Regulatory Compliance Risk",
    description: "New environmental regulations effective Q1 2025 may impact 40% of current operations",
    severity: "warning",
    category: "Compliance",
    timestamp: "2024-09-26T17:15:00Z",
    actionRequired: true,
    estimatedImpact: "₹850K compliance upgrade costs",
    recommendations: [
      "Engage legal counsel for detailed regulation analysis",
      "Conduct comprehensive facility compliance audit",
      "Develop phased upgrade implementation plan",
      "Allocate budget for necessary infrastructure modifications"
    ]
  },
  {
    id: "alert-9",
    title: "Predictive Maintenance Opportunity",
    description: "Elevator systems showing optimal replacement timing - 6-month window before efficiency degradation",
    severity: "info",
    category: "Asset Management",
    timestamp: "2024-09-26T16:20:00Z",
    actionRequired: false,
    estimatedImpact: "₹180K savings through proactive replacement vs reactive",
    recommendations: [
      "Request quotes from certified elevator maintenance vendors",
      "Schedule tenant communication for planned maintenance windows",
      "Evaluate modern elevator systems with smart monitoring",
      "Plan replacement during low-occupancy periods"
    ]
  },
  {
    id: "alert-10",
    title: "Portfolio Diversification Alert",
    description: "Current portfolio concentration in tech sector at 65% - economic sensitivity risk identified",
    severity: "warning",
    category: "Risk Management",
    timestamp: "2024-09-26T15:10:00Z",
    actionRequired: false,
    estimatedImpact: "High correlation risk during tech sector downturns",
    recommendations: [
      "Target healthcare and education sector tenants",
      "Develop mixed-use space options",
      "Consider industrial/warehouse space acquisition",
      "Implement sector-balanced tenant acquisition strategy"
    ]
  },
  {
    id: "alert-11",
    title: "Weather Impact Prediction",
    description: "Severe weather patterns predicted for next quarter - potential infrastructure stress",
    severity: "info",
    category: "Environmental",
    timestamp: "2024-09-26T14:55:00Z",
    actionRequired: false,
    estimatedImpact: "₹120K preventive measures vs ₹450K reactive repairs",
    recommendations: [
      "Inspect and reinforce building envelope systems",
      "Stock emergency supplies and backup power systems",
      "Review insurance coverage for weather-related damage",
      "Develop tenant communication protocols for severe weather"
    ]
  },
  {
    id: "alert-12",
    title: "Innovation Opportunity Detection",
    description: "PropTech startup offering AR-based space planning tools - first-mover advantage available",
    severity: "info",
    category: "Innovation",
    timestamp: "2024-09-26T13:40:00Z",
    actionRequired: false,
    estimatedImpact: "Potential 30% improvement in space utilization efficiency",
    recommendations: [
      "Schedule demonstration with PropTech vendor",
      "Conduct pilot program in one building",
      "Analyze ROI potential and implementation timeline",
      "Consider strategic partnership or technology licensing"
    ]
  }
];

// Predictive Metrics for Dashboard
export const predictiveMetrics: PredictiveMetric[] = [
  {
    name: "Revenue Growth",
    current: 2450000,
    predicted: 2756250,
    trend: "up",
    confidence: 94,
    timeframe: "3 months"
  },
  {
    name: "Occupancy Rate",
    current: 88.5,
    predicted: 92.0,
    trend: "up",
    confidence: 87,
    timeframe: "6 months"
  },
  {
    name: "Maintenance Costs",
    current: 485000,
    predicted: 397700,
    trend: "down",
    confidence: 91,
    timeframe: "12 months"
  },
  {
    name: "Energy Efficiency",
    current: 125000,
    predicted: 106250,
    trend: "down",
    confidence: 83,
    timeframe: "4 months"
  },
  {
    name: "Tenant Satisfaction",
    current: 4.2,
    predicted: 4.6,
    trend: "up",
    confidence: 79,
    timeframe: "6 months"
  },
  {
    name: "Market Position",
    current: 72,
    predicted: 81,
    trend: "up",
    confidence: 85,
    timeframe: "8 months"
  }
];

// Market Insights from AI Analysis
export const marketInsights: MarketInsight[] = [
  {
    category: "Rental Rates",
    insight: "Commercial rates in tech corridors showing 12% YoY growth, outpacing residential by 3.2%",
    impact: "Opportunity for premium positioning and rate optimization",
    confidence: 89,
    source: "Market Analysis AI + Real Estate Data"
  },
  {
    category: "Tenant Preferences",
    insight: "Increasing demand for flexible lease terms and co-working spaces post-pandemic",
    impact: "Consider introducing flexible workspace options to capture 25% premium",
    confidence: 82,
    source: "Tenant Behavior Analytics"
  },
  {
    category: "Sustainability Trends",
    insight: "Green-certified buildings commanding 18% premium in current market conditions",
    impact: "ESG certification investment could yield 3.2x ROI over 5 years",
    confidence: 91,
    source: "ESG Performance Analysis"
  },
  {
    category: "Technology Adoption",
    insight: "Smart building features correlate with 22% higher tenant retention rates",
    impact: "IoT infrastructure investment showing positive correlation with tenant satisfaction",
    confidence: 86,
    source: "PropTech Impact Analysis"
  },
  {
    category: "Economic Indicators",
    insight: "Interest rate stabilization expected in Q2 2025, improving investment climate",
    impact: "Optimal timing for portfolio expansion or major renovations",
    confidence: 75,
    source: "Economic Forecast Models"
  }
];

// Advanced Time series data for multiple trend visualizations
export const aiTrendData = [
  { month: "Jan", occupancy: { predicted: 88.2, actual: 87.5, confidence: 85 }, revenue: { predicted: 2200000, actual: 2180000, confidence: 91 }, satisfaction: { predicted: 4.1, actual: 4.0, confidence: 78 } },
  { month: "Feb", occupancy: { predicted: 89.1, actual: 88.8, confidence: 87 }, revenue: { predicted: 2250000, actual: 2240000, confidence: 89 }, satisfaction: { predicted: 4.2, actual: 4.1, confidence: 80 } },
  { month: "Mar", occupancy: { predicted: 90.3, actual: 89.9, confidence: 89 }, revenue: { predicted: 2300000, actual: 2290000, confidence: 92 }, satisfaction: { predicted: 4.3, actual: 4.2, confidence: 82 } },
  { month: "Apr", occupancy: { predicted: 91.2, actual: 90.8, confidence: 91 }, revenue: { predicted: 2350000, actual: 2340000, confidence: 88 }, satisfaction: { predicted: 4.3, actual: 4.3, confidence: 85 } },
  { month: "May", occupancy: { predicted: 92.1, actual: 91.5, confidence: 88 }, revenue: { predicted: 2400000, actual: 2390000, confidence: 90 }, satisfaction: { predicted: 4.4, actual: 4.2, confidence: 83 } },
  { month: "Jun", occupancy: { predicted: 92.8, actual: 92.2, confidence: 90 }, revenue: { predicted: 2450000, actual: 2440000, confidence: 93 }, satisfaction: { predicted: 4.5, actual: 4.4, confidence: 87 } },
  { month: "Jul", occupancy: { predicted: 93.2, actual: null, confidence: 87 }, revenue: { predicted: 2500000, actual: null, confidence: 91 }, satisfaction: { predicted: 4.5, actual: null, confidence: 85 } },
  { month: "Aug", occupancy: { predicted: 93.8, actual: null, confidence: 85 }, revenue: { predicted: 2550000, actual: null, confidence: 89 }, satisfaction: { predicted: 4.6, actual: null, confidence: 83 } },
  { month: "Sep", occupancy: { predicted: 94.1, actual: null, confidence: 83 }, revenue: { predicted: 2600000, actual: null, confidence: 87 }, satisfaction: { predicted: 4.6, actual: null, confidence: 81 } },
  { month: "Oct", occupancy: { predicted: 94.5, actual: null, confidence: 81 }, revenue: { predicted: 2650000, actual: null, confidence: 85 }, satisfaction: { predicted: 4.7, actual: null, confidence: 79 } },
  { month: "Nov", occupancy: { predicted: 94.8, actual: null, confidence: 79 }, revenue: { predicted: 2700000, actual: null, confidence: 83 }, satisfaction: { predicted: 4.7, actual: null, confidence: 77 } },
  { month: "Dec", occupancy: { predicted: 95.1, actual: null, confidence: 77 }, revenue: { predicted: 2750000, actual: null, confidence: 81 }, satisfaction: { predicted: 4.8, actual: null, confidence: 75 } }
];

// Advanced Analytics Data
export const marketTrendAnalysis = [
  { sector: "Commercial Office", growth: 8.5, volatility: 12, outlook: "positive", confidence: 89 },
  { sector: "Retail Space", growth: -2.1, volatility: 18, outlook: "challenging", confidence: 76 },
  { sector: "Industrial", growth: 15.2, volatility: 8, outlook: "strong", confidence: 94 },
  { sector: "Mixed Use", growth: 11.3, volatility: 14, outlook: "positive", confidence: 82 },
  { sector: "Co-working", growth: 22.7, volatility: 25, outlook: "volatile", confidence: 68 }
];

export const competitorAnalysis = [
  { competitor: "PropertyCorp", marketShare: 23.5, growthRate: 6.2, threatLevel: "high", differentiator: "Premium locations" },
  { competitor: "UrbanSpaces", marketShare: 18.3, growthRate: 12.8, threatLevel: "critical", differentiator: "Technology integration" },
  { competitor: "MetroRealty", marketShare: 15.7, growthRate: 4.1, threatLevel: "medium", differentiator: "Cost leadership" },
  { competitor: "FlexBuildings", marketShare: 12.2, growthRate: 18.9, threatLevel: "high", differentiator: "Flexible terms" },
  { competitor: "GreenTowers", marketShare: 8.9, growthRate: 25.4, threatLevel: "emerging", differentiator: "Sustainability focus" }
];

export const tenantBehaviorInsights = [
  { pattern: "Remote Work Adaptation", prevalence: 78, impact: "space_reduction", prediction: "Will stabilize at 65% by 2025" },
  { pattern: "Flexible Lease Terms", prevalence: 45, impact: "revenue_volatility", prediction: "Demand increasing 15% annually" },
  { pattern: "Sustainability Focus", prevalence: 62, impact: "premium_willingness", prediction: "Green features becoming mandatory" },
  { pattern: "Technology Integration", prevalence: 83, impact: "retention_factor", prediction: "Smart building features expected standard" },
  { pattern: "Collaborative Spaces", prevalence: 71, impact: "space_design", prediction: "Open concept demand will peak in 2024" }
];

// Risk assessment matrix
export const riskMatrix = [
  { category: "Tenant Churn", probability: 23, impact: "high", mitigation: "Proactive engagement", timeline: "3-6 months", severity: "critical", financialImpact: 2400000 },
  { category: "Equipment Failure", probability: 12, impact: "medium", mitigation: "Predictive maintenance", timeline: "1-3 months", severity: "warning", financialImpact: 350000 },
  { category: "Market Volatility", probability: 35, impact: "medium", mitigation: "Diversification strategy", timeline: "6-12 months", severity: "warning", financialImpact: 1200000 },
  { category: "Regulatory Changes", probability: 18, impact: "medium", mitigation: "Compliance monitoring", timeline: "12+ months", severity: "info", financialImpact: 850000 },
  { category: "Energy Costs", probability: 45, impact: "medium", mitigation: "Smart systems deployment", timeline: "3-9 months", severity: "warning", financialImpact: 540000 },
  { category: "Cyber Security", probability: 8, impact: "high", mitigation: "Advanced threat detection", timeline: "Immediate", severity: "critical", financialImpact: 1200000 },
  { category: "Economic Recession", probability: 28, impact: "high", mitigation: "Portfolio diversification", timeline: "12-18 months", severity: "warning", financialImpact: 3500000 },
  { category: "Climate Change", probability: 42, impact: "medium", mitigation: "Sustainable infrastructure", timeline: "24+ months", severity: "info", financialImpact: 950000 },
  { category: "Technology Disruption", probability: 31, impact: "medium", mitigation: "Innovation adoption", timeline: "6-18 months", severity: "info", financialImpact: 800000 },
  { category: "Supply Chain", probability: 22, impact: "low", mitigation: "Vendor diversification", timeline: "3-12 months", severity: "info", financialImpact: 300000 },
  { category: "Interest Rate Fluctuation", probability: 55, impact: "high", mitigation: "Financial hedging", timeline: "6-24 months", severity: "warning", financialImpact: 2100000 },
  { category: "Workforce Shortage", probability: 38, impact: "medium", mitigation: "Automation investment", timeline: "6-15 months", severity: "warning", financialImpact: 680000 },
  { category: "Pandemic Impact", probability: 15, impact: "high", mitigation: "Flexible space design", timeline: "Ongoing", severity: "info", financialImpact: 1800000 },
  { category: "Insurance Premium Rise", probability: 48, impact: "low", mitigation: "Risk reduction programs", timeline: "Annual", severity: "info", financialImpact: 180000 },
  { category: "Competitor Expansion", probability: 33, impact: "medium", mitigation: "Market differentiation", timeline: "6-12 months", severity: "warning", financialImpact: 900000 }
];

// AI Model Performance Metrics
export const modelPerformance = [
  { model: "Revenue Predictor", accuracy: 94.2, precision: 91.8, recall: 96.1, f1Score: 93.9 },
  { model: "Occupancy Forecaster", accuracy: 89.5, precision: 87.3, recall: 92.1, f1Score: 89.6 },
  { model: "Maintenance Optimizer", accuracy: 91.7, precision: 89.4, recall: 94.2, f1Score: 91.7 },
  { model: "Churn Predictor", accuracy: 82.3, precision: 84.1, recall: 79.8, f1Score: 81.9 },
  { model: "Energy Forecaster", accuracy: 87.9, precision: 85.6, recall: 90.4, f1Score: 87.9 }
];