'use client';

import { useRouter } from 'next/navigation';

export default function TransitionLink({ href, children, ...props }) {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    
    // Use View Transitions API if supported
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(() => {
        router.push(href);
      });
    } else {
      // Fallback to instant navigation
      router.push(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
