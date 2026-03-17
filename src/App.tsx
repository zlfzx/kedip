import { AnimatePresence, motion } from 'framer-motion';
import { useSessionStore } from './store/sessionStore';
import LandingPage from './components/LandingPage';
import LayoutPicker from './components/LayoutPicker';
import CameraView from './components/CameraView';
import PhotoStrip from './components/PhotoStrip';
import DownloadScreen from './components/DownloadScreen';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0] },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.2, ease: [0.4, 0.0, 1.0, 1.0] },
  },
};

export default function App() {
  const step = useSessionStore((s) => s.step);

  const renderStep = () => {
    switch (step) {
      case 'landing':     return <LandingPage />;
      case 'pick-layout': return <LayoutPicker />;
      case 'camera':      return <CameraView />;
      case 'review':      return <PhotoStrip />;
      case 'download':    return <DownloadScreen />;
      default:            return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
