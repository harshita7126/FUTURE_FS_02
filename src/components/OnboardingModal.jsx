import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Sparkles, ArrowRight, Kanban, Bot, CheckCircle } from 'lucide-react';

export const OnboardingModal = () => {
  const { isOnboarded, completeOnboarding } = useCRM();
  const [step, setStep] = useState(1);

  if (isOnboarded) return null;

  const stepsData = [
    {
      title: "Welcome to Nexus",
      description: "You've successfully connected to your high-performance enterprise workspace. Let's briefly show you how to manage your sales pipeline and operations like a pro.",
      icon: <Sparkles size={36} style={{ color: 'var(--primary)' }} />,
      badge: "Step 1 of 3"
    },
    {
      title: "Visual Pipeline & Automation",
      description: "Manage leads easily using our drag-and-drop Kanban Board. Promoting a lead to the 'Won' stage automatically converts them to an Active Customer profile with billing records.",
      icon: <Kanban size={36} style={{ color: 'var(--accent)' }} />,
      badge: "Step 2 of 3"
    },
    {
      title: "AI Co-pilot & Command Palette",
      description: "Press Ctrl+K from anywhere to search leads, actions, and sections instantly. Use the right-sidebar Nexus AI assistant to parse live CRM stats via natural language.",
      icon: <Bot size={36} style={{ color: 'var(--info)' }} />,
      badge: "Step 3 of 3"
    }
  ];

  const currentStepData = stepsData[step - 1];

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div 
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '40px',
          textAlign: 'center',
          position: 'relative',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--modal-shadow)'
        }}
      >
        <span 
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '9999px',
            background: 'var(--bg-hover)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '24px'
          }}
        >
          {currentStepData.badge}
        </span>

        {/* Dynamic Icon with glowing background circle */}
        <div 
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--bg-hover)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            border: '1px solid var(--border-color)'
          }}
        >
          {currentStepData.icon}
        </div>

        <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>
          {currentStepData.title}
        </h3>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
          {currentStepData.description}
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {[1, 2, 3].map(i => (
            <div 
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: i === step ? 'var(--primary)' : 'var(--border-color)',
                transition: 'background-color 0.2s'
              }}
            />
          ))}
        </div>

        <button 
          onClick={handleNext} 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '12px', fontSize: '15px' }}
        >
          <span>{step === 3 ? "Launch Workspace" : "Continue"}</span>
          {step === 3 ? <CheckCircle size={16} /> : <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
};
