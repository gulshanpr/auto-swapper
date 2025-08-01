import { Layers, Lock, Share2 } from "lucide-react";

const data = [
  {
    title: "Onchain Automation",
    description:
      "True, trustless automation with full user control, secured by the Ethereum blockchain.",
    icon: <Lock className="size-14 text-indigo-400 mx-auto mb-4" />,
  },
  {
    title: "Delegated Logic",
    description:
      "No more manual signing for every transaction. Set your logic once and let it run securely.",
    icon: <Share2 className="size-14 text-purple-400 mx-auto mb-4" />,
  },
  {
    title: "Top-Tier Tooling",
    description:
      "Built with the best DeFi primitives for maximum security, efficiency, and reliability.",
    icon: <Layers className="size-14 text-pink-400 mx-auto mb-4" />,
  },
];

const WhyItMatters = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Why It Matters</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {data.map((item, index) => (
            <div key={index} className="p-8">
              {item.icon}
              <h3 className="font-bold text-white text-lg">{item.title}</h3>
              <p className="text-slate-400 text-sm mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default WhyItMatters;
