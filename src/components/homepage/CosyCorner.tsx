const products = [
  {
    name: "Warm Glow Desk Lamp",
    price: "£34",
    retailer: "Amazon",
    gradient: "from-[#c95d0d] to-[#f59e0b]",
  },
  {
    name: "Cloud9 Wrist Rest",
    price: "£18",
    retailer: "Etsy",
    gradient: "from-[#52b788] to-[#2d6a4f]",
  },
  {
    name: "Cosy Cat Headphone Stand",
    price: "£22",
    retailer: "Etsy",
    gradient: "from-[#a78bfa] to-[#7c3aed]",
  },
  {
    name: "Quiet Mechanical Keyboard",
    price: "£72",
    retailer: "Amazon",
    gradient: "from-[#1e1a14] to-[#374151]",
  },
  {
    name: "Pixel Art Desk Mat",
    price: "£29",
    retailer: "Etsy",
    gradient: "from-[#137034] to-[#52b788]",
  },
];

const CosyCorner = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
      {/* Section header */}
      <h2 className="text-3xl md:text-4xl font-bold text-foreground">
        Build your cosy gaming corner
      </h2>
      <p className="text-muted-foreground mt-2 mb-10">
        Hand-picked gear for the right atmosphere. Budget options always
        included.
      </p>

      {/* Horizontal scroll row */}
      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
        {products.map((product) => (
          <div
            key={product.name}
            className="min-w-[240px] flex-shrink-0 rounded-2xl overflow-hidden bg-white shadow-sm"
          >
            {/* Gradient image area */}
            <div
              className={`aspect-[4/3] bg-gradient-to-br ${product.gradient}`}
            />

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-foreground text-sm">
                {product.name}
              </h3>
              <p className="text-foreground font-semibold mt-1">
                {product.price}
              </p>
              <span className="text-[10px] bg-muted/40 text-muted-foreground px-2 py-0.5 rounded-full inline-block mt-2">
                {product.retailer}
              </span>
              <a
                href="#"
                className="text-xs text-brand-green font-semibold mt-3 block hover:underline"
              >
                View on {product.retailer} →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CosyCorner;
