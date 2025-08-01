import { Eye, ShieldCheck, Split, Zap } from "lucide-react";

const features = [
  {
    heading: "Budget Caps",
    description:
      "Set maximum spending limits to stay in control of your funds (e.g., $200/month max).",
    icon: <ShieldCheck className="w-8 h-8 text-green-400 mb-3" />,
  },
  {
    heading: "Gasless Swaps",
    description:
      "Utilize 1inch Fusion for gasless execution, protecting you from front-running and failed transactions.",
    icon: <Zap className="w-8 h-8 text-yellow-400 mb-3" />,
  },
  {
    heading: "SafeSplit Fallback",
    description:
      "Inactivity-based fallback mechanism to ensure your assets are always managed according to your rules.",
    icon: <Split className="w-8 h-8 text-blue-400 mb-3" />,
  },
  {
    heading: "Trade Simulation",
    description:
      "Preview your next scheduled trade and see the expected outcome before it happens.",
    icon: <Eye className="w-8 h-8 text-rose-400 mb-3" />,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-gray-900/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Smart Features, Full Control
          </h2>
          <p className="text-slate-400 mt-2">Powerful tools for sophisticated DeFi users.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#1a1d25] p-6 rounded-xl border border-gray-600 hover:bg-gray-800 transition-colors">
              {feature.icon}
              <h3 className="font-bold text-white text-lg">{feature.heading}</h3>
              <p className="text-slate-400 text-sm mt-1">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Features;
