import { create } from 'zustand';

/**
 * Store quản lý trạng thái giao diện (UI) sử dụng Zustand
 */
export const useUIStore = create((set, get) => ({
  // Trạng thái
  sidebarOpen: false,
  theme: 'light',
  language: 'vi',
  notifications: [],
  modals: {},
  
  // Hành động
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setTheme: (theme) => set({ theme }),
  
  setLanguage: (language) => set({ language }),
  
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    // Tự động xóa thông báo sau khoảng thời gian duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  clearNotifications: () => set({ notifications: [] }),
  
  openModal: (modalId, props = {}) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: { isOpen: true, props }
      }
    }));
  },
  
  closeModal: (modalId) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: { isOpen: false, props: {} }
      }
    }));
  },
  
  // Getters (Hàm lấy dữ liệu)
  isModalOpen: (modalId) => {
    const { modals } = get();
    return modals[modalId]?.isOpen || false;
  },
  
  getModalProps: (modalId) => {
    const { modals } = get();
    return modals[modalId]?.props || {};
  },
  
  getNotificationCount: () => {
    const { notifications } = get();
    return notifications.length;
  }
}));
