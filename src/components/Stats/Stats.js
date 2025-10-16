// components/Stats/Stats.js
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import styles from './Stats.module.css';

const Stats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.3 });

  const stats = [
    { number: 1247, label: "Items Found", suffix: "+" },
    { number: 96, label: "Success Rate", suffix: "%" },
    { number: 24, label: "Avg. Recovery Time", suffix: "hrs" },
    { number: 834, label: "Active Users", suffix: "+" }
  ];

  return (
    <section className={styles.stats} ref={ref}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.badge}>Our Impact</span>
          <h2 className={styles.title}>
            Trusted by students <span className={styles.highlight}>across campus</span>
          </h2>
        </motion.div>

        <motion.div 
          className={styles.grid}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <StatCard 
              key={index} 
              stat={stat} 
              index={index} 
              isInView={isInView} 
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const StatCard = ({ stat, index, isInView }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = stat.number / steps;
    const stepDelay = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCount(Math.min(Math.floor(stepValue * currentStep), stat.number));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setCount(stat.number);
      }
    }, stepDelay);

    return () => clearInterval(timer);
  }, [isInView, stat.number]);

  return (
    <motion.div 
      className={styles.statCard}
      initial={{ y: 50, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <div className={styles.statNumber}>
        {count}
        <span className={styles.suffix}>{stat.suffix}</span>
      </div>
      <div className={styles.statLabel}>{stat.label}</div>
    </motion.div>
  );
};

export default Stats;