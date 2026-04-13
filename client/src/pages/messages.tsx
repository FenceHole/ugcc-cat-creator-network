import { useState, useRef, useEffect } from "react";
import { useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Search,
  MessageSquare,
  Cat,
  ArrowLeft,
  DollarSign,
  X,
  Package,
  RefreshCw,
} from "lucide-react";
import { formatDistance } from "date-fns";

interface OtherProfile {
  id: string;
  displayName: string;
  username?: string;
  accountType?: string;
  niche?: string;
  profileImageUrl?: string;
}

interface ConversationData {
  id: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCount: number;
  otherProfile: OtherProfile;
}

interface MessageData {
  id: string;
  conversationId: string;
  senderProfileId: string;
  content: string;
  messageType: string;
  offerData?: any;
  createdAt: string;
  senderProfile: OtherProfile;
}

async function fetchConversations(): Promise<ConversationData[]> {
  const res = await fetch("/api/messages", { credentials: "include" });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function fetchMessages(conversationId: string): Promise<MessageData[]> {
  const res = await fetch(`/api/messages/${conversationId}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function fetchMyProfile() {
  const res = await fetch("/api/profile", { credentials: "include" });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function searchProfiles(q: string) {
  const res = await fetch(`/api/profiles/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

async function startConversation(profileId: string): Promise<ConversationData> {
  const res = await fetch("/api/messages/conversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ profileId }),
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function sendMessage(data: { conversationId: string; content: string; messageType?: string; offerData?: any }): Promise<MessageData> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function markRead(conversationId: string) {
  await fetch(`/api/messages/${conversationId}/read`, { method: "PATCH", credentials: "include" });
}

export default function Messages() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<OtherProfile[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offer, setOffer] = useState({ deliverable: "", rate: "", platforms: "", notes: "", deadline: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: myProfile } = useQuery({ queryKey: ["/api/profile"], queryFn: fetchMyProfile, enabled: !!user });
  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ["/api/messages"],
    queryFn: fetchConversations,
    enabled: !!user,
    refetchInterval: 15000, // poll every 15s
  });
  const { data: msgs = [], isLoading: msgsLoading } = useQuery({
    queryKey: [`/api/messages/${selectedConvId}`],
    queryFn: () => fetchMessages(selectedConvId!),
    enabled: !!selectedConvId,
    refetchInterval: 5000,
  });

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (selectedConvId) {
      markRead(selectedConvId);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    }
  }, [selectedConvId]);

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setMessageText("");
      setShowOfferForm(false);
      setOffer({ deliverable: "", rate: "", platforms: "", notes: "", deadline: "" });
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${selectedConvId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: () => toast({ title: "Failed to send", variant: "destructive" }),
  });

  const startConvMutation = useMutation({
    mutationFn: (profileId: string) => startConversation(profileId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setSelectedConvId(data.id);
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
    },
    onError: () => toast({ title: "Failed to start conversation", variant: "destructive" }),
  });

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const results = await searchProfiles(q);
    setSearchResults(results);
  };

  const handleSend = () => {
    if (!selectedConvId || !messageText.trim()) return;
    sendMutation.mutate({ conversationId: selectedConvId, content: messageText });
  };

  const handleSendOffer = () => {
    if (!selectedConvId || !offer.deliverable || !offer.rate) return;
    const content = `💼 Offer: ${offer.deliverable} — ${offer.rate}${offer.platforms ? ` (${offer.platforms})` : ""}${offer.deadline ? ` by ${offer.deadline}` : ""}${offer.notes ? `\n\n${offer.notes}` : ""}`;
    sendMutation.mutate({
      conversationId: selectedConvId,
      content,
      messageType: "offer",
      offerData: offer,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h2 className="text-2xl font-bold mb-2">Messages</h2>
          <p className="text-muted-foreground mb-6">Sign in to DM other creators and brands.</p>
          <Button onClick={() => window.location.href = "/api/login"} className="rounded-full bg-accent hover:bg-accent/90 text-white">
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-accent" /> Messages
          </h1>
          <Button
            onClick={() => setShowSearch(true)}
            variant="outline"
            size="sm"
            className="rounded-full border-accent/30 text-accent hover:bg-accent hover:text-white"
            data-testid="button-new-message"
          >
            + New Message
          </Button>
        </div>

        {/* Search / New Conversation */}
        {showSearch && (
          <div className="mb-4 p-4 rounded-2xl border bg-card space-y-3" data-testid="search-panel">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Start a new conversation</span>
              <button onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(""); }}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or username..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="pl-9"
                autoFocus
                data-testid="input-search-users"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-1.5">
                {searchResults.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => startConvMutation.mutate(profile.id)}
                    disabled={startConvMutation.isPending}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                    data-testid={`result-profile-${profile.id}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <Cat size={16} className="text-accent" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{profile.displayName}</div>
                      <div className="text-xs text-muted-foreground">
                        {profile.username ? `@${profile.username}` : ""} {profile.accountType === "brand" ? "· Brand" : "· Creator"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">No results found</p>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Conversations List */}
          <div className={`lg:col-span-1 overflow-y-auto rounded-2xl border bg-card ${selectedConvId ? "hidden lg:block" : ""}`}>
            {convsLoading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-3">
                <MessageSquare className="h-10 w-10 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <Button size="sm" variant="outline" onClick={() => setShowSearch(true)} className="rounded-full text-xs">
                  Start a Conversation
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left ${selectedConvId === conv.id ? "bg-accent/5 border-l-2 border-accent" : ""}`}
                    data-testid={`conv-${conv.id}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <Cat size={18} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">{conv.otherProfile.displayName}</span>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-accent text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full shrink-0">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.lastMessagePreview || "Start the conversation"}
                      </p>
                      {conv.lastMessageAt && (
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {formatDistance(new Date(conv.lastMessageAt), new Date(), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Thread */}
          <div className={`lg:col-span-2 flex flex-col rounded-2xl border bg-card overflow-hidden ${!selectedConvId ? "hidden lg:flex" : "flex"}`}>
            {!selectedConvId ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center space-y-3 py-16">
                <Cat className="h-12 w-12 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">Select a conversation or start a new one</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b bg-card">
                  <button onClick={() => setSelectedConvId(null)} className="lg:hidden">
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Cat size={16} className="text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{selectedConv?.otherProfile.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedConv?.otherProfile.accountType === "brand" ? "Brand" : "Creator"}
                      {selectedConv?.otherProfile.username ? ` · @${selectedConv.otherProfile.username}` : ""}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {msgsLoading ? (
                    <div className="space-y-2">
                      {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-3/4" />)}
                    </div>
                  ) : msgs.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      Send the first message to get things started.
                    </div>
                  ) : (
                    msgs.map(msg => {
                      const isMe = msg.senderProfileId === myProfile?.id;
                      const isOffer = msg.messageType === "offer";
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMe 
                              ? "bg-accent text-white rounded-br-sm" 
                              : isOffer 
                                ? "bg-green-50 border border-green-200 text-foreground rounded-bl-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                          }`} data-testid={`message-${msg.id}`}>
                            {isOffer && (
                              <div className="flex items-center gap-1.5 text-green-700 text-xs font-semibold mb-1">
                                <Package size={12} /> Offer
                              </div>
                            )}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${isMe ? "text-white/70" : "text-muted-foreground"}`}>
                              {formatDistance(new Date(msg.createdAt), new Date(), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Offer Form */}
                {showOfferForm && (
                  <div className="p-4 border-t bg-green-50/50 space-y-3" data-testid="offer-form">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
                        <DollarSign size={14} /> Send a Deal Offer
                      </span>
                      <button onClick={() => setShowOfferForm(false)}><X size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Deliverable (e.g. UGC video 60s)" value={offer.deliverable} onChange={e => setOffer(o => ({...o, deliverable: e.target.value}))} className="text-xs" />
                      <Input placeholder="Rate (e.g. $300)" value={offer.rate} onChange={e => setOffer(o => ({...o, rate: e.target.value}))} className="text-xs" />
                      <Input placeholder="Platforms (TikTok, IG...)" value={offer.platforms} onChange={e => setOffer(o => ({...o, platforms: e.target.value}))} className="text-xs" />
                      <Input placeholder="Deadline (optional)" value={offer.deadline} onChange={e => setOffer(o => ({...o, deadline: e.target.value}))} className="text-xs" />
                    </div>
                    <Textarea placeholder="Additional notes..." value={offer.notes} onChange={e => setOffer(o => ({...o, notes: e.target.value}))} className="min-h-[60px] resize-none text-xs" />
                    <Button size="sm" onClick={handleSendOffer} disabled={!offer.deliverable || !offer.rate || sendMutation.isPending} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full">
                      Send Offer
                    </Button>
                  </div>
                )}

                {/* Input */}
                {!showOfferForm && (
                  <div className="p-4 border-t flex items-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowOfferForm(true)}
                      className="shrink-0 rounded-xl border-accent/30 text-accent hover:bg-accent hover:text-white"
                      title="Send a deal offer"
                      data-testid="button-send-offer"
                    >
                      <DollarSign size={16} />
                    </Button>
                    <Textarea
                      placeholder="Type a message... (Enter to send)"
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 min-h-[40px] max-h-[120px] resize-none text-sm"
                      rows={1}
                      data-testid="textarea-message"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!messageText.trim() || sendMutation.isPending}
                      size="icon"
                      className="shrink-0 rounded-xl bg-accent hover:bg-accent/90 text-white"
                      data-testid="button-send-message"
                    >
                      {sendMutation.isPending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
