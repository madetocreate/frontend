import { motion } from "framer-motion";
import { 
  SparklesIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon, 
  BoltIcon, 
  CpuChipIcon,
  LightBulbIcon,
  CodeBracketIcon,
  PencilSquareIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";

export function ChatOverviewWidget() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 p-1"
    >
      {/* Section 1: Hero / AI Status */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative overflow-hidden p-6 bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] group hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -z-10 opacity-60 transition-opacity group-hover:opacity-80" />
        
        <div className="flex items-center justify-between mb-6">
            <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <SparklesIcon className="w-4 h-4" />
                </span>
                AI Assistent
            </h4>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Online
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-default group/item">
                <div className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                    <ChatBubbleLeftRightIcon className="w-3 h-3" />
                    Interaktionen
                </div>
                <div className="text-2xl font-bold text-gray-900 group-hover/item:text-indigo-600 transition-colors">48</div>
                <div className="text-[10px] text-green-600 font-medium mt-1">+12% heute</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-default group/item">
                <div className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                    <BoltIcon className="w-3 h-3" />
                    Reaktionszeit
                </div>
                <div className="text-2xl font-bold text-gray-900 group-hover/item:text-indigo-600 transition-colors">24ms</div>
                <div className="text-[10px] text-gray-400 font-medium mt-1">Turbo Mode</div>
            </div>
        </div>
      </motion.div>

      {/* Section 2: Capabilities / Modes */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h4 className="text-sm font-semibold text-gray-900 mb-4 px-1 flex items-center gap-2">
            <CpuChipIcon className="w-4 h-4 text-gray-400" />
            Modi & Fähigkeiten
        </h4>
        <div className="grid grid-cols-1 gap-3">
            {[
                { label: 'Code Expert', desc: 'Refactoring & Architektur', color: 'bg-blue-50 text-blue-600', icon: CodeBracketIcon },
                { label: 'Creative Writer', desc: 'Marketing & Content', color: 'bg-purple-50 text-purple-600', icon: PencilSquareIcon },
                { label: 'Strategist', desc: 'Analyse & Planung', color: 'bg-amber-50 text-amber-600', icon: LightBulbIcon },
            ].map((mode, i) => (
                <button key={i} className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all text-left group">
                    <div className={`w-12 h-12 rounded-xl ${mode.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <mode.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors">{mode.label}</div>
                        <div className="text-xs text-gray-500">{mode.desc}</div>
                    </div>
                </button>
            ))}
        </div>
      </motion.div>

      {/* Section 3: Recent Chats / History */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex-1"
      >
        <div className="flex items-center justify-between mb-4 px-1">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                Letzte Chats
            </h4>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors">
                Alle
            </button>
        </div>
        <div className="space-y-3">
            {[
                { title: 'Landing Page Copy', time: 'Vor 10 Min', preview: 'Hier sind 3 Varianten für...' },
                { title: 'React Bugfix', time: 'Vor 2 Std', preview: 'Der useEffect Hook wird...' },
                { title: 'Q1 Marketing Strategie', time: 'Gestern', preview: 'Basierend auf den Zielen...' }
            ].map((chat, i) => (
                <div key={i} className="group flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100/50 transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{chat.title}</p>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{chat.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{chat.preview}</p>
                    </div>
                    <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
