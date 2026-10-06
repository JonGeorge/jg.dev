'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'

type ZoomableImageProps = React.ImgHTMLAttributes<HTMLImageElement>

export function ZoomableImage({ alt, ...imgProps }: ZoomableImageProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="zoomable-image cursor-zoom-in"
        aria-label={alt ? `Enlarge image: ${alt}` : 'Enlarge image'}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={alt ?? ''} {...imgProps} />
      </button>

      <Dialog open={open} onClose={close} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/85 transition-opacity duration-200 ease-out data-[closed]:opacity-0"
        />

        <DialogPanel
          transition
          onClick={close}
          className="fixed inset-0 flex items-center justify-center p-4 sm:p-8 cursor-zoom-out transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 h-10 w-10 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer text-2xl leading-none"
          >
            &times;
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={alt ?? ''}
            {...imgProps}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
        </DialogPanel>
      </Dialog>
    </>
  )
}
