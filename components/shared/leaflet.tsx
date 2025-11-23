import {
  useEffect,
  useRef,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  animate,
  spring,
} from "framer-motion";

export default function Leaflet({
  setShow,
  children,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
}) {
  const leafletRef = useRef<HTMLDivElement>(null);

  // Motion value used for animation
  const y = useMotionValue(1000); // Start off-screen

  const transitionProps = {
    stiffness: 500,
    damping: 30,
  };

  // Animate on mount
  useEffect(() => {
    animate(y, 20, { ...transitionProps, type: spring });
  }, []);

  async function handleDragEnd(_: any, info: any) {
    const offset = info.offset.y;
    const velocity = info.velocity.y;
    const height = leafletRef.current?.getBoundingClientRect().height || 0;

    if (offset > height / 2 || velocity > 800) {
      await animate(y, height, {
        ...transitionProps,
        type: spring,
      });
      setShow(false);
    } else {
      animate(y, 0, { ...transitionProps, type: spring });
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={leafletRef}
        key="leaflet"
        className="group fixed inset-x-0 bottom-0 z-40 w-screen cursor-grab bg-white pb-5 active:cursor-grabbing sm:hidden"
        style={{ y }}
        initial={false}
        drag="y"
        dragDirectionLock
        onDragEnd={handleDragEnd}
        dragElastic={{ top: 0, bottom: 1 }}
        dragConstraints={{ top: 0, bottom: 0 }}
      >
        <div className="rounded-t-4xl -mb-1 flex h-7 w-full items-center justify-center border-t border-gray-200">
          <div className="-mr-1 h-1 w-6 rounded-full bg-gray-300 transition-all group-active:rotate-12" />
          <div className="h-1 w-6 rounded-full bg-gray-300 transition-all group-active:-rotate-12" />
        </div>
        {children}
      </motion.div>

      <motion.div
        key="leaflet-backdrop"
        className="fixed inset-0 z-30 bg-gray-100 bg-opacity-10 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShow(false)}
      />
    </AnimatePresence>
  );
}
