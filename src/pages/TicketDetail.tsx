import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  MessageSquare,
  User,
  Clock,
  TrendingUp,
  FileText,
  Star,
  TicketIcon,
  Paperclip,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { ticketsApiService } from "@/services/ticketing_service/ticketsapi";
import { ticketWorkOrderApiService } from "@/services/ticketing_service/ticketworkorderapi";
import { vendorsApiService } from "@/services/pocurments/vendorsapi";
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { TicketWorkOrderForm } from "@/components/TicketWorkOrderForm";

export default function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { withLoader } = useLoader();
  const [ticket, setTicket] = useState<any>(null);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [vendorList, setVendorList] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  const workflows = ticket?.logs || ticket?.workflows || [];
  const comments = ticket?.comments || [];
  const workOrders = ticket?.workorders || [];

  useEffect(() => {
    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  const loadTicket = async () => {
    await withLoader(async () => {
      const response = await ticketsApiService.getTicketById(ticketId!);
      if (response.success) {
        setTicket(response.data);
        setAttachments(
          response.data?.attachments || response.data?.data?.attachments || []
        );
        if (ticketId) {
          loadEmployeesForTicket();
          loadVendorsForTicket();
          loadNextStatuses();
        }
      } else {
        toast.error("Failed to load ticket details");
      }
    });
  };

  const loadEmployeesForTicket = async () => {
    if (!ticketId) return;
    await withLoader(async () => {
      const response = await ticketsApiService.getEmployeesForTicket(ticketId);
      if (response.success) {
        setEmployeeList(
          Array.isArray(response.data)
            ? response.data
            : response.data?.employees
        );
      }
    });
  };

  const loadVendorsForTicket = async () => {
    if (!ticketId) return;
    await withLoader(async () => {
      const response = await vendorsApiService.getVendorLookup();
      if (response.success) {
        setVendorList(
          Array.isArray(response.data)
            ? response.data
            : response.data?.vendors || []
        );
      }
    });
  };

  const loadNextStatuses = async () => {
    if (!ticketId) return;
    await withLoader(async () => {
      const response = await ticketsApiService.getNextStatuses(ticketId);
      if (response.success) {
        setStatusList(response.data || []);
      }
    });
  };

  const [newComment, setNewComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(ticket?.status);
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [assignedToVendor, setAssignedToVendor] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isStatusUpdateDisabled, setIsStatusUpdateDisabled] = useState(false);
  const [isAssignmentDisabled, setIsAssignmentDisabled] = useState(false);
  const [isVendorAssignmentDisabled, setIsVendorAssignmentDisabled] = useState(false);
  const [isWorkOrderFormOpen, setIsWorkOrderFormOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);

  useEffect(() => {
    if (ticket) {
      setSelectedStatus(ticket?.status);
      setAssignedTo(ticket?.assigned_to);
      setAssignedToVendor(ticket?.vendor_id || ticket?.assigned_to_vendor || "");
    }
  }, [ticket]);

  const handleAddComment = async () => {
  if (!newComment.trim() || !ticketId) return;

  const response = await ticketsApiService.postComment(
    ticketId,
    newComment
  );
  
  if (response.success && response.data) {
    // Convert the API response to match your comment structure
    const newCommentObj = {
      comment_id: response.data.id,
      user_id: response.data.action_by,
      user_name: response.data.action_by_name,
      comment_text: response.data.action_taken,
      created_at: response.data.created_at,
      reactions: []
    };

    // Add the new comment to the ticket's comments array
    setTicket(prevTicket => ({
      ...prevTicket,
      comments: [...(prevTicket?.comments || []), newCommentObj]
    }));

    toast.success("Your comment has been posted successfully.");
    setNewComment("");
  } else {
    toast.error("Failed to post comment");
  }
};

  const handleStatusUpdate = async () => {
  if (!ticketId || !selectedStatus || !user?.id || isStatusUpdateDisabled)
    return;

  setIsStatusUpdateDisabled(true);
  
  const response = await ticketsApiService.updateTicketStatus(
    ticketId,
    selectedStatus,
    user.id
  );
  
  // ✅ Now checking response.success (boolean)
  if (response.success && response.data) {
   
    setTicket(prevTicket => ({
      ...prevTicket,
      status: response.data.ticket.status,
      updated_at: response.data.ticket.updated_at,
      // Add the workflow log as a new comment
      comments: [...(prevTicket?.comments || []), {
        comment_id: response.data.log.workflow_id,
        user_id: response.data.log.action_by,
        user_name: response.data.log.action_by_name,
        comment_text: response.data.log.action_taken,
        created_at: response.data.log.created_at,
        reactions: [],
        is_system_update: true
      }]
    }));
    
    toast.success(`Ticket status changed to ${selectedStatus}`);
  } else {
    toast.error("Failed to update status");
  }
  
  setIsStatusUpdateDisabled(false);
};

  const handleAssignment = async () => {
  if (!ticketId || !assignedTo || isAssignmentDisabled) return;

  setIsAssignmentDisabled(true);
  
  const response = await ticketsApiService.assignTicket(
    ticketId,
    assignedTo
  );
  
  // ✅ Now checking response.success (boolean) - NO LOADER
  if (response.success && response.data) {
    // Update assignment immediately without loader
    setTicket(prevTicket => ({
      ...prevTicket,
      assigned_to: response.data.assigned_to,
      assigned_to_name: response.data.assigned_to_name, // Now available
      updated_at: response.data.updated_at
      // Note: If you need assigned_to_name, make sure your TicketOut model includes it
    }));
    
    toast.success("Ticket has been assigned successfully.");
  } else {
    toast.error("Failed to assign ticket");
  }
  
  setIsAssignmentDisabled(false);
};

  const handleVendorAssignment = async () => {
    if (!ticketId || !assignedToVendor || isVendorAssignmentDisabled) return;

    setIsVendorAssignmentDisabled(true);
    await withLoader(async () => {
      const response = await ticketsApiService.assignVendor(
        ticketId,
        assignedToVendor
      );
      if (response.success) {
        loadTicket();
        toast.success("Vendor has been assigned successfully.");
      }
    });
    setIsVendorAssignmentDisabled(false);
  };

  const handleReopen = () => {
    toast.success("The ticket has been reopened for further action.");
  };

  const handleFeedbackSubmit = () => {
    if (rating === 0) {
      toast.error("Please provide a rating before submitting feedback.");
      return;
    }
    toast.success("Thank you for your feedback!");
    setRating(0);
    setFeedback("");
  };

  const handleCreateWorkOrder = () => {
    setSelectedWorkOrder(null);
    setIsWorkOrderFormOpen(true);
  };

  const handleSaveWorkOrder = async (workOrderData: any) => {
    await withLoader(async () => {
      if (selectedWorkOrder) {
        // Edit mode
        const response = await ticketWorkOrderApiService.updateTicketWorkOrder(
          selectedWorkOrder.work_order_id,
          workOrderData
        );
        if (response.success) {
          toast.success("Work order updated successfully");
          setIsWorkOrderFormOpen(false);
          loadTicket(); // Reload ticket to get updated work orders
        } else {
          toast.error("Failed to update work order");
        }
      } else {
        // Create mode - pre-populate with current ticket ID
        const response = await ticketWorkOrderApiService.addTicketWorkOrder({
          ...workOrderData,
          ticket_id: ticketId,
        });
        if (response.success) {
          toast.success("Work order created successfully");
          setIsWorkOrderFormOpen(false);
          loadTicket(); // Reload ticket to get updated work orders
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case "OPEN":
        return "bg-blue-100 text-blue-800";
      case "ASSIGNED":
        return "bg-purple-100 text-purple-800";
      case "IN_PROGRESS":
      case "IN PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "ESCALATED":
        return "bg-red-100 text-red-800";
      case "CLOSED":
        return "bg-green-100 text-green-800";
      case "ON_HOLD":
      case "ON HOLD":
        return "bg-orange-100 text-orange-800";
      case "REOPENED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <PropertySidebar />
          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center gap-2">
                <TicketIcon className="h-5 w-5 text-sidebar-primary" />
                <h1 className="text-lg font-semibold text-sidebar-primary">
                  Ticket Details
                </h1>
              </div>
            </header>

            <main className="flex-1 p-6">
              <ContentContainer>
                <LoaderOverlay />
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/tickets")}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-sidebar-primary">
                        {" "}
                        #{ticket?.ticket_no}
                      </h2>
                      <p className="text-muted-foreground">{ticket?.title}</p>
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
                            <p className="text-sm text-muted-foreground">
                              {ticket?.description}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Category
                              </p>
                              <p className="font-medium">
                                {ticket?.category || ticket?.category_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Priority
                              </p>
                              <Badge
                                className={
                                  ticket?.priority === "HIGH"
                                    ? "bg-red-100 text-red-800"
                                    : ticket?.priority === "MEDIUM"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }
                              >
                                {ticket?.priority}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Request Type
                              </p>
                              <p className="font-medium">
                                {ticket?.request_type}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Created
                              </p>
                              <p className="font-medium">
                                {ticket?.created_at
                                  ? new Date(ticket.created_at).toLocaleString()
                                  : ""}
                              </p>
                            </div>
                          </div>

                          {/* Attachments Section */}
                          <div className="pt-4 border-t">
                            <div className="flex items-center gap-2 mb-3">
                              <Paperclip className="w-4 h-4 text-muted-foreground" />
                              <p className="text-sm font-medium">Attachments</p>
                            </div>
                            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4">
                              {ticket?.attachments &&
                              ticket.attachments.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3">
                                  {ticket.attachments.map(
                                    (attachment: any, index: number) => (
                                      <div
                                        key={index}
                                        className="relative group border rounded-lg overflow-hidden"
                                      >
                                        {attachment &&
                                          attachment.content_type?.startsWith(
                                            "image/"
                                          ) && (
                                            <img
                                              src={`data:${attachment.content_type};base64,${attachment.file_data_base64}`}
                                              alt={attachment.file_name}
                                              className="w-full h-32 object-cover"
                                              onError={(e) => {
                                                (
                                                  e.target as HTMLImageElement
                                                ).style.display = "none";
                                                const parent = (
                                                  e.target as HTMLImageElement
                                                ).parentElement;
                                                if (parent) {
                                                  parent.innerHTML = `
                                          <div class="w-full h-32 flex items-center justify-center bg-muted">
                                            <Paperclip class="w-8 h-8 text-muted-foreground" />
                                          </div>
                                          <p class="p-2 text-xs text-muted-foreground truncate">${
                                            attachment.file_name ||
                                            `Attachment ${index + 1}`
                                          }</p>
                                        `;
                                                }
                                              }}
                                            />
                                          )}
                                        {(!attachment ||
                                          !attachment.content_type?.startsWith(
                                            "image/"
                                          )) && (
                                          <div className="w-full h-32 flex items-center justify-center bg-muted">
                                            <Paperclip className="w-8 h-8 text-muted-foreground" />
                                          </div>
                                        )}
                                        <div className="p-2 bg-background">
                                          <p
                                            className="text-xs text-muted-foreground truncate"
                                            title={
                                              attachment?.file_name ||
                                              `Attachment ${index + 1}`
                                            }
                                          >
                                            {attachment?.file_name ||
                                              `Attachment ${index + 1}`}
                                          </p>
                                        </div>
                                        {attachment &&
                                          attachment.content_type?.startsWith(
                                            "image/"
                                          ) && (
                                            <a
                                              href={`data:${attachment.content_type};base64,${attachment.file_data_base64}`}
                                              download={attachment.file_name}
                                              className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                            >
                                              <Download className="w-5 h-5 text-white" />
                                            </a>
                                          )}
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground py-4 text-center">
                                  No attachments uploaded
                                </div>
                              )}
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
                          {comments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No comments yet
                            </p>
                          ) : (
                            comments.map((comment: any) => (
                              <div
                                key={comment.comment_id}
                                className="border-b pb-4 last:border-0"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium">
                                        {comment.user_name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(
                                          comment.created_at
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                    <p className="text-sm mt-1">
                                      {comment.comment_text}
                                    </p>
                                    {comment.reactions &&
                                      comment.reactions.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                          {comment.reactions.map(
                                            (reaction: any) => (
                                              <span
                                                key={
                                                  reaction.reaction_id ||
                                                  reaction.emoji
                                                }
                                                className="text-sm"
                                              >
                                                {reaction.emoji}
                                              </span>
                                            )
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                          <div className="pt-4 space-y-2">
                            <Textarea
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              rows={3}
                            />
                            <Button onClick={handleAddComment}>
                              Post Comment
                            </Button>
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
                          {workflows.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No workflow history
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {workflows.map((workflow: any, index: number) => (
                                <div
                                  key={workflow.workflow_id}
                                  className="flex gap-3"
                                >
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
                                      <Badge
                                        className={getStatusColor(
                                          workflow.new_status
                                        )}
                                      >
                                        {workflow.new_status}
                                      </Badge>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(
                                          workflow.action_time
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                    <p className="text-sm mt-1">
                                      {workflow.action_taken}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Feedback Section (if closed) */}
                      {ticket?.status === "CLOSED" && (
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
                                    className={`text-2xl ${
                                      star <= rating
                                        ? "text-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">
                                Feedback
                              </p>
                              <Textarea
                                placeholder="Share your experience..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={3}
                              />
                            </div>
                            <Button onClick={handleFeedbackSubmit}>
                              Submit Feedback
                            </Button>
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
                            <Select
                              value={selectedStatus || undefined}
                              onValueChange={setSelectedStatus}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusList.map((status: any) => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={handleStatusUpdate}
                              className="w-full"
                              size="sm"
                              disabled={isStatusUpdateDisabled}
                            >
                              Update Status
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Assign To</p>
                            <Select
                              value={assignedTo}
                              onValueChange={(value) => setAssignedTo(value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select person" />
                              </SelectTrigger>
                              <SelectContent>
                                {employeeList.map((user: any) => (
                                  <SelectItem
                                    key={user.user_id}
                                    value={user.user_id}
                                  >
                                    {user.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={handleAssignment}
                              className="w-full"
                              size="sm"
                              disabled={isAssignmentDisabled}
                            >
                              Assign Ticket
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Assigned To (Vendor)</p>
                            <Select
                              value={assignedToVendor}
                              onValueChange={(value) => setAssignedToVendor(value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select vendor" />
                              </SelectTrigger>
                              <SelectContent>
                                {vendorList.map((vendor: any) => (
                                  <SelectItem
                                    key={vendor.id || vendor.vendor_id}
                                    value={vendor.id || vendor.vendor_id}
                                  >
                                    {vendor.name || vendor.vendor_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={handleVendorAssignment}
                              className="w-full"
                              size="sm"
                              disabled={isVendorAssignmentDisabled}
                            >
                              Assign Vendor
                            </Button>
                          </div>
                          {ticket?.status === "CLOSED" && (
                            <Button
                              onClick={handleReopen}
                              variant="outline"
                              className="w-full"
                            >
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
                            <div
                              key={wo.wo_no}
                              className="border rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium">
                                  #{wo.wo_no}
                                </p>
                                <Badge
                                  variant={
                                    wo.status === "DONE"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {wo.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {wo.description}
                              </p>
                            </div>
                          ))}
                          {workOrders.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No work orders linked
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleCreateWorkOrder}
                          >
                            Link Work Order
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </ContentContainer>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* Work Order Form Dialog */}
      <TicketWorkOrderForm
        workOrder={selectedWorkOrder}
        isOpen={isWorkOrderFormOpen}
        onClose={() => setIsWorkOrderFormOpen(false)}
        onSave={handleSaveWorkOrder}
        mode={selectedWorkOrder ? "edit" : "create"}
        initialTicketId={ticketId}
      />
    </>
  );
}
