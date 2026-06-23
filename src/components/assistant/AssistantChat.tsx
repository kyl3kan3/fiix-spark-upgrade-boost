import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Bot, User, ClipboardList, Wallet, Zap, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAssistant, type AssistantUiMessage, type ProposalState } from "@/hooks/useAssistant";
import { formatCurrency } from "@/lib/costAnalytics";
import { formatKwh } from "@/lib/energyAnalytics";
import type { AssistantProposal } from "@/lib/assistant";

const SUGGESTIONS = [
  "Which assets are highest risk right now?",
  "What did we spend on parts in the last 90 days?",
  "Draft a work order to inspect the HVAC unit.",
  "Log a $200 parts cost for the air compressor.",
];

function proposalView(p: AssistantProposal): { icon: React.ElementType; heading: string; badge?: string; title: string; subtitle?: string } {
  switch (p.type) {
    case "work_order":
      return {
        icon: ClipboardList,
        heading: "Proposed work order",
        badge: p.priority,
        title: p.title,
        subtitle: p.description,
      };
    case "cost":
      return {
        icon: Wallet,
        heading: "Proposed cost",
        badge: p.maintenance_type,
        title: `${formatCurrency(p.amount, p.currency)} · ${p.category}`,
        subtitle: p.description ?? undefined,
      };
    case "energy":
      return {
        icon: Zap,
        heading: "Proposed energy reading",
        title: `${formatKwh(p.kwh)}${p.cost != null ? ` · ${formatCurrency(p.cost, p.currency)}` : ""}`,
        subtitle: p.meter_label ?? undefined,
      };
  }
}

function ProposalCard({
  state,
  onConfirm,
}: {
  state: ProposalState;
  onConfirm: () => void;
}) {
  const { proposal, status } = state;
  const v = proposalView(proposal);
  const Icon = v.icon;
  return (
    <Card className="mt-2 border-primary/30 bg-primary/5">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-primary" />
          {v.heading}
          {v.badge && (
            <Badge variant="outline" className="capitalize ml-auto">
              {v.badge}
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium">{v.title}</p>
        {v.subtitle && <p className="text-sm text-muted-foreground">{v.subtitle}</p>}
        {proposal.type === "work_order" && proposal.due_date && (
          <p className="text-xs text-muted-foreground">
            Due {new Date(proposal.due_date).toLocaleDateString()}
          </p>
        )}
        <div className="pt-1">
          {status === "done" ? (
            <span className="inline-flex items-center text-sm text-success">
              <Check className="h-4 w-4 mr-1" /> Saved
            </span>
          ) : (
            <Button size="sm" onClick={onConfirm} disabled={status === "confirming"}>
              {status === "confirming" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving…
                </>
              ) : status === "error" ? (
                "Retry"
              ) : (
                "Confirm & save"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MessageBubble({
  message,
  onConfirm,
}: {
  message: AssistantUiMessage;
  onConfirm: (index: number) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-primary-foreground"
              : message.isError
                ? "bg-destructive/10 text-destructive"
                : "bg-muted"
          }`}
        >
          {message.content}
        </div>
        {message.proposals?.map((state, i) => (
          <div key={i} className="w-full">
            <ProposalCard state={state} onConfirm={() => onConfirm(i)} />
          </div>
        ))}
      </div>
    </div>
  );
}

const AssistantChat: React.FC = () => {
  const { messages, send, isSending, confirmProposal } = useAssistant();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Prefill from a ?prompt= deep link (e.g. from the guided-setup plan), then clear it.
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt) {
      setInput(prompt);
      searchParams.delete("prompt");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    if (!input.trim() || isSending) return;
    void send(input);
    setInput("");
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-16rem)] min-h-[420px]">
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Ask about your maintenance data</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                I can answer questions about assets, work orders, costs, energy, and risk — and draft work
                orders for you to confirm.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => void send(s)} disabled={isSending}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} message={m} onConfirm={(i) => confirmProposal(m.id, i, m.proposals![i].proposal)} />
          ))
        )}
        {isSending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
          </div>
        )}
        <div ref={endRef} />
      </CardContent>
      <div className="border-t p-3">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask a question or describe work to schedule…"
            rows={1}
            className="resize-none min-h-[40px]"
          />
          <Button onClick={submit} disabled={!input.trim() || isSending} size="icon" aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AssistantChat;
