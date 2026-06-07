/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Check, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Layers,
  Building,
  User,
  Activity,
  HardDrive
} from "lucide-react";
import { UserProfile, UserTier } from "../types";

interface BillingSettingsProps {
  user: UserProfile;
  onUpgradeTier: (tier: UserTier) => Promise<void>;
  isLoading: boolean;
}

export default function BillingSettings({ user, onUpgradeTier, isLoading }: BillingSettingsProps) {
  const [successMsg, setSuccessMsg] = useState("");

  const handleTierUpgrade = async (tier: UserTier) => {
    try {
      await onUpgradeTier(tier);
      setSuccessMsg(`Successfully subscribed to ${tier} Tier!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const pricingTiers = [
    {
      name: UserTier.FREE,
      price: "$0",
      period: "forever",
      description: "Humble playground for individuals testing automated note transformations.",
      icon: <User className="w-5 h-5 text-gray-400" />,
      features: [
        "100 MB SaaS Cloud Storage",
        "Max 3 Learning Spaces",
        "Standard Gemini 3.5 Flash",
        "Context-Aware AI Tutor",
        "Interactive Mind Maps & Study guides",
        "Single User Workspace"
      ],
      colorClass: "border-cosmic-border bg-cosmic-card/45",
      btnLabel: "Current Plan",
      tierTag: UserTier.FREE
    },
    {
      name: UserTier.PRO,
      price: "$20",
      period: "user / month",
      description: "Advanced analytics and extensive storage limits for students, professionals.",
      icon: <Zap className="w-5 h-5 text-indigo-400 animate-bounce" />,
      features: [
        "2 GB SaaS Cloud Storage",
        "Unlimited Learning Spaces",
        "Exclusive Gemini 3.1 Pro Models",
        "Deep research grounded resources",
        "Complete Spanning Repeat decks",
        "Advanced Study Plan Visualizers",
        "Priority Customer Support"
      ],
      colorClass: "border-cosmic-accent/60 bg-gradient-to-b from-cosmic-card to-cosmic-accent/5",
      btnLabel: "Unlock Core Pro",
      tierTag: UserTier.PRO
    },
    {
      name: UserTier.ENTERPRISE,
      price: "$49",
      period: "user / month",
      description: "Dedicated knowledge bases and custom parameters for enterprises and firms.",
      icon: <Building className="w-5 h-5 text-amber-500 animate-pulse" />,
      features: [
        "100 GB Dedicated Team Storage",
        "Federated Team Management",
        "SSO Security & Active Directories",
        "Custom Fine-tuned Gemini nodes",
        "API tokens & direct webhook triggers",
        "Custom Training Onboarding modules",
        "Dedicated System SLA & Support"
      ],
      colorClass: "border-amber-500/40 bg-gradient-to-b from-cosmic-card to-amber-500/5",
      btnLabel: "Deploy SaaS Enterprise",
      tierTag: UserTier.ENTERPRISE
    }
  ];

  return (
    <div className="p-6 bg-cosmic-bg h-full overflow-y-auto space-y-7 flex flex-col font-sans" id="billing-limits-center">
      
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-cosmic-card/60 rounded-2xl border border-cosmic-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-cosmic-accent">
            <CreditCard className="w-5.3 h-5.3 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-base">Limits & Token Subscriptions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Maintain separate workspaces, modify storage capacity, or unlock model parameters.</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs animate-fade-in font-medium">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingTiers.map((tier, idx) => {
          const isActive = user.tier === tier.tierTag;
          return (
            <div 
              key={idx}
              className={`border-2 rounded-2xl p-5.5 flex flex-col justify-between shadow-xl transition-all relative ${tier.colorClass} ${
                isActive ? "ring-2 ring-cosmic-accent" : "hover:border-slate-800"
              }`}
            >
              {/* Active Badge */}
              {isActive && (
                <span className="absolute top-4 right-4 bg-indigo-600 text-white font-mono text-[9.5px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-md">
                   ACTIVE TIER
                </span>
              )}

              {/* Price Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-cosmic-bg/40 p-2.5 rounded-xl border border-cosmic-border/60 w-fit">
                  {tier.icon}
                  <span className="font-mono text-[11.5px] text-gray-300 font-bold tracking-wider">{tier.name}</span>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-display tracking-tight leading-none">{tier.price}</span>
                    <span className="text-gray-400 text-[11.5px] font-mono">/ {tier.period}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-2.5 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="pt-4 border-t border-cosmic-border/40 space-y-2.5">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block font-bold">Included features</span>
                  <ul className="space-y-2 text-xs">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-gray-300">
                        <Check className="w-3.5 h-3.5 mt-0.5 text-indigo-400 shrink-0" />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Activation action */}
              <div className="pt-6">
                <button
                  type="button"
                  disabled={isActive || isLoading}
                  onClick={() => handleTierUpgrade(tier.tierTag)}
                  className={`w-full py-2.8 rounded-xl text-xs font-semibold transiton-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                    isActive 
                      ? "bg-slate-800 border border-slate-700 text-gray-500 cursor-default" 
                      : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/10"
                  }`}
                >
                  {isActive ? "Currently Authenticated" : tier.btnLabel}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Limits breakdown section */}
      <div className="bg-cosmic-card border border-cosmic-border rounded-2xl p-5 space-y-4 shadow-xl">
        <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">Active SLA Limits Comparison</span>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="text-[10.5px] font-mono text-gray-500 border-b border-cosmic-border uppercase tracking-widest">
              <tr>
                <th className="pb-3 pr-4 font-bold">Subscription feature</th>
                <th className="pb-3 pr-4 font-bold">Free level</th>
                <th className="pb-3 pr-4 font-bold">Pro level</th>
                <th className="pb-3 font-bold">Enterprise level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cosmic-border/60">
              <tr>
                <td className="py-3 font-semibold text-white">SaaS Cloud storage</td>
                <td className="py-3">100 MB</td>
                <td className="py-3 text-indigo-400 font-semibold">2 GB</td>
                <td className="py-3 text-amber-500 font-semibold">100 GB</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Google Gemini Engine</td>
                <td className="py-3">Gemini 3.5 Flash</td>
                <td className="py-3 text-indigo-400 font-semibold">Gemini 3.1 Pro</td>
                <td className="py-3 text-amber-500 font-semibold">Custom Config / Private models</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Workspace scopes</td>
                <td className="py-3">Standard Personal</td>
                <td className="py-3 font-semibold">Unlimited Personal</td>
                <td className="py-3 text-amber-500 font-semibold">Consolidated Directories</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Security encryption</td>
                <td className="py-3">SaaS Isolation</td>
                <td className="py-3">Private Auth rules</td>
                <td className="py-3 text-amber-500 font-semibold">SSO Directory Integration</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
