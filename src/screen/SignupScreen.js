import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Modal from 'react-native-modal';
import { registerUser, getUniversities } from '../api';

const SignupScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [schools, setSchools] = useState([]);
  const [authMethod, setAuthMethod] = useState('');
  const [error, setError] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await getUniversities();
        setSchools(response);
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
    };

    fetchSchools();
  }, []);

  const handleSignup = async () => {
    try {
      const selectedSchoolName = schools.find(school => school.id === selectedSchool).univ_name;
      const user = {
        user_id: userId,
        nickname,
        email,
        password,
        university_id: selectedSchool, // 실제 학교 ID로 설정
        univ_name: selectedSchoolName, // 선택한 학교 이름
        points: 0 // 초기 포인트
      };
      const response = await registerUser(user);
      navigation.navigate('Home');
    } catch (err) {
      console.error('Signup failed:', err);
      setError('회원가입에 실패했습니다. 입력 정보를 확인해주세요.');
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleSelectSchool = (schoolId) => {
    setSelectedSchool(schoolId);
    toggleModal();
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <Text style={styles.text}>회원가입</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>아이디</Text>
            <TextInput
              style={styles.input}
              placeholder="아이디"
              placeholderTextColor="#ffffff"
              value={userId}
              onChangeText={setUserId}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.input}
              placeholder="닉네임"
              placeholderTextColor="#ffffff"
              value={nickname}
              onChangeText={setNickname}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor="#ffffff"
              value={email}
              onChangeText={setEmail}
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

          <View style={styles.separator} />

          <View style={styles.pickerContainer}>
            <TouchableOpacity onPress={toggleModal} style={styles.pickerButton}>
              <Text style={styles.pickerButtonText}>
                {selectedSchool ? schools.find(school => school.id === selectedSchool).univ_name : "학교를 선택하세요"}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal isVisible={isModalVisible}>
            <View style={styles.modalContent}>
              {schools.map((school) => (
                <TouchableOpacity key={school.id} onPress={() => handleSelectSchool(school.id)}>
                  <Text style={styles.modalItem}>{school.univ_name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={toggleModal} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <View style={styles.authMethodContainer}>
            <Text style={styles.label}>인증 방법 </Text>
            <View style={styles.authBox}>
              <TouchableOpacity
                style={[
                  styles.authButton,
                  authMethod === "합격자 인증" && styles.authButtonSelected,
                ]}
                onPress={() => setAuthMethod("합격자 인증")}
              >
                <Text
                  style={[
                    styles.authButtonText,
                    authMethod === "합격자 인증" &&
                      styles.authButtonTextSelected,
                  ]}
                >
                  합격자 인증
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.authButton,
                  authMethod === "재학생 인증" && styles.authButtonSelected,
                ]}
                onPress={() => setAuthMethod("재학생 인증")}
              >
                <Text
                  style={[
                    styles.authButtonText,
                    authMethod === "재학생 인증" &&
                      styles.authButtonTextSelected,
                  ]}
                >
                  재학생 인증
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.authButton,
                  authMethod === "졸업생 인증" && styles.authButtonSelected,
                ]}
                onPress={() => setAuthMethod("졸업생 인증")}
              >
                <Text
                  style={[
                    styles.authButtonText,
                    authMethod === "졸업생 인증" &&
                      styles.authButtonTextSelected,
                  ]}
                >
                  졸업생 인증
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleSignup}
          >
            <Text style={styles.completeButtonText}>완료</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginText}>로그인</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#f39c12",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%", // 전체 너비를 사용
    paddingHorizontal: 20, // 양쪽에 패딩 추가
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff", // 흰색 글자
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%", // 전체 너비를 사용
  },
  label: {
    fontSize: 18,
    color: "#ffffff",
    width: "30%", // 라벨 너비 조정
    textAlign: "left", // 좌측 정렬
  },
  input: {
    width: "70%", // 입력 요소 너비 조정
    height: 40,
    backgroundColor: "#ffffff", // 흰색 배경
    paddingLeft: 10,
  },
  separator: {
    borderBottomColor: "#ffffff",
    borderBottomWidth: 1,
    width: "100%",
    marginBottom: 10,
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 10,
  },
  pickerButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  pickerButtonText: {
    color: "#000000",
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalItem: {
    fontSize: 18,
    paddingVertical: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#3498db",
    borderRadius: 5,
  },
  modalCloseButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  authMethodContainer: {
    width: "100%",
    marginBottom: 10,
  },
  authBox: {
    marginTop: 10,
    backgroundColor: "#bdc3c7",
    padding: 10,
    borderRadius: 5,
  },
  authButton: {
    backgroundColor: "#ecf0f1",
    padding: 10,
    marginVertical: 5,
    alignItems: "center",
    borderRadius: 5,
  },
  authButtonSelected: {
    backgroundColor: "#2980b9",
  },
  authButtonText: {
    color: "#2c3e50",
  },
  authButtonTextSelected: {
    color: "#ffffff",
  },
  completeButton: {
    backgroundColor: "#3498db",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  completeButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  loginText: {
    marginTop: 20,
    color: "#ffffff",
    textDecorationLine: "underline",
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default SignupScreen;
