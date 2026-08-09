import React from "react";
import { ShieldCheck } from "lucide-react";

export default function TermsOfConditions() {
  return (
    <div className="min-h-screen pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Terms of Conditions</h1>
      </div>
      
      <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing or using the AI Interviewer platform, you agree to be bound by these Terms of Conditions. If you disagree with any part of the terms, you may not access the service.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Description of Service</h2>
        <p>
          AI Interviewer provides an autonomous AI-driven assessment platform designed to evaluate candidate skills through interactive, simulated interview sessions.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">3. User Conduct</h2>
        <p>
          During the interview session, you agree to provide honest, original answers. Attempting to cheat, use unauthorized assistance, or bypass the platform's security mechanisms is strictly prohibited.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Intellectual Property</h2>
        <p>
          The AI Interviewer platform, including its original content, features, and functionality, are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
        </p>
      </div>
    </div>
  );
}
