import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from "react-native";

type Request = {
  id: string;
  student: string;
  topic: string;
};

export default function Requests() {

  const requests: Request[] = [
    { id: "1", student: "Ali", topic: "React Help" },
    { id: "2", student: "Ahmed", topic: "AI Guidance" },
  ];

  const handleAction = (type: string, name: string) => {
    Alert.alert(type, `${name} request ${type}`);
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Session Requests</Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Request }) => (

          <View style={styles.card}>

            <Text style={styles.name}>{item.student}</Text>
            <Text style={styles.topic}>{item.topic}</Text>

            <View style={styles.actions}>

              <TouchableOpacity
                style={styles.accept}
                onPress={() => handleAction("Accepted", item.student)}
              >
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reject}
                onPress={() => handleAction("Rejected", item.student)}
              >
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>

            </View>

          </View>

        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4EAD8"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 3
  },

  name: {
    fontWeight: "bold",
    fontSize: 16
  },

  topic: {
    marginTop: 5,
    color: "#555"
  },

  actions: {
    flexDirection: "row",
    marginTop: 10
  },

  accept: {
    backgroundColor: "green",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10
  },

  reject: {
    backgroundColor: "red",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold"
  }

});