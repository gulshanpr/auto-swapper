import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EditRuleModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (newRule: string) => void;
  currentRule: string;
}> = ({ open, onClose, onSave, currentRule }) => {
  const [rule, setRule] = useState(currentRule);

  const handleSave = () => {
    onSave(rule);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#232323] backdrop-blur-lg border border-white/20 shadow-2xl text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Edit Swap Rule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-white/70">Enter a new rule description below.</p>
          <Input
            type="text"
            value={rule}
            onChange={(e) => setRule(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/30 focus:border-white/40 outline-none backdrop-blur-sm"
            placeholder="Enter your swap rule..."
          />
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="text-white/70 font-semibold py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/20 bg-transparent hover:text-offwhite">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-indigo-500 backdrop-blur-sm text-white font-semibold py-2 px-5 rounded-lg shadow-lg hover:bg-indigo-800 transition-all">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRuleModal;
