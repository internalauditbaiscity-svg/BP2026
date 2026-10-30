import React, { useState } from 'react';
import { Bell, X, Send, AlertCircle, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PushAlert } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { notifications, broadcastNotification, markNotificationRead } = useData();
  const { isAdmin } = useAuth();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<PushAlert['priority']>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'broadcast'>('alerts');

  if (!isOpen) return null;

  const requestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('Bais City Batang Pinoy 2026', {
          body: 'Push notifications successfully enabled for real-time delegation alerts.',
        });
      }
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setIsSubmitting(true);
    try {
      await broadcastNotification(title.trim(), message.trim(), priority);
      setTitle('');
      setMessage('');
      setActiveTab('alerts');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Push & Delegation Alerts</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Account status & urgent delegation updates</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Push Permission Banner */}
        {'Notification' in window && Notification.permission !== 'granted' && (
          <div className="bg-amber-50 dark:bg-amber-950/40 px-4 py-2.5 border-b border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
            <span>Enable browser push notifications to receive real-time alerts.</span>
            <button
              onClick={requestPermission}
              className="px-2.5 py-1 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 shrink-0 text-xs"
            >
              Enable Push
            </button>
          </div>
        )}

        {/* Tab switch */}
        {isAdmin && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900 px-4 pt-2">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'alerts' 
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' 
                  : 'border-transparent text-slate-600 dark:text-slate-400'
              }`}
            >
              Alert Feed ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'broadcast' 
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' 
                  : 'border-transparent text-slate-600 dark:text-slate-400'
              }`}
            >
              📢 Broadcast Alert (Admin)
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'alerts' ? (
            notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No alerts at the moment.</p>
                <p className="text-xs">You're all caught up with Batang Pinoy updates.</p>
              </div>
            ) : (
              notifications.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => markNotificationRead(alert.id)}
                  className={`p-3.5 rounded-xl border text-sm transition-all ${
                    alert.priority === 'urgent'
                      ? 'bg-red-50/80 dark:bg-red-950/40 border-red-200 dark:border-red-900/60'
                      : alert.priority === 'high'
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {alert.priority === 'urgent' && <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
                      {alert.priority === 'high' && <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
                      {alert.priority === 'normal' && <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{alert.title}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {alert.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span>Sender: {alert.sender}</span>
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )
          ) : (
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Alert Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule Change: Taekwondo Weigh-in"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="normal">Normal Information</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent / Emergency / Curfew</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type clear instructions or announcements for the Bais City delegation..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Broadcasting...' : 'Broadcast Push Alert to Delegation'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
