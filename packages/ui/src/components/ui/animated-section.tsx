// src/components/ui/AnimatedSection.tsx
import { ReactNode, useEffect } from 'react';
import { motion, Variants, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// ====== BASIC FADE ANIMATIONS ======
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// ====== SLIDE ANIMATIONS ======
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const slideInBottom: Variants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// ====== SCALE ANIMATIONS ======
export const popUp: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1] // Spring-like effect
    }
  }
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1.36, 0.3, 1.16]
    }
  }
};

export const expand: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// ====== ROTATE ANIMATIONS ======
export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -15, scale: 0.9 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const flipIn: Variants = {
  hidden: { opacity: 0, rotateX: 90 },
  visible: {
    opacity: 1,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// ====== SPECIAL EFFECTS ======
export const zoomFromCenter: Variants = {
  hidden: { opacity: 0, scale: 1.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const blur: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// ====== STAGGERED ANIMATIONS ======
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// ====== MODAL/POPUP ANIMATIONS ======
export const modalAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

// ====== ATTENTION SEEKER ANIMATIONS ======
export const pulse: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      times: [0, 0.5, 1]
    }
  }
};

export const shake: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.6,
      times: [0, 0.2, 0.4, 0.6, 0.8, 1]
    }
  }
};

// ====== INFINITE ANIMATION FACTORIES ======
export const createPulse = (
  scale: [number, number] = [1, 1.05],
  duration = 1.5,
  baseVariants: Variants = fadeIn
): Variants => {
  const result: Variants = {
    ...baseVariants,
    infinite: {
      scale: scale[0],
      transition: {
        from: scale[1],
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  };
  return result;
};

export const createFloat = (
  y: [number, number] = [0, -10],
  duration = 2,
  baseVariants: Variants = fadeIn
): Variants => {
  const result: Variants = {
    ...baseVariants,
    infinite: {
      y: y[0],
      transition: {
        from: y[1],
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  };
  return result;
};

export const createBounce = (
  y: [number, number] = [0, -15],
  duration = 1,
  baseVariants: Variants = fadeIn
): Variants => {
  const result: Variants = {  
    ...baseVariants,
    infinite: {
      y: y[0],
      transition: {
        from: y[1],
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'circOut'
      }
    }
  };
  return result;
};

export const createSpin = (
  rotate: [number, number] = [0, 360],
  duration = 3,
  baseVariants: Variants = fadeIn
): Variants => {
  const result: Variants = {
    ...baseVariants,
    infinite: {
      rotate: rotate[1],
      transition: {
        from: rotate[0],
        duration,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };
  return result;
};

export const createBlink = (
  opacity: [number, number] = [1, 0.3],
  duration = 1,
  baseVariants: Variants = fadeIn
): Variants => {
  const result: Variants = {
    ...baseVariants,
    infinite: {
      opacity: opacity[0],
      transition: {
        from: opacity[1],
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  };
  return result;
};

export const createWave = (
  x: [number, number] = [-5, 5],
  duration = 1.5,
  baseVariants: Variants = fadeIn
): Variants => {
  const result: Variants = {
    ...baseVariants,
    infinite: {
      x: x[0],
      transition: {
        from: x[1],
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  };
  return result;
};

// ====== COMBINED INFINITE ANIMATIONS ======
export const floatAndPulse: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 }
  },
  infinite: {
    y: [-5, -15, -5],
    scale: [1, 1.03, 1],
    transition: {
      duration: 3,
      times: [0, 0.5, 1],
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const spinAndPulse: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 }
  },
  infinite: {
    rotate: 360,
    scale: [1, 1.1, 1],
    transition: {
      rotate: {
        duration: 8,
        repeat: Infinity,
        ease: 'linear'
      },
      scale: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  }
};

// Main component interface
interface AnimatedSectionProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  triggerOnce?: boolean;
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  delayChildren?: number;
  animateExit?: boolean;
  ease?: string | number[];
  infinite?: {
    enabled: boolean;
    type?: 'pulse' | 'float' | 'bounce' | 'spin' | 'blink' | 'wave' | 'floatAndPulse' | 'spinAndPulse';
    params?: {
      range?: [number, number];
      duration?: number;
    };
    delay?: number;
    playOnce?: boolean; // Only trigger infinite animation once when in view
  };
}

export const AnimatedSection = ({
  children,
  variants = fadeInUp,
  className = '',
  triggerOnce = true,
  threshold = 0.05,
  rootMargin = '100px 0px',
  delay = 0,
  duration,
  staggerChildren,
  delayChildren,
  animateExit = false,
  ease,
  infinite
}: AnimatedSectionProps) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: triggerOnce || (infinite?.playOnce === true),
    threshold,
    rootMargin,
  });

  // Process custom timing parameters
  let customVariants: Variants = { ...variants };
  
  if (duration || delay || ease) {
    const visibleTransition = customVariants.visible && 
      typeof customVariants.visible !== 'function' ? 
      customVariants.visible.transition || {} : 
      {};
    
    const visibleState = customVariants.visible && 
      typeof customVariants.visible !== 'function' ? 
      { ...customVariants.visible } : 
      {};
    
    customVariants = {
      ...customVariants,
      visible: {
        ...visibleState,
        transition: {
          ...visibleTransition,
          ...(duration && { duration }),
          ...(delay && { delay }),
          ...(ease && { ease })
        }
      }
    };
  }

  // Process stagger parameters
  if (staggerChildren || delayChildren) {
    const visibleTransition = customVariants.visible && 
      typeof customVariants.visible !== 'function' ? 
      customVariants.visible.transition || {} : 
      {};
    
    const visibleState = customVariants.visible && 
      typeof customVariants.visible !== 'function' ? 
      { ...customVariants.visible } : 
      {};
    
    customVariants = {
      ...customVariants,
      visible: {
        ...visibleState,
        transition: {
          ...visibleTransition,
          ...(staggerChildren && { staggerChildren }),
          ...(delayChildren && { delayChildren })
        }
      }
    };
  }

  // Process infinite animations
  if (infinite?.enabled) {
    const { type = 'pulse', params } = infinite;
    const range = params?.range || [0, 0];
    const animDuration = params?.duration || 2;
    
    let infiniteVariants: Variants;
    
    // Select or create the appropriate infinite animation
    switch (type) {
      case 'pulse':
        infiniteVariants = createPulse(range, animDuration, customVariants);
        break;
      case 'float':
        infiniteVariants = createFloat(range, animDuration, customVariants);
        break;
      case 'bounce':
        infiniteVariants = createBounce(range, animDuration, customVariants);
        break;
      case 'spin':
        infiniteVariants = createSpin(range, animDuration, customVariants);
        break;
      case 'blink':
        infiniteVariants = createBlink(range, animDuration, customVariants);
        break;
      case 'wave':
        infiniteVariants = createWave(range, animDuration, customVariants);
        break;
      case 'floatAndPulse':
        infiniteVariants = floatAndPulse;
        break;
      case 'spinAndPulse':
        infiniteVariants = spinAndPulse;
        break;
      default:
        infiniteVariants = createPulse(range, animDuration, customVariants);
    }
    
    customVariants = infiniteVariants;
  }

  useEffect(() => {
    if (inView) {
      controls.start('visible');
      
      if (infinite?.enabled) {
        const infiniteDelay = infinite.delay || 0;
        setTimeout(() => {
          controls.start('infinite');
        }, infiniteDelay * 1000);
      }
    } else if (!triggerOnce) {
      controls.start('hidden');
    }
  }, [inView, controls, triggerOnce, infinite]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={customVariants}
      exit={animateExit ? "exit" : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Define StaggeredList props interface
interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
  triggerOnce?: boolean;
  threshold?: number;
  infinite?: AnimatedSectionProps['infinite'];
}

// Staggered list component for lists with sequenced animations
export const StaggeredList = ({ 
  children, 
  className = '',
  staggerDelay = 0.1,
  initialDelay = 0,
  triggerOnce = true,
  threshold = 0.05,
  infinite
}: StaggeredListProps) => {
  const containerVariants = staggerContainer(staggerDelay, initialDelay);
  
  return (
    <AnimatedSection
      variants={containerVariants}
      className={className}
      triggerOnce={triggerOnce}
      threshold={threshold}
      infinite={infinite}
    >
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <motion.div key={index} variants={staggerItem}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={staggerItem}>{children}</motion.div>
      }
    </AnimatedSection>
  );
};

export interface AnimatedModalProps {
  children: ReactNode;
  isOpen: boolean;
  variants?: Variants;
  className?: string;
  onAnimationComplete?: () => void;
}

// Modal component with enter/exit animations
export const AnimatedModal = ({ 
  children, 
  isOpen, 
  variants = modalAnimation,
  className = '',
  onAnimationComplete,
}: AnimatedModalProps) => {
  return (
    <motion.div
      initial="hidden"
      animate={isOpen ? "visible" : "hidden"}
      exit="exit"
      variants={variants}
      className={className}
      onAnimationComplete={onAnimationComplete}
    >
      {children}
    </motion.div>
  );
};