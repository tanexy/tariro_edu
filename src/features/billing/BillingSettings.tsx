/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  CreditCard,
  Check,
  Zap,
  ShieldCheck,
  Globe,
  HardDrive,
  Clock,
  Sparkles,
  ArrowUpCircle
} from "lucide-react";
import { UserProfile, UserTier } from "../../types/index";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";

interface BillingSettingsProps {
  user: UserProfile;
  onUpgradeTier: (tier: UserTier) => void;
  isLoading: boolean;
}

export default function BillingSettings({
  user,
  onUpgradeTier,
  isLoading
}: BillingSettingsProps) {

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const storagePercentage = (user.storageUsed / user.storageLimit) * 100;

  return (
    <div className="p-8 space-y-12 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-h1">Account & Billing</h1>
        <p className="text-caption text-lg">Manage your subscription, usage limits, and platform security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Usage Stats */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-secondary/20 border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <HardDrive className="h-4 w-4" /> Storage Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{formatBytes(user.storageUsed)}</span>
                    <span className="text-muted-foreground">of {formatBytes(user.storageLimit)}</span>
                  </div>
                  <Progress value={storagePercentage} className="h-2" />
               </div>
               <p className="text-[10px] text-muted-foreground leading-relaxed">
                 Usage is calculated across all learning spaces and document assets in your active workspaces.
               </p>
            </CardContent>
            <CardFooter className="pt-0">
               <Button variant="outline" size="sm" className="w-full text-[10px] font-bold uppercase tracking-wider">
                 Manage Assets
               </Button>
            </CardFooter>
          </Card>

          <Card className="bg-secondary/20 border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-xs font-semibold">Two-factor authentication active</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-xs font-semibold">SSL Encryption verified</span>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Plans Grid */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-h2 text-xl">Available Plans</h2>
              <Badge variant="outline" className="font-mono text-[10px]">ANNUAL BILLING (20% OFF)</Badge>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pro Plan */}
              <Card className={`relative overflow-hidden flex flex-col border-2 ${user.tier === UserTier.PRO ? 'border-primary' : 'border-border'}`}>
                {user.tier === UserTier.PRO && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-tighter">
                    Active Plan
                  </div>
                )}
                <CardHeader>
                   <div className="h-10 w-10 rounded-xl bg-tariro-indigo/10 flex items-center justify-center mb-4">
                     <Zap className="h-6 w-6 text-tariro-indigo" />
                   </div>
                   <CardTitle className="text-2xl font-black">Pro</CardTitle>
                   <CardDescription>Perfect for individual students and researchers.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                   <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black">$19</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                   </div>
                   <ul className="space-y-3">
                      {[
                        "2GB AI Cloud Storage",
                        "Unlimited Learning Spaces",
                        "Priority Gemini 1.5 Access",
                        "Full Exam Intelligence Reports",
                        "Advanced Visual Maps"
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                   </ul>
                </CardContent>
                <CardFooter>
                   <Button
                    className="w-full gap-2"
                    variant={user.tier === UserTier.PRO ? "outline" : "primary"}
                    disabled={user.tier === UserTier.PRO || isLoading}
                    onClick={() => onUpgradeTier(UserTier.PRO)}
                   >
                     {user.tier === UserTier.PRO ? "Manage Subscription" : "Upgrade to Pro"}
                   </Button>
                </CardFooter>
              </Card>

              {/* Enterprise Plan */}
              <Card className={`relative overflow-hidden flex flex-col border-2 ${user.tier === UserTier.ENTERPRISE ? 'border-primary' : 'border-border'}`}>
                {user.tier === UserTier.ENTERPRISE && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-tighter">
                    Active Plan
                  </div>
                )}
                <CardHeader>
                   <div className="h-10 w-10 rounded-xl bg-tariro-purple/10 flex items-center justify-center mb-4">
                     <Globe className="h-6 w-6 text-tariro-purple" />
                   </div>
                   <CardTitle className="text-2xl font-black">Enterprise</CardTitle>
                   <CardDescription>Bespoke solutions for institutions and teams.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                   <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black">$99</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                   </div>
                   <ul className="space-y-3">
                      {[
                        "100GB Dedicated Storage",
                        "Team Collaboration Workspaces",
                        "SLA & Priority Support",
                        "Custom AI Model Tuning",
                        "API Access & Webhooks"
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                   </ul>
                </CardContent>
                <CardFooter>
                   <Button
                    className="w-full gap-2"
                    variant={user.tier === UserTier.ENTERPRISE ? "outline" : "primary"}
                    disabled={user.tier === UserTier.ENTERPRISE || isLoading}
                    onClick={() => onUpgradeTier(UserTier.ENTERPRISE)}
                   >
                     {user.tier === UserTier.ENTERPRISE ? "Contact Sales" : "Go Enterprise"}
                   </Button>
                </CardFooter>
              </Card>
           </div>

           {/* Comparison CTA */}
           <div className="bg-secondary/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                 <h4 className="font-bold text-sm">Need more storage?</h4>
                 <p className="text-xs text-muted-foreground">Custom storage addons are available for enterprise accounts.</p>
              </div>
              <Button variant="ghost" className="gap-2 text-xs font-bold uppercase tracking-widest">
                Compare All Features <ArrowUpCircle className="h-4 w-4" />
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
