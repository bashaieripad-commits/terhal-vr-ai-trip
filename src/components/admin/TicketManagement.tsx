import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface Ticket {
  id: string;
  ticket_number: string;
  event_name: string;
  event_date: string;
  is_valid: boolean;
  is_resellable: boolean;
  resell_status: string;
  created_at: string;
}

const TicketManagement = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("خطأ في تحميل التذاكر");
    } finally {
      setLoading(false);
    }
  };

  const handleValidateTicket = async (ticketId: string, isValid: boolean) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ is_valid: !isValid })
        .eq("id", ticketId);

      if (error) throw error;
      toast.success("تم تحديث حالة التذكرة");
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("خطأ في تحديث التذكرة");
    }
  };

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة التذاكر</CardTitle>
        <CardDescription>التحقق من التذاكر وإدارة إعادة البيع</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم التذكرة</TableHead>
              <TableHead>اسم الحدث</TableHead>
              <TableHead>تاريخ الحدث</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إعادة البيع</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-mono">{ticket.ticket_number}</TableCell>
                <TableCell>{ticket.event_name}</TableCell>
                <TableCell>
                  {new Date(ticket.event_date).toLocaleDateString("ar-SA")}
                </TableCell>
                <TableCell>
                  <Badge variant={ticket.is_valid ? "default" : "destructive"}>
                    {ticket.is_valid ? "صالحة" : "غير صالحة"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ticket.is_resellable ? (
                    <Badge variant="secondary">{ticket.resell_status || "متاحة"}</Badge>
                  ) : (
                    <Badge variant="outline">غير متاحة</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant={ticket.is_valid ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleValidateTicket(ticket.id, ticket.is_valid)}
                  >
                    {ticket.is_valid ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TicketManagement;
