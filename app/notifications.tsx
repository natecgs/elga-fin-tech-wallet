import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from './lib/theme';
import { useAuth } from './lib/AuthContext';
import apiClient from './lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color: string;
  read: boolean;
  time: string;
}

export default function NotificationsScreen() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [token]);

const fetchNotifications = async () => {
  try {
    setLoading(true);
    if (token) {
      apiClient.setToken(token);
    }
    const response = await apiClient.get('/notifications/list');
    if (response.data.success) {
      const notifData = response.data.data.map((notif: any) => ({
        ...notif,
        color: notif.type === 'alert' ? '#FF9800' : notif.type === 'success' ? COLORS.primary : '#2196F3',
        time: new Date(notif.created_at).toLocaleDateString(),
      }));
      setNotifications(notifData);
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  } finally {
    setLoading(false);
  }
};

const handleMarkAllAsRead = async () => {
  try {
    if (token) {
      apiClient.setToken(token);
    }
    await apiClient.post('/notifications/mark-all-read');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

const handleMarkAsRead = async (id: string) => {
  try {
    if (token) {
      apiClient.setToken(token);
    }
    await apiClient.post(`/notifications/${id}/read`);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  } catch (error) {
    console.error('Error marking as read:', error);
  }
};
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.screen}>
      {unreadCount > 0 && (
        <View style={styles.topBar}>
          <Text style={styles.unreadText}>{unreadCount} unread</Text>
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((notif) => (
          <TouchableOpacity
            key={notif.id}
            style={[styles.notifCard, !notif.read && styles.unreadCard]}
            onPress={() => handleMarkAsRead(notif.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.notifIcon, { backgroundColor: notif.color + '15' }]}>
              <Ionicons name={notif.icon} size={22} color={notif.color} />
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifHeader}>
                <Text style={[styles.notifTitle, !notif.read && styles.unreadTitle]}>
                  {notif.title}
                </Text>
                {!notif.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notifMessage} numberOfLines={2}>
                {notif.message}
              </Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={COLORS.neutral} />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  unreadText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: COLORS.primaryLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  notifMessage: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginTop: 4,
    lineHeight: 17,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.neutral,
    marginTop: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.neutral,
    marginTop: SPACING.md,
  },
});
