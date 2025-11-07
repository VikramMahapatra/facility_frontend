import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageSquare, User, Clock, TrendingUp, FileText, Star } from "lucide-react";
import { mockTickets, mockTicketWorkflows, mockTicketComments, mockTicketWorkOrders } from "@/data/mockTicketData";
import { useToast } from "@/hooks/use-toast";

export default function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const ticket = mockTickets.find((t) => t.ticket_id === parseInt(ticketId || "0"));
  const workflows = mockTicketWorkflows.filter((w) => w.ticket_id === parseInt(ticketId || "0"));
  const comments = mockTicketComments.filter((c) => c.ticket_id === parseInt(ticketId || "0"));
  const workOrders = mockTicketWorkOrders.filter((w) => w.ticket_id === parseInt(ticketId || "0"));

  const [newComment, setNewComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(ticket?.status || "OPEN");
  const [assignedTo, setAssignedTo] = useState(ticket?.assigned_to?.toString() || "");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    toast({
      title: "Comment added",
      description: "Your comment has been posted successfully.",
    });
    setNewComment("");
  };

  const handleStatusUpdate = () => {
    toast({
      title: "Status updated",
      description: `Ticket status changed to ${selectedStatus}`,
    });
  };

  const handleAssignment = () => {
    toast({
      title: "Assignment updated",
      description: "Ticket has been assigned successfully.",
    });
  };

  const handleReopen = () => {
    toast({
      title: "Ticket reopened",
      description: "The ticket has been reopened for further action.",
    });
  };

  const handleFeedbackSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a rating before submitting feedback.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback!",
    });
    setRating(0);
    setFeedback("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED':
        return 'bg-purple-100 text-purple-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'ESCALATED':
        return 'bg-red-100 text-red-800';
      case 'CLOSED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PropertySidebar />
        <div className="flex-1">
          <Navigation />
          <main className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/tickets")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold">Ticket #{ticket.ticket_id}</h1>
                <p className="text-muted-foreground mt-1">{ticket.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Ticket Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground">{ticket.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{ticket.category_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Priority</p>
                        <Badge className={ticket.priority === 'HIGH' ? 'bg-red-100 text-red-800' : ticket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Request Type</p>
                        <p className="font-medium">{ticket.request_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">{new Date(ticket.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Comments & Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.comment_id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{comment.user_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleString()}
                              </p>
                            </div>
                            <p className="text-sm mt-1">{comment.comment_text}</p>
                            {comment.reactions.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {comment.reactions.map((reaction) => (
                                  <span key={reaction.reaction_id} className="text-sm">
                                    {reaction.emoji}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 space-y-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleAddComment}>Post Comment</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Workflow Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Workflow Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {workflows.map((workflow, index) => (
                        <div key={workflow.workflow_id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <TrendingUp className="w-4 h-4" />
                            </div>
                            {index < workflows.length - 1 && (
                              <div className="w-px h-full bg-border mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(workflow.new_status)}>
                                {workflow.new_status}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {new Date(workflow.action_time).toLocaleString()}
                              </p>
                            </div>
                            <p className="text-sm mt-1">{workflow.action_taken}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Feedback Section (if closed) */}
                {ticket.status === 'CLOSED' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Provide Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Rating</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Feedback</p>
                        <Textarea
                          placeholder="Share your experience..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleFeedbackSubmit}>Submit Feedback</Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status & Assignment */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status & Assignment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Status</p>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="ASSIGNED">Assigned</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="ESCALATED">Escalated</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleStatusUpdate} className="w-full" size="sm">
                        Update Status
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Assign To</p>
                      <Select value={assignedTo} onValueChange={setAssignedTo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select person" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="101">John Smith</SelectItem>
                          <SelectItem value="102">Jane Doe</SelectItem>
                          <SelectItem value="103">Mike Johnson</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAssignment} className="w-full" size="sm">
                        Assign Ticket
                      </Button>
                    </div>
                    {ticket.status === 'CLOSED' && (
                      <Button onClick={handleReopen} variant="outline" className="w-full">
                        Reopen Ticket
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Work Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Work Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {workOrders.map((wo) => (
                      <div key={wo.work_order_id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">WO #{wo.work_order_id}</p>
                          <Badge variant={wo.status === 'DONE' ? 'default' : 'secondary'}>
                            {wo.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{wo.description}</p>
                      </div>
                    ))}
                    {workOrders.length === 0 && (
                      <p className="text-sm text-muted-foreground">No work orders linked</p>
                    )}
                    <Button variant="outline" size="sm" className="w-full">
                      Link Work Order
                    </Button>
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
