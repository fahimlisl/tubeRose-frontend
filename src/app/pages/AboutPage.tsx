import { motion } from 'motion/react';
import React from 'react';

export function AboutPage() {
  return (
    <div className="pt-24 pb-32 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-20"
        >
          <h1 className="text-5xl md:text-6xl mb-6">Our Story</h1>
          <p className="text-xl text-neutral-600">
            TubeRose was born from a commitment to clean, effective skincare that delivers real results without compromise.
          </p>
        </motion.div>

        {/* Image + Text Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative bg-neutral-100 aspect-[4/5]"
          >
            <img
              src="https://images.unsplash.com/photo-1772987714654-2df39af2c658?w=1080&q=80"
              alt="Our Story"
              className="size-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-3xl mb-6">Science Meets Nature</h2>
            <div className="space-y-4 text-neutral-600">
              <p>
                Every formula is backed by dermatological research and crafted with clean, natural ingredients. We partner with
                leading skincare experts to ensure our products deliver visible results while remaining gentle on your skin.
              </p>
              <p>
                From ingredient sourcing to packaging, sustainability is at our core. We're committed to cruelty-free,
                vegan formulations and recyclable materials because healthy skin shouldn't cost the planet.
              </p>
              <p>
                Our products are designed for real people with real skin concerns—whether you're dealing with acne,
                dryness, aging, or sensitivity, we have solutions that work.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          <div>
            <h3 className="text-xl mb-4">Clean Formula</h3>
            <p className="text-neutral-600">
              No harmful chemicals, parabens, or sulfates. Only clean, safe ingredients proven to nourish your skin.
            </p>
          </div>
          <div>
            <h3 className="text-xl mb-4">Dermatologist Tested</h3>
            <p className="text-neutral-600">
              Every product undergoes rigorous clinical testing to ensure efficacy and safety for all skin types.
            </p>
          </div>
          <div>
            <h3 className="text-xl mb-4">Cruelty-Free</h3>
            <p className="text-neutral-600">
              100% vegan and never tested on animals. Beauty should never come at the cost of compassion.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
