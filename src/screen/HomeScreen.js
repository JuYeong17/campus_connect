import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, FlatList } from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation, route }) => {
  const [localIsLoggedIn, setLocalIsLoggedIn] = useState(false);
  const [localSelectedUniversity, setLocalSelectedUniversity] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (route.params?.isLoggedIn !== undefined) {
      setLocalIsLoggedIn(route.params.isLoggedIn);  
    }
  }, [route.params]);

  useEffect(() => {
    axios.get('http://13.125.20.36:3000/api/university')
      .then(response => {
        setUniversities(response.data);
        console.log(universities);
      })
      .catch(error => {
        console.error('Error fetching universities:', error);
      });
  }, []);

  useEffect(() => {
    // Fetch user info when logged in
    const fetchUserInfo = async () => {
      try {
        if (localIsLoggedIn) {
          const storedUserInfo = await AsyncStorage.getItem('userInfo');
          if (storedUserInfo) {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            setUserInfo(parsedUserInfo.user || {});
            
            console.log('Fetched user info:', userInfo); // Debug log
            
          } else {
            console.log('No user info found in AsyncStorage.');
          }
        } else {
          setUserInfo(null); // Set userInfo to null when not logged in
          console.log("if logout: ", userInfo);
        }
      } catch (error) {
        console.error('Error retrieving user info:', error);
      }
    };

    fetchUserInfo();
  }, [localIsLoggedIn]); // Refetch when login status changes

  // Handle user logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userInfo'); // Remove user info from AsyncStorage
      setUserInfo(null); // Clear the userInfo state
      setLocalIsLoggedIn(false); // Set login status to false      
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const selectUniversity = (univName) => {
    setLocalSelectedUniversity(univName);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("./cc.png")} style={styles.logo} />
      </View>

      {localIsLoggedIn ? (
        <Text style={styles.universityText}>{userInfo ? userInfo.univ_name : "로딩중..."}</Text>
      ) : (
        <View style={styles.pickerContainer}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.pickerButton}>
            <Text style={styles.pickerButtonText}>
              {localSelectedUniversity ? localSelectedUniversity : "대학을 선택하세요"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={universities}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => selectUniversity(item.univ_name)} style={styles.modalItem}>
                  <Text style={styles.modalItemText}>{item.univ_name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("JobBoard", { selectedUniversity: localSelectedUniversity })}
      >
        <Text style={styles.buttonText}>취업게시판</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SchoolLifeBoard", { userInfo })}
      >
        <Text style={styles.buttonText}>학교생활게시판</Text>
      </TouchableOpacity>

      <View style={styles.authTextContainer}>
        {localIsLoggedIn ? (
          <>
            <TouchableOpacity onPress={() => navigation.navigate("MyPage", {userInfo})}>
              <Text style={styles.authText}>마이페이지</Text>
            </TouchableOpacity>
            <Text style={styles.separator}> | </Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.authText}>로그아웃</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.authText}>로그인</Text>
            </TouchableOpacity>
            <Text style={styles.separator}> | </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.authText}>회원가입</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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
  logoContainer: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginBottom: 20,
    borderRadius: 75,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  pickerContainer: {
    width: "80%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
  pickerButton: {
    padding: 15,
    alignItems: "center",
  },
  pickerButtonText: {
    color: "#000",
  },
  button: {
    backgroundColor: "#f39c12",
    padding: 15,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 18,
  },
  authTextContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  authText: {
    color: "#ffffff",
    textDecorationLine: "underline",
  },
  separator: {
    color: "#ffffff",
    marginHorizontal: 10,
  },
  universityText: {
    fontSize: 18,
    color: "#ffffff",
    marginBottom: 20,
  },
  loginandoutText: {
    fontSize: 15,
    color: "#ffffff",
    margin: 7,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalItemText: {
    fontSize: 18,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#f39c12",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default HomeScreen;
