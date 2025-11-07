import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Paperclip, Send, Link2, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { mockServiceRequests } from "@/data/mockServiceRequestData";
import { mockWorkOrders } from "@/data/mockMaintenanceData";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { useToast } from "@/hooks/use-toast";

const EMOJI_OPTIONS = ["👍", "⭐", "✅", "❤️", "🎉", "👀"];

export default function ServiceRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  
  const serviceRequest = mockServiceRequests.find((sr) => sr.id === id);

  if (!serviceRequest) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Service Request Not Found</h2>
          <Button onClick={() => navigate("/service-requests")}>
            Back to Service Requests
          </Button>
        </div>
      </div>
    );
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    toast({
      title: "Comment added",
      description: "Your comment has been posted successfully.",
    });
    setNewComment("");
  };

  const handleStatusChange = (newStatus: string) => {
    toast({
      title: "Status updated",
      description: `Service request status changed to ${newStatus.replace('_', ' ')}`,
    });
  };

  const handleLinkWorkOrder = (workOrderId: string) => {
    toast({
      title: "Work Order linked",
      description: `Work Order #${workOrderId} has been linked to this request.`,
    });
  };

  const handleReopen = () => {
    toast({
      title: "Request reopened",
      description: "This service request has been reopened.",
    });
  };

  const handleReaction = (commentId: string, emoji: string) => {
    toast({
      description: `Reacted with ${emoji}`,
    });
  };

  const linkedWorkOrder = serviceRequest.work_order_id 
    ? mockWorkOrders.find(wo => wo.id === serviceRequest.work_order_id)
    : null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <Button variant="ghost" onClick={() => navigate("/service-requests")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Service Request #{serviceRequest.id}</h1>
                  <p className="text-sm text-muted-foreground">{serviceRequest.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {(serviceRequest.status === 'resolved' || serviceRequest.status === 'closed') && (
                  <Button variant="outline" onClick={handleReopen}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reopen
                  </Button>
                )}
                <Select onValueChange={handleStatusChange} defaultValue={serviceRequest.status}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="col-span-2 space-y-6">
                {/* Request Details */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{serviceRequest.description}</CardTitle>
                        <CardDescription className="mt-2">
                          Reported by {serviceRequest.requester_name} on{" "}
                          {new Date(serviceRequest.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={
                          serviceRequest.status === 'resolved' ? 'default' :
                          serviceRequest.status === 'closed' ? 'secondary' :
                          serviceRequest.status === 'in_progress' ? 'secondary' :
                          serviceRequest.status === 'on_hold' ? 'outline' : 'outline'
                        }
                      >
                        {serviceRequest.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{serviceRequest.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Priority</p>
                        <Badge 
                          variant={
                            serviceRequest.priority === 'high' ? 'destructive' :
                            serviceRequest.priority === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {serviceRequest.priority}
                        </Badge>
                      </div>
                    </div>

                    {serviceRequest.attachments && serviceRequest.attachments.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Attachments</p>
                        <div className="space-y-2">
                          {serviceRequest.attachments.map((attachment, idx) => (
                            <div key={idx} className="flex items-center space-x-2 p-2 bg-muted rounded">
                              <Paperclip className="w-4 h-4" />
                              <span className="text-sm">{attachment}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Comments Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity & Comments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {serviceRequest.comments.map((comment) => (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {comment.user_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{comment.user_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {comment.user_role}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-1 text-sm">{comment.content}</p>
                            
                            {/* Reactions */}
                            <div className="flex items-center space-x-2 mt-2">
                              {comment.reactions.map((reaction, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={() => handleReaction(comment.id, reaction.emoji)}
                                >
                                  <span className="mr-1">{reaction.emoji}</span>
                                  <span className="text-xs">{reaction.count}</span>
                                </Button>
                              ))}
                              {EMOJI_OPTIONS.filter(
                                emoji => !comment.reactions.find(r => r.emoji === emoji)
                              ).slice(0, 3).map((emoji) => (
                                <Button
                                  key={emoji}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={() => handleReaction(comment.id, emoji)}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}

                    {/* New Comment */}
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button onClick={handleAddComment}>
                        <Send className="w-4 h-4 mr-2" />
                        Post Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Assignment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Assignment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {serviceRequest.assigned_to ? (
                      <div>
                        <p className="text-sm text-muted-foreground">Assigned to</p>
                        <p className="font-medium">{serviceRequest.assigned_to}</p>
                        <p className="text-sm text-muted-foreground">{serviceRequest.assigned_to_email}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not assigned yet</p>
                    )}
                    <Button variant="outline" className="w-full">
                      Change Assignment
                    </Button>
                  </CardContent>
                </Card>

                {/* Linked Work Order */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Work Order</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {linkedWorkOrder ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Link2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">#{linkedWorkOrder.id}</span>
                        </div>
                        <p className="text-sm">{linkedWorkOrder.title}</p>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate(`/work-orders/${linkedWorkOrder.id}`)}
                        >
                          View Work Order
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">No work order linked</p>
                        <Select onValueChange={handleLinkWorkOrder}>
                          <SelectTrigger>
                            <SelectValue placeholder="Link work order" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockWorkOrders.slice(0, 5).map((wo) => (
                              <SelectItem key={wo.id} value={wo.id}>
                                #{wo.id} - {wo.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p>{new Date(serviceRequest.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p>{new Date(serviceRequest.updated_at).toLocaleString()}</p>
                    </div>
                    {serviceRequest.resolved_at && (
                      <div>
                        <p className="text-muted-foreground">Resolved</p>
                        <p>{new Date(serviceRequest.resolved_at).toLocaleString()}</p>
                      </div>
                    )}
                    {serviceRequest.closed_at && (
                      <div>
                        <p className="text-muted-foreground">Closed</p>
                        <p>{new Date(serviceRequest.closed_at).toLocaleString()}</p>
                      </div>
                    )}
                    {serviceRequest.reopened_count > 0 && (
                      <div>
                        <p className="text-muted-foreground">Reopened</p>
                        <p>{serviceRequest.reopened_count} time(s)</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
