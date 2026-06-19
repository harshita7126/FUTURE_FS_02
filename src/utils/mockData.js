// Nexus - Mock Data System

export const INITIAL_LEADS = [
  {
    id: "lead-1",
    name: "Sarah Jenkins",
    company: "Acme Dynamics",
    email: "s.jenkins@acmedynamics.com",
    phone: "+1 (555) 019-2834",
    value: 12500,
    status: "Proposal Sent",
    source: "LinkedIn",
    owner: "Alex Rivera",
    date: "2026-06-10",
    notes: "Very interested in our enterprise subscription package. Prefers Zoom calls."
  },
  {
    id: "lead-2",
    name: "David Chen",
    company: "Starlight Biotech",
    email: "dchen@starlightbio.io",
    phone: "+1 (555) 014-9876",
    value: 8200,
    status: "Contacted",
    source: "Website",
    owner: "Sophia Chen",
    date: "2026-06-14",
    notes: "Downloaded the whitepaper on AI analytics. Follow up with case studies."
  },
  {
    id: "lead-3",
    name: "Elena Rostova",
    company: "CyberGuard Solutions",
    email: "elena.r@cyberguard.tech",
    phone: "+49 89 201934",
    value: 24000,
    status: "Qualified",
    source: "Referral",
    owner: "Marcus Johnson",
    date: "2026-06-12",
    notes: "Referred by CTO of Horizon Tech. Looking for custom integration."
  },
  {
    id: "lead-4",
    name: "Marcus Vance",
    company: "Apex Retailers",
    email: "m.vance@apexretail.com",
    phone: "+1 (555) 018-4521",
    value: 4500,
    status: "New",
    source: "Email Campaign",
    owner: "Alex Rivera",
    date: "2026-06-17",
    notes: "Responded to Summer Discount campaign. Needs pricing sheet."
  },
  {
    id: "lead-5",
    name: "Claire Beaumont",
    company: "Velo Logistics",
    email: "c.beaumont@velolog.fr",
    phone: "+33 1 47 20 18",
    value: 19500,
    status: "Won",
    source: "Direct Contact",
    owner: "Sophia Chen",
    date: "2026-05-20",
    notes: "Contract signed. Handed over to Customer Success team."
  },
  {
    id: "lead-6",
    name: "James O'Connor",
    company: "Dublin Capital",
    email: "joconnor@dublincap.ie",
    phone: "+353 1 496 0123",
    value: 15000,
    status: "Won",
    source: "LinkedIn",
    owner: "Marcus Johnson",
    date: "2026-05-28",
    notes: "Enterprise tier deal finalized. Annual contract."
  },
  {
    id: "lead-7",
    name: "Patricia Miller",
    company: "Summit Real Estate",
    email: "patricia.m@summitreal.com",
    phone: "+1 (555) 012-7744",
    value: 6000,
    status: "Lost",
    source: "Website",
    owner: "Alex Rivera",
    date: "2026-06-02",
    notes: "Budget constraints. Decided to stick with current manual process."
  },
  {
    id: "lead-8",
    name: "Hiroshi Tanaka",
    company: "Nippon Systems",
    email: "tanaka.h@nipponsys.co.jp",
    phone: "+81 3 5555 0143",
    value: 35000,
    status: "Qualified",
    source: "Referral",
    owner: "Sophia Chen",
    date: "2026-06-11",
    notes: "High value target. Needs support for Japanese localized data."
  },
  {
    id: "lead-9",
    name: "Rebecca Foster",
    company: "Nexus Media Corp",
    email: "rebecca@nexusmedia.com",
    phone: "+1 (555) 016-8899",
    value: 9800,
    status: "New",
    source: "LinkedIn",
    owner: "Marcus Johnson",
    date: "2026-06-18",
    notes: "Lead sourced from InMail campaign. Interested in team scheduling."
  },
  {
    id: "lead-10",
    name: "Sven Lindstrom",
    company: "Nordic Fintech Labs",
    email: "sven@nordicfintech.se",
    phone: "+46 8 123 4567",
    value: 28500,
    status: "Proposal Sent",
    source: "Email Campaign",
    owner: "Sophia Chen",
    date: "2026-06-08",
    notes: "Sent API documentation and custom SLA offer. Awaiting feedback."
  },
  {
    id: "lead-11",
    name: "Leila Al-Sabah",
    company: "Desert Bloom Tech",
    email: "leila@desertbloom.ae",
    phone: "+971 4 234 5678",
    value: 18000,
    status: "Contacted",
    source: "Other",
    owner: "Alex Rivera",
    date: "2026-06-15",
    notes: "Met at GITEX conference. Requested demo of team workspace features."
  },
  {
    id: "lead-12",
    name: "Oliver Thompson",
    company: "Zephyr Energy",
    email: "o.thompson@zephyrenergy.co.uk",
    phone: "+44 20 7946 0958",
    value: 11000,
    status: "Proposal Sent",
    source: "Direct Contact",
    owner: "Marcus Johnson",
    date: "2026-06-05",
    notes: "Demo delivered. Sent security questionnaire response."
  },
  {
    id: "lead-13",
    name: "Emma Watson",
    company: "Granger Consulting",
    email: "emma@grangerconsulting.com",
    phone: "+1 (555) 013-4411",
    value: 5200,
    status: "New",
    source: "Website",
    owner: "Alex Rivera",
    date: "2026-06-18",
    notes: "Submitted form via Contact Us page. Interested in trial account."
  },
  {
    id: "lead-14",
    name: "Robert Downey",
    company: "Stark Industries",
    email: "rdj@starkindustries.com",
    phone: "+1 (555) 300-3000",
    value: 99000,
    status: "Qualified",
    source: "Referral",
    owner: "Marcus Johnson",
    date: "2026-06-16",
    notes: "Sought custom cloud deployment. Critical importance."
  },
  {
    id: "lead-15",
    name: "Natasha Romanoff",
    company: "Shield Ops",
    email: "n.romanoff@shield.org",
    phone: "+1 (555) 911-0070",
    value: 22000,
    status: "Contacted",
    source: "Direct Contact",
    owner: "Sophia Chen",
    date: "2026-06-13",
    notes: "Slightly secretive requirements. Security and offline access are priorities."
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: "cust-1",
    name: "Claire Beaumont",
    company: "Velo Logistics",
    email: "c.beaumont@velolog.fr",
    phone: "+33 1 47 20 18",
    segment: "Enterprise",
    status: "Active",
    owner: "Sophia Chen",
    joinedDate: "2026-05-20",
    purchaseHistory: [
      { id: "p-1", product: "Nexus Enterprise Yearly", amount: 19500, date: "2026-05-20" }
    ],
    interactionHistory: [
      {
        type: "Meeting Notes",
        description: "Kickoff meeting completed. Set up workspace administration and invited 15 members.",
        timestamp: "2026-05-22 14:00"
      },
      {
        type: "Call Log",
        description: "Supported client with billing setup. Resolved issue with VAT details registration.",
        timestamp: "2026-05-25 10:15"
      },
      {
        type: "Email Log",
        description: "Sent onboarding checklist and user guides for CRM administrators.",
        timestamp: "2026-05-20 16:40"
      }
    ]
  },
  {
    id: "cust-2",
    name: "James O'Connor",
    company: "Dublin Capital",
    email: "joconnor@dublincap.ie",
    phone: "+353 1 496 0123",
    segment: "Enterprise",
    status: "Active",
    owner: "Marcus Johnson",
    joinedDate: "2026-05-28",
    purchaseHistory: [
      { id: "p-2", product: "Nexus Custom Bundle", amount: 15000, date: "2026-05-28" }
    ],
    interactionHistory: [
      {
        type: "Call Log",
        description: "Check-in call. CEO reported smooth usage and high sales rep adoption. No blockers.",
        timestamp: "2026-06-05 11:30"
      },
      {
        type: "Email Log",
        description: "Responded to custom data export query. Shared CSV and API documentation details.",
        timestamp: "2026-06-01 09:45"
      }
    ]
  },
  {
    id: "cust-3",
    name: "Thomas Shelby",
    company: "Shelby Exports Co.",
    email: "t.shelby@shelbyco.co.uk",
    phone: "+44 121 496 0199",
    segment: "Mid-Market",
    status: "Active",
    owner: "Alex Rivera",
    joinedDate: "2026-04-12",
    purchaseHistory: [
      { id: "p-3", product: "Nexus Professional Pro Plan", amount: 7200, date: "2026-04-12" },
      { id: "p-4", product: "SMS Integration Add-on", amount: 1200, date: "2026-05-01" }
    ],
    interactionHistory: [
      {
        type: "Meeting Notes",
        description: "Reviewed pipeline customization setup. Added custom columns and stages for export operations.",
        timestamp: "2026-04-15 15:00"
      },
      {
        type: "Follow-up History",
        description: "Followed up on SMS API configurations. Client verified texts are successfully triggering.",
        timestamp: "2026-05-02 12:00"
      }
    ]
  },
  {
    id: "cust-4",
    name: "Bruce Wayne",
    company: "Wayne Enterprises",
    email: "bruce@waynecorp.com",
    phone: "+1 (555) 777-8888",
    segment: "Enterprise",
    status: "Active",
    owner: "Marcus Johnson",
    joinedDate: "2026-01-15",
    purchaseHistory: [
      { id: "p-5", product: "Nexus Global Enterprise Contract", amount: 120000, date: "2026-01-15" }
    ],
    interactionHistory: [
      {
        type: "Meeting Notes",
        description: "Quarterly business review. Discussion about high-grade end-to-end encryption features.",
        timestamp: "2026-04-18 16:30"
      },
      {
        type: "Call Log",
        description: "Discussed security updates. Briefing on multi-region failover and compliance standards.",
        timestamp: "2026-06-12 10:00"
      }
    ]
  },
  {
    id: "cust-5",
    name: "Amara Okoye",
    company: "Lagos Tech Hub",
    email: "amara@lagostech.ng",
    phone: "+234 1 234 5678",
    segment: "SMB",
    status: "Active",
    owner: "Alex Rivera",
    joinedDate: "2026-03-10",
    purchaseHistory: [
      { id: "p-6", product: "Nexus Growth Plan", amount: 3600, date: "2026-03-10" }
    ],
    interactionHistory: [
      {
        type: "Call Log",
        description: "Initial setup support. Walked user through inviting teammates and installing browser extension.",
        timestamp: "2026-03-11 10:30"
      },
      {
        type: "Email Log",
        description: "Shared training video link and dashboard analytics setup guides.",
        timestamp: "2026-03-11 11:15"
      }
    ]
  },
  {
    id: "cust-6",
    name: "Linus Torvalds",
    company: "Kernel Foundation",
    email: "torvalds@kernel.org",
    phone: "+1 (555) 999-1991",
    segment: "SMB",
    status: "Inactive",
    owner: "Sophia Chen",
    joinedDate: "2025-11-01",
    purchaseHistory: [
      { id: "p-7", product: "Nexus Basic Tier", amount: 2400, date: "2025-11-01" }
    ],
    interactionHistory: [
      {
        type: "Email Log",
        description: "Client requested deletion of mailing lists. Task completed and confirmation sent.",
        timestamp: "2026-02-14 14:20"
      }
    ]
  }
];

export const INITIAL_TASKS = [
  {
    id: "task-1",
    title: "Send updated contract to Acme Dynamics",
    dueDate: "2026-06-18", // Sourced dynamically relative to current date (today)
    priority: "High",
    assignedTo: "Alex Rivera",
    status: "Pending",
    leadName: "Sarah Jenkins"
  },
  {
    id: "task-2",
    title: "Prepare presentation for cyber integration demo",
    dueDate: "2026-06-19",
    priority: "High",
    assignedTo: "Marcus Johnson",
    status: "Pending",
    leadName: "Elena Rostova"
  },
  {
    id: "task-3",
    title: "Follow up with David Chen on Biotech case studies",
    dueDate: "2026-06-18",
    priority: "Medium",
    assignedTo: "Sophia Chen",
    status: "Pending",
    leadName: "David Chen"
  },
  {
    id: "task-4",
    title: "Send pricing options sheet to Apex Retailers",
    dueDate: "2026-06-21",
    priority: "Low",
    assignedTo: "Alex Rivera",
    status: "Pending",
    leadName: "Marcus Vance"
  },
  {
    id: "task-5",
    title: "Overdue onboarding review for Velo Logistics",
    dueDate: "2026-06-15", // Overdue
    priority: "High",
    assignedTo: "Sophia Chen",
    status: "Pending",
    leadName: "Claire Beaumont"
  },
  {
    id: "task-6",
    title: "Update CRM custom tags list in administrator console",
    dueDate: "2026-06-25",
    priority: "Low",
    assignedTo: "Alex Rivera",
    status: "Completed"
  },
  {
    id: "task-7",
    title: "Quarterly billing reconciliation review",
    dueDate: "2026-06-18",
    priority: "Medium",
    assignedTo: "Marcus Johnson",
    status: "Pending"
  },
  {
    id: "task-8",
    title: "Call Robert Downey (Stark Industries) on private clouds",
    dueDate: "2026-06-19",
    priority: "High",
    assignedTo: "Marcus Johnson",
    status: "Pending",
    leadName: "Robert Downey"
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Task due today",
    message: "Alex: Send contract to Acme Dynamics is due by end of day.",
    type: "warning",
    time: "2 hours ago",
    read: false
  },
  {
    id: "notif-2",
    title: "Overdue tasks",
    message: "Sophia: Overdue task review is 3 days past due.",
    type: "error",
    time: "1 day ago",
    read: false
  },
  {
    id: "notif-3",
    title: "New lead added",
    message: "Emma Watson from Granger Consulting was added via Website.",
    type: "info",
    time: "4 hours ago",
    read: false
  },
  {
    id: "notif-4",
    title: "Deal won notification",
    message: "Velo Logistics deal was won! Revenue updated by +$19,500.",
    type: "success",
    time: "Yesterday",
    read: true
  }
];

export const TEAM_MEMBERS = [
  "Alex Rivera",
  "Sophia Chen",
  "Marcus Johnson"
];

// Helper to generate simulated activity heatmap data
// Generates counts for the last 365 days leading up to today.
export const generateActivityData = (currentDateStr = "2026-06-18", empty = false) => {
  const current = new Date(currentDateStr);
  const data = [];
  
  // Set random seed function to make activity counts realistic and consistent
  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  for (let i = 364; i >= 0; i--) {
    const d = new Date(current);
    d.setDate(current.getDate() - i);
    const dateString = d.toISOString().split("T")[0];
    
    // Create activity weight depending on day of week (less activity on weekends)
    const day = d.getDay();
    const isWeekend = day === 0 || day === 6;
    
    let count = 0;
    if (!empty) {
      const rand = random();
      if (!isWeekend) {
        if (rand > 0.85) count = Math.floor(rand * 6) + 3; // 3 to 8 activities (busy day)
        else if (rand > 0.4) count = Math.floor(rand * 3) + 1; // 1 to 3 activities
        else count = 0;
      } else {
        if (rand > 0.95) count = 1; // minor activity on weekend sometimes
      }
    }
    
    data.push({
      date: dateString,
      count: count
    });
  }
  
  return data;
};
