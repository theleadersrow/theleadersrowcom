import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Loader2, 
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

interface Invoice {
  id: string;
  number: string | null;
  status: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  due_date: number | null;
  paid_at: number | null;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
  description: string;
  period_start: number;
  period_end: number;
}

interface InvoiceListProps {
  customerEmail: string;
  compact?: boolean;
}

const InvoiceList = ({ customerEmail, compact = false }: InvoiceListProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerEmail) {
      fetchInvoices();
    }
  }, [customerEmail]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke("get-invoices", {
        body: { customerEmail },
      });

      if (fnError) {
        throw fnError;
      }

      setInvoices(data?.invoices || []);
    } catch (err: any) {
      console.error("Error fetching invoices:", err);
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "open":
      case "draft":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "uncollectible":
      case "void":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Receipt className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    const styles: Record<string, string> = {
      paid: "bg-green-500/20 text-green-600 border-green-500/30",
      open: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      draft: "bg-gray-500/20 text-gray-600 border-gray-500/30",
      uncollectible: "bg-red-500/20 text-red-600 border-red-500/30",
      void: "bg-red-500/20 text-red-600 border-red-500/30",
    };
    return styles[status || ""] || styles.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-secondary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={fetchInvoices} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No invoices found</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {invoices.slice(0, 5).map((invoice) => (
          <div 
            key={invoice.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(invoice.status)}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {invoice.number || invoice.id.slice(-8)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(invoice.created)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {formatCurrency(invoice.amount_paid || invoice.amount_due, invoice.currency)}
              </span>
              {invoice.invoice_pdf && (
                <a
                  href={invoice.invoice_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-secondary/80"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
        {invoices.length > 5 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            + {invoices.length - 5} more invoices
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <div 
          key={invoice.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card rounded-xl border border-border/50 gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-foreground">
                  Invoice {invoice.number || `#${invoice.id.slice(-8)}`}
                </p>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadge(invoice.status)}`}>
                  {invoice.status?.charAt(0).toUpperCase()}{invoice.status?.slice(1)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(invoice.created)}
                {invoice.paid_at && ` • Paid ${formatDate(invoice.paid_at)}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {invoice.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:flex-col sm:items-end">
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(invoice.amount_paid || invoice.amount_due, invoice.currency)}
            </p>
            <div className="flex gap-2">
              {invoice.hosted_invoice_url && (
                <a
                  href={invoice.hosted_invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-secondary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </a>
              )}
              {invoice.invoice_pdf && (
                <a
                  href={invoice.invoice_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-secondary hover:underline"
                >
                  <Download className="w-3 h-3" />
                  PDF
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvoiceList;