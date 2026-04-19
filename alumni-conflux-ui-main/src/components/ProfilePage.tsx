import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import NestedScreenHeader from "./NestedScreenHeader";
import colors from "../theme/colors";
import { FontSizes, Spacing } from "../../constants/theme";

export type ProfileView = "overview" | "editPersonal" | "editAcademic";

interface ProfilePageProps {
  currentView: ProfileView;
  loading: boolean;
  loadingText?: string;
  onViewChange: (view: ProfileView) => void;
  personalTitle: string;
  academicTitle: string;
  overviewContent: ReactNode;
  personalContent: ReactNode;
  academicContent: ReactNode;
  overviewContentStyle?: ViewStyle;
  editContentStyle?: ViewStyle;
  personalEditContentStyle?: ViewStyle;
  academicEditContentStyle?: ViewStyle;
}

export default function ProfilePage({
  currentView,
  loading,
  loadingText = "Loading profile...",
  onViewChange,
  personalTitle,
  academicTitle,
  overviewContent,
  personalContent,
  academicContent,
  overviewContentStyle,
  editContentStyle,
  personalEditContentStyle,
  academicEditContentStyle,
}: ProfilePageProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      </View>
    );
  }

  if (currentView === "editPersonal") {
    return (
      <View style={styles.container}>
        <NestedScreenHeader
          title={personalTitle}
          onBack={() => onViewChange("overview")}
        />
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.editContent,
            editContentStyle,
            personalEditContentStyle,
          ]}
        >
          {personalContent}
        </ScrollView>
      </View>
    );
  }

  if (currentView === "editAcademic") {
    return (
      <View style={styles.container}>
        <NestedScreenHeader
          title={academicTitle}
          onBack={() => onViewChange("overview")}
        />
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.editContent,
            editContentStyle,
            academicEditContentStyle,
          ]}
        >
          {academicContent}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.overviewContent, overviewContentStyle]}
      >
        {overviewContent}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.SM,
  },
  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: FontSizes.Base,
    color: colors.textLight,
  },
  overviewContent: {
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.LG,
    paddingBottom: Spacing.XXXL,
  },
  editContent: {
    paddingHorizontal: Spacing.LG,
    paddingVertical: Spacing.LG,
    paddingBottom: Spacing.XXXL,
  },
});
