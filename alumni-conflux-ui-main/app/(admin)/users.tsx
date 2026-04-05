import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { FontSizes, Spacing } from "../../constants/theme";
import { adminService } from "../../src/services/api";

type User = {
  id: number;
  fullName?: string;
  name?: string;
  email?: string;
  username?: string;
  role?: string;
};

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error("Fetch users error:", err);
      setError(err.message || "Failed to fetch users");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch users",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.fullName || user.name}?`,
      [
        { text: "Cancel", onPress: () => { } },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await adminService.deleteUser(user.id);
              setUsers(users.filter((u) => u.id !== user.id));
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "User deleted successfully",
              });
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to delete user",
              });
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: User }) => (
    <View key={item.id} style={styles.card}>
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.fullName || item.name || "N/A"}</Text>
        <Text style={styles.email}>{item.email || "N/A"}</Text>
        <Text style={styles.role}>{item.role || "N/A"}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const students = users.filter((u) => u.role === "STUDENT");
  const alumni = users.filter((u) => u.role === "ALUMNI");
  const admins = users.filter((u) => u.role === "ADMIN");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#F4EAD8" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage all platform users
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0F4C4F" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchUsers}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Students</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{students.length}</Text>
            </View>
          </View>
          {students.length > 0 ? (
            students.map((item) => renderItem({ item }))
          ) : (
            <Text style={styles.emptySectionText}>No students found</Text>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alumni</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{alumni.length}</Text>
            </View>
          </View>
          {alumni.length > 0 ? (
            alumni.map((item) => renderItem({ item }))
          ) : (
            <Text style={styles.emptySectionText}>No alumni found</Text>
          )}

          {admins.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Admins</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{admins.length}</Text>
                </View>
              </View>
              {admins.map((item) => renderItem({ item }))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4EAD8",
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.LG,
    paddingTop: 50,
    paddingBottom: Spacing.XL,
    gap: Spacing.MD,
    backgroundColor: "#0F4C4F",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(244, 234, 216, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(244, 234, 216, 0.3)",
  },
  headerContent: { flex: 1 },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 22,
    color: "#F4EAD8",
    fontWeight: "700",
  },
  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "rgba(244, 234, 216, 0.8)",
    marginTop: 4,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#0F4C4F",
  },

  errorText: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
  },

  retryBtn: {
    backgroundColor: "#0F4C4F",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },

  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },

  listContent: {
    paddingBottom: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F4C4F",
    marginRight: 10,
  },

  countBadge: {
    backgroundColor: "#0F4C4F",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  emptySectionText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },

  userInfo: {
    flex: 1,
  },

  name: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },

  email: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },

  role: {
    fontSize: 12,
    color: "#0F4C4F",
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    gap: 8,
  },

  editBtn: {
    backgroundColor: "#0F4C4F",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  deleteBtn: {
    backgroundColor: "red",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
