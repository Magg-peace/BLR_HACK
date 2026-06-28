import React from "react";
import { Sparkles, Eye } from "lucide-react";

export default function ARVRLab() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" data-testid="arvr-lab">
      <div className="glass rounded-3xl p-10 max-w-lg text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#00D4FF] to-[#7C4DFF] flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(0,212,255,0.4)]">
          <Eye size={28} />
        </div>
        <div className="text-xs tracking-[0.3em] uppercase text-[#00D4FF] mb-3">
          WebXR Preview
        </div>
        <h2 className="font-display font-light text-3xl mb-3">AR / VR Lab</h2>
        <p className="text-white/65 text-sm leading-relaxed mb-6">
          Project the heart into your room with AR. Step into an immersive
          anatomy lab in VR. We're polishing the WebXR scenes — expect a beta
          launch shortly.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/55">
          <Sparkles size={12} /> Architecture ready · headset support coming soon
        </div>
      </div>
    </div>
  );
}
