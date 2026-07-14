"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Yakin ingin menghapus?",
  description = "Tindakan ini tidak bisa dibatalkan.",
}: ConfirmModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="ease-in duration-150"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title className="text-lg font-bold text-gray-800">
                {title}
              </Dialog.Title>
              <div className="mt-2 text-sm text-gray-600">{description}</div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100"
                  onClick={onClose}
                >
                  Batal
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  Hapus
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
