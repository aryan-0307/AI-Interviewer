import React from "react";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
      </div>
      
      <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
        <p>
          When you participate in an AI interview, we collect information you provide directly to us, including your name, email address, resume, and the audio/video/text data generated during the interview session.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
        <p>
          We use the information we collect to evaluate your technical skills, provide interview reports to the hiring team, and improve our AI models to ensure fairness and accuracy.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Data Security & Storage</h2>
        <p>
          Your interview data is encrypted at rest and in transit. We implement strict access controls and data minimization practices to ensure your privacy is protected.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Your Rights</h2>
        <p>
          Depending on your location, you may have the right to request access to, deletion of, or correction of your personal data. Please contact support to exercise these rights.
        </p>
      </div>
    </div>
  );
}
