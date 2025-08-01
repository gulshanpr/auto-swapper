import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import AutoRebalancingModal from "./modals/AutoRebalancingModal";

export default function ConnectWalletButton() {
  const { connectWallet } = usePrivy();
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  return (
    <>
      <button
        onClick={handleShowModal}
        className="bg-indigo-500 text-offwhite font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-102 cursor-pointer">
        Connect wallet
      </button>
      {showModal && <AutoRebalancingModal onClose={() => setShowModal(false)} />}
    </>
  );
}
