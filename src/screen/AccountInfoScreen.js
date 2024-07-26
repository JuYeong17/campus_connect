import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const AccountInfoScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("user123");
  const [nickname, setNickname] = useState("홍길동");
  const [email, setEmail] = useState("honggildong@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("비밀번호 오류", "새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    // Here, you would typically make an API request to save the new account info
    Alert.alert("저장 완료", "계정 정보가 성공적으로 업데이트되었습니다.");
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>계정 정보 변경</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>아이디</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          editable={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          editable={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>현재 비밀번호</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>새 비밀번호</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>저장</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    marginTop : 40,
  },
  backIcon: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex : 1
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    borderColor: "#dcdcdc",
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: "#2c3e50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AccountInfoScreen;
