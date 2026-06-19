import { useState, useEffect, useRef } from 'react';
import { useCRM } from '../context/CRMContext';
import { Bot, X, Send, Sparkles, User } from 'lucide-react';

const getMessageId = () => {
  return new Date().getTime();
};

export const VelocityAssistant = ({ isOpen, onClose }) => {
  const { leads, tasks, activities } = useCRM();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am Nexus AI, your workspace co-pilot. I can analyze leads, track sales performance, list due tasks, and summarize team activities in real-time. Ask me anything or select a prompt below!",
      time: "Just now"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const suggestedPrompts = [
    "Show high-value leads",
    "Which deals need follow-up?",
    "Summarize today's activities"
  ];

  const handleSend = (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: getMessageId(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response calculation after a brief delay
    setTimeout(() => {
      let responseText = "";
      const normalizedQuery = textToSend.toLowerCase();

      if (normalizedQuery.includes("high-value") || normalizedQuery.includes("high value")) {
        const highValueLeads = leads
          .filter(l => l.value >= 15000 && l.status !== "Won" && l.status !== "Lost")
          .sort((a, b) => b.value - a.value);

        if (highValueLeads.length > 0) {
          responseText = `I scanned your pipeline and found **${highValueLeads.length} active high-value opportunities** (valued above ₹15,000):\n\n` +
            highValueLeads.map((l, i) => `${i + 1}. **${l.company}** (${l.name}) — **${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(l.value)}** in stage *${l.status}* (Owner: ${l.owner})`).join('\n') +
            `\n\nI recommend prioritizing contact with **${highValueLeads[0].company}** immediately.`;
        } else {
          responseText = "I didn't find any active, open opportunities valued above $15,000 at this moment.";
        }
      } 
      else if (normalizedQuery.includes("follow-up") || normalizedQuery.includes("follow up") || normalizedQuery.includes("due")) {
        const todayStr = "2026-06-18";
        const urgentTasks = tasks.filter(t => t.status === "Pending" && (t.dueDate <= todayStr));
        
        if (urgentTasks.length > 0) {
          responseText = `Here are the **${urgentTasks.length} urgent tasks** requiring immediate follow-up today:\n\n` +
            urgentTasks.map((t, i) => {
              const isOverdue = t.dueDate < todayStr;
              const overdueLabel = isOverdue ? "⚠️ OVERDUE" : "📅 TODAY";
              return `${i + 1}. **${t.title}** [${overdueLabel}] — Assigned to: *${t.assignedTo}* ${t.leadName ? `(Ref: ${t.leadName})` : ''}`;
            }).join('\n') +
            `\n\nWould you like me to schedule email reminders for these team members?`;
        } else {
          responseText = "Great news! There are no pending or overdue tasks set for today. All projects are on track.";
        }
      } 
      else if (normalizedQuery.includes("summarize") || normalizedQuery.includes("activity") || normalizedQuery.includes("activities")) {
        responseText = `Here is a summary of the **latest activities** logged in the CRM workspace:\n\n` +
          activities.slice(0, 4).map(a => `• [${a.time}] ${a.text}`).join('\n') +
          `\n\nOverall workspace adoption remains high. Let me know if you would like a metric breakdown.`;
      } 
      else if (normalizedQuery.includes("lead") || normalizedQuery.includes("source")) {
        const webCount = leads.filter(l => l.source === 'Website').length;
        const liCount = leads.filter(l => l.source === 'LinkedIn').length;
        const refCount = leads.filter(l => l.source === 'Referral').length;
        
        responseText = `Your leads database contains **${leads.length} records**. Here is the breakdown by top sources:\n\n` +
          `• **LinkedIn**: ${liCount} leads\n` +
          `• **Website Conversion**: ${webCount} leads\n` +
          `• **Referrals**: ${refCount} leads\n` +
          `• **Other Channels**: ${leads.length - (webCount + liCount + refCount)} leads\n\n` +
          `Social acquisition (LinkedIn) is currently driving the highest percentage of pipeline volume.`;
      }
      else {
        responseText = "I've processed your query. Nexus Workspace is fully operational. You currently have **" + 
          leads.filter(l => l.status === "Won").length + " won deals** and **" + 
          leads.filter(l => l.status !== "Won" && l.status !== "Lost").length + " active opportunities** in progress. Is there a specific account or deal you'd like me to look up?";
      }

      setMessages(prev => [...prev, {
        id: getMessageId() + 1,
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div 
      className="glass-panel animate-slide-in-right"
      style={{
        position: 'fixed',
        top: '0',
        right: '0',
        width: '380px',
        height: '100vh',
        zIndex: 150,
        borderRadius: '0',
        borderLeft: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)'
      }}
    >
      {/* Assistant Header */}
      <div 
        style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-hover) 100%)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}
          >
            <Bot size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Nexus AI</h4>
            <span style={{ fontSize: '10px', color: 'var(--success)' }}>● Workspace Assistant Online</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="btn btn-ghost" 
          style={{ padding: '6px', borderRadius: '50%' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Stream */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map(msg => {
          const isAI = msg.sender === 'ai';
          return (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                gap: '10px',
                alignSelf: isAI ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                flexDirection: isAI ? 'row' : 'row-reverse'
              }}
            >
              <div 
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: isAI ? 'var(--accent-light)' : 'var(--primary-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isAI ? 'var(--accent)' : 'var(--primary)',
                  flexShrink: 0
                }}
              >
                {isAI ? <Bot size={14} /> : <User size={14} />}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div 
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    backgroundColor: isAI ? 'var(--bg-hover)' : 'var(--primary)',
                    color: isAI ? 'var(--text-primary)' : '#ffffff',
                    border: '1px solid',
                    borderColor: isAI ? 'var(--border-color)' : 'transparent',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {/* Basic markdown parsing (bold lists) */}
                  {msg.text.split('\n').map((line, lIdx) => {
                    if (line.startsWith('**') || line.includes('**')) {
                      // simple replacements for display bolding
                      const parts = line.split('**');
                      return (
                        <div key={lIdx} style={{ margin: line.trim() === '' ? '8px 0' : '2px 0' }}>
                          {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part)}
                        </div>
                      );
                    }
                    return <div key={lIdx} style={{ margin: line.trim() === '' ? '8px 0' : '2px 0' }}>{line}</div>;
                  })}
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', alignSelf: isAI ? 'flex-start' : 'flex-end' }}>
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContainer: 'center', color: 'var(--accent)' }}>
              <Bot size={14} style={{ margin: 'auto' }} />
            </div>
            <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite' }} />
              <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite 0.2s' }} />
              <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite 0.4s' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts pills */}
      <div 
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'var(--bg-secondary)'
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Suggested Inquiries
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {suggestedPrompts.map((pText, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(pText)}
              className="btn btn-secondary"
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                borderRadius: '9999px',
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-primary)'
              }}
            >
              <Sparkles size={10} style={{ color: 'var(--accent)' }} />
              <span>{pText}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Footer */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '10px',
          background: 'var(--bg-secondary)'
        }}
      >
        <input 
          type="text" 
          placeholder="Ask Nexus AI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            fontSize: '13px'
          }}
          disabled={isTyping}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ padding: '10px', borderRadius: '8px' }}
          disabled={isTyping}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
