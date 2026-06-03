import { Pencil, Plus, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";

const billingHistoryRows = [
  {
    date: "Sep 15, 2023",
    description: "Professional Tier (Monthly)",
    amount: "$299.00",
  },
  {
    date: "Aug 15, 2023",
    description: "Professional Tier (Monthly)",
    amount: "$299.00",
  },
  {
    date: "Jul 15, 2023",
    description: "Professional Tier (Monthly)",
    amount: "$299.00",
  },
];

export default function BillingSupportGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-1 bg-card rounded-xl shadow-sm border border-transparent hover:border-primary/10 transition-colors duration-300 p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-xl font-semibold text-foreground">
            Payment Method
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:bg-primary/5"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <div className="bg-muted/40 rounded-lg p-4 border border-border/60 flex items-center gap-4 mb-4">
          <div className="w-12 h-8 bg-white rounded border border-border/60 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            <span className="text-[#1434CB] font-bold italic text-xs tracking-tighter">
              VISA
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
            <p className="text-xs text-muted-foreground">Expires 12/2025</p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
            Default
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-auto w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </section>

      <section className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-transparent hover:border-primary/10 transition-colors duration-300 overflow-hidden flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-border/70 flex justify-between items-center">
          <h3 className="font-headline text-xl font-semibold text-foreground">
            Billing History
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-primary/5"
          >
            Download All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-6 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {billingHistoryRows.map((invoice) => (
                <tr
                  key={invoice.date}
                  className="hover:bg-muted/20 transition-colors group"
                >
                  <td className="py-4 px-6 text-sm text-foreground">
                    {invoice.date}
                  </td>
                  <td className="py-4 px-4 text-sm text-foreground">
                    {invoice.description}
                  </td>
                  <td className="py-4 px-4 text-sm text-foreground font-medium">
                    {invoice.amount}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-success/10 text-success text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Paid
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ReceiptText className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-border/50 bg-background/50 text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary"
          >
            View Older Invoices
          </Button>
        </div>
      </section>
    </div>
  );
}
