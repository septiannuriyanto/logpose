'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { Fragment } from 'react'

export default function DialogModal(
  {
    title,
    open,
    onClose,
    isLoading,
    children
  }: {
    title: string,
    open: boolean,
    onClose: () => void,
    isLoading: boolean,
    children: React.ReactNode
  }) {

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        onClose={() => {
          if (!isLoading) onClose()
        }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        {/* Center panel */}
        <div className="relative w-full max-w-md">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="bg-white rounded-lg shadow-lg p-6 space-y-4 focus:outline-none">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </DialogTitle>

              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
