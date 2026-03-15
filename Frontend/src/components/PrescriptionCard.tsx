import { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { useChronoStore } from '../store/useChronoStore';
import { SpotlightCard } from './ui/SpotlightCard';
import { AGE_CONTENT } from '../lib/api';
import { Download, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function PrescriptionCard() {
  const { chronotype, medications, ageGroup } = useChronoStore();
  const pdfRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const content = AGE_CONTENT[ageGroup ?? 'young-adult'];

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2, backgroundColor: '#020617' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [150, 90] });
      pdf.addImage(imgData, 'PNG', 0, 0, 150, 90);
      pdf.save(`ChronoRx_${chronotype}_Prescription.pdf`);
    } catch (e) {
      console.error(e);
    }
    setDownloading(false);
  };

  if (!chronotype) return null;

  return (
    <SpotlightCard className="p-0 overflow-hidden" glowColor="41, 121, 255">
      <div className="p-4 flex justify-between items-center border-b border-black/10 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neon-blue/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-neon-blue" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black dark:text-white">{content.prescTitle}</h3>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Scannable • Downloadable</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex items-center gap-1.5 bg-gradient-to-r from-neon-blue/20 to-neon-cyan/20 hover:from-neon-blue/30 hover:to-neon-cyan/30 text-neon-cyan px-3 py-1.5 rounded-lg transition-all text-xs font-semibold border border-neon-cyan/10"
        >
          {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          {downloading ? 'Exporting…' : 'PDF'}
        </motion.button>
      </div>

      <div className="p-5 relative overflow-hidden" ref={pdfRef} style={{ backgroundColor: '#020617' }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-neon-cyan/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-neon-blue/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-lg font-black text-white tracking-tighter neon-text">ChronoRx</div>
            <div className="text-neon-cyan font-mono text-[10px] mt-0.5 mb-4 uppercase tracking-widest font-bold">
              {chronotype} Protocol {ageGroup ? `• ${ageGroup.replace('-', ' ')}` : ''}
            </div>

            <div className="space-y-2.5">
              <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Regimen</div>
              {medications.length > 0 ? medications.map(med => (
                <div key={med.id} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-neon-green flex-shrink-0" />
                  <span className="text-white text-xs font-medium truncate">{med.name}</span>
                  <span className="text-slate-400 font-mono text-[10px] ml-auto flex-shrink-0">{med.optimalTimeWindow}</span>
                </div>
              )) : (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-neon-green" />
                    <span className="text-white text-xs font-medium">
                      {ageGroup === 'teen' ? 'Methylphenidate' : ageGroup === 'senior' ? 'Amlodipine' : 'Atorvastatin'}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] ml-auto">
                      {ageGroup === 'teen' ? '07:30' : ageGroup === 'senior' ? '22:00' : '22:00'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-neon-green" />
                    <span className="text-white text-xs font-medium">
                      {ageGroup === 'teen' ? 'Sertraline' : ageGroup === 'senior' ? 'Levothyroxine' : 'Lisinopril'}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] ml-auto">
                      {ageGroup === 'teen' ? '08:00' : ageGroup === 'senior' ? '06:30' : '06:00'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 bg-white/10 p-2 rounded-xl shadow-lg border border-white/10">
            <QRCodeSVG
              value={`https://chronorx.health/verify?c=${chronotype}&m=${medications.length}&g=${ageGroup}`}
              size={72} level="H" fgColor="#FFFFFF" bgColor="transparent"
            />
            <div className="text-center text-[7px] text-white/70 mt-1 font-black font-mono tracking-wider">VERIFY</div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/10 flex justify-between text-[8px] text-slate-400 font-mono tracking-wider">
          <span>ISSUED {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}</span>
          <span>CRX-DEMO-123</span>
        </div>
      </div>
    </SpotlightCard>
  );
}
