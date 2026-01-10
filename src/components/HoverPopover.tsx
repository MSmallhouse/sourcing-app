'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ReactNode, useState } from 'react';

interface HoverPopoverProps {
  trigger: ReactNode; // The element that triggers the popover (e.g., an icon)
  content: ReactNode; // The content to display inside the popover
  className?: string; // Optional additional classes for the PopoverContent
}

export function HoverPopover({ trigger, content, className }: HoverPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setOpen((prev) => !prev)} // Toggle on click for mobile
      >
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`bg-slate-800 text-white border border-slate-700 shadow-md max-w-[90vw] p-2 rounded-md ${className}`}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}