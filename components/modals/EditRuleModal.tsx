import { useState } from "react";
import { X } from "lucide-react";

const EditRuleModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSave: (newRule: string) => void;
  currentRule: string;
}> = ({ show, onClose, onSave, currentRule }) => {
  const [rule, setRule] = useState(currentRule);

  if (!show) return null;

  const handleSave = () => {
    onSave(rule);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[10000] h-screen">
      <div className="bg-[#1e1e2f] backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl w-full max-w-md mx-4 p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Edit Swap Rule</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl font-light cursor-pointer">
            <X />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-white/70">Enter a new rule description below.</p>
          <input
            type="text"
            value={rule}
            onChange={(e) => setRule(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/30 focus:border-white/40 outline-none backdrop-blur-sm"
            placeholder="Enter your swap rule..."
          />
          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={onClose}
              className="text-white/70 font-semibold py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/20">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-500 backdrop-blur-sm text-white font-semibold py-2 px-5 rounded-lg shadow-lg hover:bg-indigo-800 transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRuleModal;
