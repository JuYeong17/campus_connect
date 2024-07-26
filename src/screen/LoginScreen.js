import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { loginUser } from '../api';

const LoginScreen = ({ navigation, setIsLoggedIn, setUserId }) => {
  const [userId, setUserIdInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await loginUser(userId, password);
      setIsLoggedIn(true);
      setUserId(response.user.id);
      navigation.navigate('Home');
    } catch (err) {
      console.error('Login failed:', err);
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <FontAwesome name="user-circle-o" size={100} color="#ffffff" style={styles.icon} />
      <Text style={styles.text}>로그인</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>아이디</Text>
        <TextInput
          style={styles.input}
          placeholder="아이디"
          placeholderTextColor="#ffffff"
          value={userId}
          onChangeText={setUserIdInput}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor="#ffffff"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.signupText}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3498db",
  },
  icon: {
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    marginBottom: 10,
  },
  label: {
    width: 80,
    fontSize: 16,
    color: "#ffffff",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#ffffff",
    paddingLeft: 10,
  },
  loginButton: {
    backgroundColor: "#f39c12",
    padding: 10,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  signupText: {
    marginTop: 20,
    color: "#ffffff",
    textDecorationLine: "underline",
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default LoginScreen;