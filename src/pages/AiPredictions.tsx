import { useState, useEffect } from "react";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock,
  Zap, Target, Activity, RefreshCw, Bell, Eye, Settings, Download,
  Sparkles, BarChart3, PieChart as PieChartIcon, Bot, Lightbulb
} from "lucide-react";
import {
  aiPredictions, aiAlerts, predictiveMetrics, marketInsights, aiTrendData,
  riskMatrix, modelPerformance, AiPrediction, AiAlert, marketTrendAnalysis,
  competitorAnalysis, tenantBehaviorInsights
} from "@/data/mockAiPredictionsData";
import { useToast } from "@/hooks/use-toast";

export default function AiPredictions() {
  const [selectedModel, setSelectedModel] = useState("all");
  const [timeRange, setTimeRange] = useState("6m");
  const [alertsFilter, setAlertsFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new alert or prediction update
      if (Math.random() > 0.95) {
        toast({
          title: "🤖 AI Alert",
          description: "New prediction model updated with latest data",
          duration: 3000,
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate AI model refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
    toast({
      title: "✨ Models Refreshed",
      description: "All AI prediction models have been updated with latest data",
      duration: 3000,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredAlerts = aiAlerts.filter(alert =>
    alertsFilter === 'all' || alert.severity === alertsFilter
  );

  const PredictionCard = ({ prediction }: { prediction: AiPrediction }) => (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-bl-full" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">{prediction.title}</CardTitle>
          </div>
          <Badge variant={prediction.status === 'alert' ? 'destructive' : 'default'} className="text-xs">
            {prediction.status}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {prediction.timeframe} • {prediction.confidence}% confidence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Current</span>
          <span className="font-semibold">
            {prediction.type === 'occupancy' || prediction.type === 'tenant_churn'
              ? `${prediction.currentValue}%`
              : `₹${(prediction.currentValue / 1000).toFixed(0)}K`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Predicted</span>
          <span className="font-semibold">
            {prediction.type === 'occupancy' || prediction.type === 'tenant_churn'
              ? `${prediction.predictedValue}%`
              : `₹${(prediction.predictedValue / 1000).toFixed(0)}K`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Change</span>
          <div className={`flex items-center space-x-1 ${prediction.change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
            {prediction.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span className="text-sm font-medium">
              {prediction.change > 0 ? '+' : ''}{prediction.change.toFixed(1)}%
            </span>
          </div>
        </div>
        <Progress value={prediction.confidence} className="h-2" />
        <p className="text-xs text-muted-foreground leading-relaxed">{prediction.prediction}</p>
      </CardContent>
    </Card>
  );

  const AlertCard = ({ alert }: { alert: AiAlert }) => (
    <Alert className="border-l-4 border-l-primary">
      <div className="flex items-start space-x-3">
        <AlertTriangle className={`h-4 w-4 mt-0.5 ${alert.severity === 'critical' ? 'text-red-500' :
          alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
          }`} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <AlertTitle className="text-sm font-medium">{alert.title}</AlertTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                {alert.severity}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          <AlertDescription className="text-xs">{alert.description}</AlertDescription>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Impact: {alert.estimatedImpact}</span>
            {alert.actionRequired && (
              <Badge variant="outline" className="text-xs">Action Required</Badge>
            )}
          </div>
          {alert.recommendations.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-primary font-medium">
                View Recommendations ({alert.recommendations.length})
              </summary>
              <ul className="mt-2 space-y-1 ml-4 list-disc">
                {alert.recommendations.map((rec, index) => (
                  <li key={index} className="text-muted-foreground">{rec}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </Alert>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${typeof entry.value === 'number' ?
                entry.value.toLocaleString() : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-foreground">AI Prediction Analytics</h1>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
            <Badge variant="secondary" className="text-xs">
              Next-Gen AI Platform
            </Badge>
          </div>
          {/* <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">AI Prediction Analytics</h1>
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Next-Gen AI Platform
              </Badge>
            </div> */}

          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="12m">12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh AI
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* AI Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {predictiveMetrics.map((metric, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.name}
                  </CardTitle>
                  <div className={`flex items-center space-x-1 ${metric.trend === 'up' ? 'text-green-600' :
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                    {metric.trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
                      metric.trend === 'down' ? <TrendingDown className="h-3 w-3" /> :
                        <Activity className="h-3 w-3" />}
                    <span className="text-xs font-medium">{metric.confidence}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-xl font-bold">
                    {metric.name.includes('Rate') || metric.name.includes('Satisfaction')
                      ? `${metric.predicted}${metric.name.includes('Rate') ? '%' : '/5'}`
                      : `₹${(metric.predicted / 1000).toFixed(0)}K`}
                  </p>
                  <p className="text-xs text-muted-foreground">{metric.timeframe} forecast</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="predictions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="alerts">AI Alerts</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
            <TabsTrigger value="competitor">Competitor Intel</TabsTrigger>
            <TabsTrigger value="behavior">Tenant Analytics</TabsTrigger>
            <TabsTrigger value="models">Model Performance</TabsTrigger>
            <TabsTrigger value="risks">Risk Matrix</TabsTrigger>
          </TabsList>

          {/* AI Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {aiPredictions.map((prediction) => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          </TabsContent>

          {/* AI Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Smart Alerts ({filteredAlerts.length})</span>
              </h3>
              <Select value={alertsFilter} onValueChange={setAlertsFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </TabsContent>

          {/* Trend Analysis Tab */}
          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Multi-Dimensional Prediction Trends</CardTitle>
                  <CardDescription>Advanced AI forecasting across key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={aiTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="occupancy.actual" stroke="#10b981" strokeWidth={3} name="Occupancy Actual %" />
                      <Line yAxisId="left" type="monotone" dataKey="occupancy.predicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Occupancy Predicted %" />
                      <Line yAxisId="right" type="monotone" dataKey="satisfaction.actual" stroke="#f59e0b" strokeWidth={3} name="Satisfaction Actual" />
                      <Line yAxisId="right" type="monotone" dataKey="satisfaction.predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="Satisfaction Predicted" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Sector Analysis</CardTitle>
                  <CardDescription>Growth trends across property sectors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={marketTrendAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sector" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="growth" fill="#3b82f6" name="Growth %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Prediction Accuracy</CardTitle>
                  <CardDescription>AI revenue forecasting performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={aiTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue.predicted" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Predicted Revenue" />
                      <Area type="monotone" dataKey="revenue.actual" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.8} name="Actual Revenue" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Market Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {marketInsights.map((insight, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <span>{insight.category}</span>
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{insight.insight}</p>
                    <div className="bg-primary/5 p-3 rounded-md">
                      <h5 className="font-medium text-sm text-primary mb-1">Business Impact</h5>
                      <p className="text-xs text-muted-foreground">{insight.impact}</p>
                    </div>
                    <p className="text-xs text-muted-foreground italic">Source: {insight.source}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Competitor Intelligence Tab */}
          <TabsContent value="competitor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Competitive Intelligence</CardTitle>
                <CardDescription>Real-time competitor analysis and market positioning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {competitorAnalysis.map((competitor, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{competitor.competitor}</h4>
                          <Badge variant={competitor.threatLevel === 'critical' ? 'destructive' : competitor.threatLevel === 'high' ? 'default' : 'secondary'}>
                            {competitor.threatLevel}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Market Share</span>
                            <span className="font-medium">{competitor.marketShare}%</span>
                          </div>
                          <Progress value={competitor.marketShare} className="h-2" />
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Growth Rate</span>
                            <span className={`font-medium ${competitor.growthRate > 10 ? 'text-red-600' : 'text-green-600'}`}>
                              {competitor.growthRate}%
                            </span>
                          </div>
                          <p className="text-sm"><strong>Key Differentiator:</strong> {competitor.differentiator}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          dataKey="marketShare"
                          data={competitorAnalysis}
                          nameKey="competitor"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {competitorAnalysis.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tenant Behavior Analytics Tab */}
          <TabsContent value="behavior" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Tenant Behavior Analytics</CardTitle>
                <CardDescription>Advanced behavioral pattern recognition and predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {tenantBehaviorInsights.map((insight, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{insight.pattern}</h4>
                          <Badge variant="outline">{insight.prevalence}% prevalence</Badge>
                        </div>
                        <div className="space-y-2">
                          <Progress value={insight.prevalence} className="h-2" />
                          <div className="bg-primary/5 p-3 rounded-md">
                            <p className="text-sm"><strong>Impact:</strong> {insight.impact.replace('_', ' ')}</p>
                            <p className="text-xs text-muted-foreground mt-1">{insight.prediction}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={tenantBehaviorInsights}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="pattern" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="prevalence" fill="#3b82f6" name="Prevalence %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Model Performance Tab */}
          <TabsContent value="models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Performance Metrics</CardTitle>
                <CardDescription>Real-time performance indicators for all prediction models</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={modelPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy %" />
                    <Bar dataKey="precision" fill="#10b981" name="Precision %" />
                    <Bar dataKey="recall" fill="#f59e0b" name="Recall %" />
                    <Bar dataKey="f1Score" fill="#8b5cf6" name="F1 Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Matrix Tab */}
          <TabsContent value="risks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Risk Assessment Matrix</CardTitle>
                <CardDescription>Advanced predictive risk analysis with financial impact and mitigation strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {riskMatrix.slice(0, 8).map((risk, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{risk.category}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant={risk.severity === 'critical' ? 'destructive' : risk.severity === 'warning' ? 'default' : 'secondary'}>
                              {risk.severity}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{risk.timeline}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Probability</span>
                            <span className="font-medium">{risk.probability}%</span>
                          </div>
                          <Progress value={risk.probability} className="h-2" />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Financial Impact</span>
                            <span className="font-bold text-red-600">₹{(risk.financialImpact / 1000).toFixed(0)}K</span>
                          </div>
                          <p className="text-sm"><strong>Mitigation:</strong> {risk.mitigation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Risk Distribution</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            dataKey="probability"
                            data={riskMatrix.slice(0, 6)}
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {riskMatrix.slice(0, 6).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f97316'][index]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Financial Impact Analysis</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={riskMatrix.slice(0, 6)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip formatter={(value) => [`₹${(Number(value) / 1000).toFixed(0)}K`, 'Financial Impact']} />
                          <Bar dataKey="financialImpact" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}