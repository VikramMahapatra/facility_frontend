import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { PropertySidebar } from "@/components/PropertySidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const predefinedQueries = [
  "How do I create a new lease agreement?",
  "What are the maintenance request procedures?",
  "How to manage tenant payments?",
  "Explain the energy consumption reports",
  "How to handle booking cancellations?",
  "What are the property management best practices?",
  "How to set up automated invoicing?",
  "Explain space allocation process",
  "How to track work orders?",
  "What are the tax management features?"
];

const generateBotResponse = (query: string): string => {
  const responses: Record<string, string> = {
    "lease": "To create a new lease agreement, navigate to Leasing & Tenants > Leases and click 'Add New Lease'. Fill in the tenant details, lease terms, rent amount, and duration. The system will automatically generate the lease document and set up recurring invoices.",
    "maintenance": "For maintenance requests, go to Maintenance & Assets > Service Requests. Users can submit requests via the tenant portal, and you can track, assign, and resolve them. Set up preventive maintenance schedules in the PM section.",
    "payment": "Tenant payments are managed through Financials > Invoices & Payments. You can set up automatic payment reminders, accept online payments, and track payment histories. Late fees and penalties can be configured automatically.",
    "energy": "Energy consumption reports are available under Energy & IoT > Consumption Reports. View real-time meter readings, analyze usage patterns, identify peak consumption periods, and generate cost allocation reports for tenants.",
    "booking": "For booking cancellations, go to Hospitality > Bookings, find the reservation, and update the status to 'cancelled'. The system will automatically adjust inventory and process refunds based on your cancellation policy.",
    "practices": "Property management best practices include: Regular property inspections, proactive maintenance scheduling, clear tenant communication, accurate financial tracking, compliance monitoring, and using data analytics for decision making.",
    "invoicing": "Automated invoicing is set up under Financials > Invoices & Payments. Configure recurring charges, late fees, and payment terms. The system automatically generates and sends invoices based on lease agreements.",
    "space": "Space allocation involves defining spaces in Spaces & Sites > All Spaces, categorizing them by type (apartments, offices, etc.), setting up space groups, and managing availability through the booking system.",
    "work": "Work orders are tracked in Maintenance & Assets > Work Orders. Create, assign, schedule, and monitor progress. Set priorities, attach photos, and maintain complete maintenance histories for all assets.",
    "tax": "Tax management features are in Financials > Tax Management. Configure tax rates, generate tax reports, handle GST compliance, and maintain audit trails for all transactions."
  };

  const lowercaseQuery = query.toLowerCase();
  for (const [key, response] of Object.entries(responses)) {
    if (lowercaseQuery.includes(key)) {
      return response;
    }
  }

  return "I'm here to help with your property management questions! You can ask me about leasing, maintenance, financials, energy management, hospitality, and more. Try clicking on one of the suggested queries below for detailed guidance.";
};

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your FacilityOS AI assistant. How can I help you manage your property today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(content),
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handlePredefinedQuery = (query: string) => {
    sendMessage(query);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">AI ChatBot</h1>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>AI Powered</span>
            </Badge>
          </header>

          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              {/* Predefined Queries */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Questions</CardTitle>
                  <CardDescription>
                    Click on any of these common questions to get instant help
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {predefinedQueries.map((query, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePredefinedQuery(query)}
                        className="text-xs"
                      >
                        {query}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Messages */}
              <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">Chat with AI Assistant</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-4">
                  <ScrollArea className="flex-1 pr-4 mb-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.isBot
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {message.isBot && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                              {!message.isBot && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                              <div>
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  message.isBot ? 'text-muted-foreground/70' : 'text-primary-foreground/70'
                                }`}>
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-muted text-muted-foreground rounded-lg p-3 max-w-[80%]">
                            <div className="flex items-center space-x-2">
                              <Bot className="h-4 w-4" />
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <form onSubmit={handleSubmit} className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your message here..."
                      disabled={isTyping}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!inputValue.trim() || isTyping}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ChatBot;