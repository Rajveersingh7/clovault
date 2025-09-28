import React, {useState, createContext, useContext, ReactNode} from "react";

type NotificationType = "success" | "error";

type NotificationItem = {
  id: number;
  type: NotificationType;
  message: string;
};

type NotificationContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  notifications: NotificationItem[];
  removeNotification: (id: number) => void;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({children}: {children: ReactNode}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const addNotification = (
    type: NotificationType,
    message: string,
    duration = 5000
  ) => {
    const id = Date.now() + Math.random();
    const notification: NotificationItem = {id, type, message};
    setNotifications((prev) => [...prev, notification]);
    window.setTimeout(() => removeNotification(id), duration);
  };

  const clearNotifications = () => setNotifications([]);

  const showSuccess = (message: string) => addNotification("success", message);
  const showError = (message: string) => addNotification("error", message);

  const value: NotificationContextValue = {
    showSuccess,
    showError,
    notifications,
    removeNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({
  notifications,
  removeNotification
}: {
  notifications: NotificationItem[];
  removeNotification: (id: number) => void;
}) => {
  return (
    <div className="fixed top-20 md:top-22 left-2 right-2 sm:left-4 sm:right-auto z-50 max-w-full sm:max-w-sm">
      <div className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`alert pointer-events-auto transform transition-all duration-300 text-sm md:text-base ${
              notification.type === "success"
                ? "alert-success bg-green-100 border-green-500 text-green-700"
                : "alert-error bg-red-100 border-red-500 text-red-700"
            }`}
          >
            {notification.type === "success" ? (
              <svg
                className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            <span className="flex-1 break-words">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="btn btn-ghost btn-xs flex-shrink-0"
            >
              <svg
                className="w-3 h-3 md:w-4 md:h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
