import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import {
  Sprout,
  MapPinned,
  Handshake,
  CheckCircle,
} from 'lucide-react';

const stats = [
  { label: 'Petani Terbantu', value: 12000, icon: Sprout },
  { label: 'Lahan Terintegrasi (ha)', value: 4500, icon: MapPinned },
  { label: 'Mitra Korporat', value: 32, icon: Handshake },
  { label: 'Proyek Sukses', value: 120, icon: CheckCircle },
];

export default function StatsSection() {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <section className="bg-primary py-16">
      <div className="container mx-auto px-4 text-center" ref={ref}>
        <h2 className="text-3xl font-extrabold mb-12 text-white drop-shadow-lg">
          Capaian Kami
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 px-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2 }}
              >
                <Icon className="w-10 h-10 mx-auto mb-4 text-green-100" />
                <h3 className="text-4xl font-bold text-white drop-shadow-sm">
                  {inView && <CountUp end={stat.value} duration={2} separator="," />}
                </h3>
                <p className="mt-2 text-sm font-medium text-green-100">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}