import { Bot, KeyRound, Settings2 } from "lucide-react";

const data = [
  {
    heading: "1. Set Trade Rules",
    description:
      "Define your strategy with clear, simple parameters. E.g., “Swap 10% of my USDC to ETH every week.”",
    icon: <Settings2 className="w-8 h-8 text-indigo-400" />,
  },
  {
    heading: "2. Authorize Session Key",
    description:
      "Grant a temporary, sandboxed session key using EIP-7702. Your main key never leaves your wallet.",
    icon: <KeyRound className="w-8 h-8 text-purple-400" />,
  },
  {
    heading: "3. Let Backend Execute",
    description:
      "Our secure backend uses the session key to execute your swaps via the 1inch API, finding the best rates.",
    icon: <Bot className="w-8 h-8 text-pink-400" />,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">How It Works</h2>
          <p className="text-slate-400 mt-2">Automate your DeFi strategy in three simple steps.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {data.map((item, index) => (
            <div
              key={index}
              className="bg-[#161616] backdrop-blur-[10px] border border-neutral-600 p-5 lg:p-8 rounded-2xl">
              <div
                className={`flex justify-center items-center mb-4 w-16 h-16 rounded-full mx-auto ${
                  index === 0
                    ? "bg-indigo-900/50"
                    : index === 1
                    ? "bg-purple-900/50"
                    : "bg-pink-900/50"
                }`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.heading}</h3>
              <p className="text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;
