import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import colors from "../src/theme/colors";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.replace("/role");
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/alumni-conflux-logo.jpeg")}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
    resizeMode: "contain",
  },
});
