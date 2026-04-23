/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type ReactNode, type ChangeEvent } from 'react';
import { 
  FileText, 
  FlaskConical, 
  Activity, 
  Pill, 
  User, 
  Users, 
  X, 
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeMedicalReport } from './lib/gemini';

// Types
type ConsultationType = 'single' | 'team';
type CategoryType = 'reports' | 'lab' | 'radiology' | 'meds';

const CATEGORIES: Record<CategoryType, { title: string; desc: string }> = {
  reports: { title: 'رفع التقارير الطبية', desc: 'يمكنك رفع ملفات PDF أو صور (JPG, PNG).' },
  lab: { title: 'رفع تحاليل المختبر', desc: 'يمكنك رفع نتائج التحاليل كصور (JPG, PNG).' },
  radiology: { title: 'رفع صور الأشعة', desc: 'يمكنك رفع الأشعة السينية أو الرنين كصور (JPG, PNG).' },
  meds: { title: 'رفع الأدوية والوصفات', desc: 'يمكنك رفع الوصفات الطبية أو صور الأدوية (JPG, PNG).' },
};

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const openModal = (category: CategoryType) => {
    setSelectedCategory(category);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (!result) return;
      
      const base64Data = result.split(',')[1];
      const mimeType = file.type;

      try {
        const summary = await analyzeMedicalReport(base64Data, mimeType);
        setAnalysisResult(summary || "فشل تحليل المحتوى.");
      } catch (error) {
        setAnalysisResult(error instanceof Error ? error.message : "حدث خطأ غير متوقع.");
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.onerror = () => {
      setAnalysisResult("فشل قراءة الملف.");
      setIsAnalyzing(false);
    };

    reader.readAsDataURL(file);
  };

  const closeModal = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-cyan-50 pb-20" dir="rtl">
      {/* Header */}
      <header className="border-b border-gray-100 py-2 flex items-center justify-between px-8 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <a href="#" className="flex items-center">
            <img 
              src="https://i.ibb.co/svgWGGHk/Whats-App-Image-2025-11-27-at-12-20-28-PM-removebg-preview.png" 
              alt="Istishara Plus Logo" 
              className="h-[60px] w-auto transition-opacity hover:opacity-90"
              referrerPolicy="no-referrer"
            />
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
            <a href="#" className="hover:text-cyan-blue transition-colors">الرئيسية</a>
            <a href="#" className="hover:text-cyan-blue transition-colors">أطباؤنا</a>
            <button className="bg-red-orange text-white px-6 py-2 rounded-full hover:opacity-90 transition-all shadow-md">تسجيل الدخول</button>
          </nav>
        </div>
      </header>

      {/* Main Content with White Background for Contrast */}
      <div className="max-w-6xl mx-auto mt-12 bg-white rounded-[2.5rem] shadow-2xl shadow-cyan-900/5 overflow-hidden">
        <main className="px-6 py-16">
          {/* Welcome Section */}
          <section className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
              مرحباً بك في بوابتك الصحية الذكية
            </h2>
            <p className="text-slate-500 text-lg">
              قم برفع مستنداتك الطبية وسيقوم الذكاء الاصطناعي وفريقنا بمساعدتك.
            </p>
          </section>

          {/* Part 1: Organized Data Upload Areas */}
          <section className="mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <UploadZone 
                icon={<FileText className="w-6 h-6 text-cyan-blue" />}
                label="قسم التقارير الطبية"
                onUpload={() => openModal('reports')}
                id="medical-reports-zone"
                active
              />
              <UploadZone 
                icon={<FlaskConical className="w-6 h-6 text-cyan-blue" />}
                label="قسم تحاليل المختبر"
                onUpload={() => openModal('lab')} 
                id="lab-results-zone"
                active
              />
              <UploadZone 
                icon={<Activity className="w-6 h-6 text-cyan-blue" />}
                label="قسم صور الأشعة (X-Ray/MRI)"
                onUpload={() => openModal('radiology')}
                id="radiology-zone"
                active
              />
              <UploadZone 
                icon={<Pill className="w-6 h-6 text-cyan-blue" />}
                label="قسم الأدوية والوصفات"
                onUpload={() => openModal('meds')}
                id="medications-zone"
                active
              />
            </div>
          </section>

          {/* Part 2: Consultation Tier Selection */}
          <section className="mb-16">
            <h3 className="text-lg font-bold text-cyan-blue mb-6 text-center">
              اختر نوع الاستشارة المطلوبة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
              <ConsultationCard 
                isSelected={selectedConsultation === 'single'}
                onClick={() => setSelectedConsultation('single')}
                title="استشارة طبيب واحد"
                icon={<User className="w-8 h-8 text-cyan-blue" />}
                description="تحليل أساسي للحالة مع تشخيص مبدئي من قبل أخصائي معتمد."
                price="150 ر.س"
                id="consultation-single"
              />
              <ConsultationCard 
                isSelected={selectedConsultation === 'team'}
                onClick={() => setSelectedConsultation('team')}
                title="استشارة فريق طبي (حتى 4 أطباء)"
                icon={<Users className="w-8 h-8" />}
                description="للحالات المعقدة: تحليل شامل ومناقشة بين التخصصات المختلفة لضمان أدق النتائج."
                price="450 ر.س"
                id="consultation-team"
              />
            </div>
          </section>

          {/* Final Confirmation Button */}
          <div className="flex justify-center pt-8">
            <button 
              id="confirm-button"
              className="group bg-red-orange text-white px-12 py-3 rounded-xl font-bold text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              تأكيد الطلب والدفع
            </button>
          </div>
        </main>
      </div>

      {/* Footer Meta */}
      <footer className="mt-12 py-10 text-center">
        <p className="text-slate-400 text-sm">
          © 2024 استشارة بلس. منصة طبية معتمدة.
        </p>
      </footer>

      {/* Dynamic Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
              id="upload-modal"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-cyan-blue rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">{CATEGORIES[selectedCategory].title}</h2>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <p className="text-gray-500 mb-6">
                  {CATEGORIES[selectedCategory].desc}
                </p>

                {/* Drop Zone / File Input */}
                <div 
                  className="relative group border-2 border-dashed border-cyan-blue bg-cyan-blue/5 rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-blue/10 transition-all mb-6 text-center"
                >
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleUpload}
                    accept="image/jpeg, image/png, application/pdf"
                  />
                  <Upload className="w-10 h-10 text-cyan-blue mb-2" />
                  <p className="text-cyan-blue font-bold">انقر هنا لاختيار الملف</p>
                  <p className="text-xs text-gray-400 mt-1">أقصى حجم للملف: 10 ميجابايت (JPG, PNG, PDF)</p>
                </div>

                {/* AI Analysis Area */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-cyan-blue/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-cyan-blue rounded-full"></div>
                    </div>
                    <h3 className="text-sm font-bold text-gray-700">تحليل الذكاء الاصطناعي للملف</h3>
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-cyan-blue/10 animate-pulse">
                      <Activity className="w-5 h-5 text-cyan-blue animate-spin" />
                      <span className="text-sm text-gray-600">جاري التحليل...</span>
                    </div>
                  ) : analysisResult ? (
                    <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-cyan-blue/10">
                      <CheckCircle2 className="w-5 h-5 text-cyan-blue shrink-0" />
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-cyan-blue">تم المعالجة بنجاح</p>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {analysisResult}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      ارفع ملفاً لبدء التحليل.
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 pb-8 pt-0">
                <button 
                  onClick={closeModal}
                  className="w-full bg-red-orange text-white py-3 rounded-xl font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  تأكيد الرفع والمتابعة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components

function UploadZone({ icon, label, onUpload, id, active = false }: { icon: ReactNode, label: string, onUpload: () => void, id: string, active?: boolean }) {
  return (
    <div 
      id={id} 
      className={`rounded-xl p-5 flex flex-col items-center gap-3 shadow-sm text-center border transition-all duration-300 ${
        active 
        ? 'border-cyan-blue bg-cyan-blue/5' 
        : 'border-gray-100 bg-white opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${active ? 'bg-white' : 'bg-gray-50'}`}>
        {icon}
      </div>
      <span className="font-bold text-gray-800 text-sm whitespace-nowrap">{label}</span>
      <button 
        onClick={onUpload}
        disabled={!active}
        className={`${active ? 'bg-red-orange' : 'bg-gray-400'} text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-md hover:opacity-90 transition-all`}
      >
        رفع الملفات
      </button>
    </div>
  );
}

function ConsultationCard({ isSelected, onClick, title, icon, description, price, id }: { 
  isSelected: boolean, 
  onClick: () => void, 
  title: string, 
  icon: ReactNode, 
  description: string, 
  price: string,
  id: string
}) {
  const isTeam = title.includes('فريق');
  
  return (
    <div 
      id={id}
      onClick={onClick}
      className={`relative cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center group ${
        isSelected 
        ? 'border-cyan-blue bg-cyan-blue/5 shadow-lg' 
        : 'border-gray-100 bg-white hover:border-cyan-blue'
      }`}
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${
        isSelected && isTeam 
        ? 'bg-cyan-blue text-white' 
        : (isSelected ? 'bg-cyan-blue/20 text-cyan-blue' : 'bg-cyan-blue/10 text-cyan-blue')
      }`}>
        {icon}
      </div>
      <h4 className="font-bold text-xl mb-2 text-gray-800">{title}</h4>
      <p className="text-gray-500 text-sm mb-4 leading-relaxed">
        {description}
      </p>
      <span className="text-2xl font-bold text-cyan-blue">{price}</span>
      
      {isSelected && (
        <motion.div 
          layoutId="selection-check"
          className="absolute -top-3 -left-3 w-8 h-8 bg-cyan-blue rounded-full flex items-center justify-center text-white shadow-lg"
        >
          <CheckCircle2 className="w-5 h-5" />
        </motion.div>
      )}
    </div>
  );
}

