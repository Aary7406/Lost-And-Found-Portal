// components/Features/Features.js
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import SearchIcon from '../Icons/SearchIcon';
import ReportIcon from '../Icons/ReportIcon';
import NotificationIcon from '../Icons/NotificationIcon';
import styles from './Features.module.css';

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.2 });

  const features = [
    {
      icon: <SearchIcon />,
      title: "Smart Search",
      description: "Advanced search algorithms help you find your lost items quickly with detailed filters and AI-powered matching.",
      color: "#cba6f7"
    },
    {
      icon: <ReportIcon />,
      title: "Easy Reporting",
      description: "Report lost or found items in seconds with our intuitive form and photo upload system.",
      color: "#89b4fa"
    },
    {
      icon: <NotificationIcon />,
      title: "Real-time Alerts",
      description: "Get instant notifications when someone finds your item or when you find a match for your lost belongings.",
      color: "#f5c2e7"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className={styles.features} ref={ref}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.badge}>Features</span>
          <h2 className={styles.title}>
            Everything you need to <span className={styles.highlight}>reunite</span> with your belongings
          </h2>
          <p className={styles.subtitle}>
            Our comprehensive platform makes losing and finding items a seamless experience
          </p>
        </motion.div>
        
        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className={styles.card}
              variants={cardVariants}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <div className={styles.cardGlow} style={{ '--glow-color': feature.color }} />
              <div className={styles.iconContainer} style={{ '--icon-color': feature.color }}>
                {feature.icon}
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;